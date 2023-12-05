import { BaseException } from '@lomray/microservice-nodejs-lib';
import type StripeSdk from 'stripe';
import remoteConfig from '@config/remote';
import StripePaymentMethods from '@constants/stripe-payment-methods';
import TaxBehaviour from '@constants/tax-behaviour';
import TransactionRole from '@constants/transaction-role';
import getPercentFromAmount from '@helpers/get-percent-from-amount';
import type IFees from '@interfaces/fees';
import type ITax from '@interfaces/tax';
import type ITaxes from '@interfaces/taxes';

interface IGetPaymentIntentTaxParams {
  processingTransactionAmountUnit: number;
  paymentMethodId: string;
  entityId: string;
  feesPayer: TransactionRole;
}

interface IComputePaymentIntentTaxParams {
  amountUnit: number;
  paymentMethodId: string;
  entityId: string;
  behaviour?: TaxBehaviour;
  shouldIgnoreNotCollecting?: boolean;
}

interface IGetStripeFeeAndProcessingAmountParams {
  amountUnit: number;
  feesPayer: TransactionRole;
}

interface IPaymentIntentTax extends Pick<ITaxes, 'autoCalculateFeeUnit'> {
  tax: ITax;
  createTaxTransactionFeeUnit: number;
}

/**
 * Stripe calculation service
 */
class Calculation {
  /**
   * Returns Stripe fee
   */
  public static async getStripeFeeAndProcessingAmount({
    amountUnit,
    feesPayer,
  }: IGetStripeFeeAndProcessingAmountParams): Promise<{
    stripeFeeUnit: number;
    processingAmountUnit: number;
  }> {
    const { fees } = await remoteConfig();
    const { paymentPercent, stablePaymentUnit } = fees as IFees;

    if (feesPayer === TransactionRole.SENDER) {
      const processingAmountUnit = Math.round(
        (amountUnit + stablePaymentUnit) / (1 - paymentPercent / 100),
      );

      return { processingAmountUnit, stripeFeeUnit: processingAmountUnit - amountUnit };
    }

    const stripeFeeUnit = getPercentFromAmount(amountUnit, paymentPercent) + stablePaymentUnit;

    return { processingAmountUnit: amountUnit - stripeFeeUnit, stripeFeeUnit };
  }

  /**
   * Returns payment intent tax
   */
  public static async getPaymentIntentTax(
    sdk: StripeSdk,
    {
      processingTransactionAmountUnit,
      entityId,
      paymentMethodId,
      feesPayer,
    }: IGetPaymentIntentTaxParams,
  ): Promise<IPaymentIntentTax> {
    const { taxes } = await remoteConfig();
    const { stableUnit, autoCalculateFeeUnit } = taxes as ITaxes;

    const tax = await this.computePaymentIntentTax(sdk, {
      entityId,
      amountUnit:
        // If sender cover fees, Stripe Tax calculate fee should be included into the precessing amount
        feesPayer === TransactionRole.SENDER
          ? processingTransactionAmountUnit + stableUnit
          : processingTransactionAmountUnit,
      paymentMethodId,
    });

    return { tax, createTaxTransactionFeeUnit: stableUnit, autoCalculateFeeUnit };
  }

  /**
   * Compute transaction tax
   * @description NOTE: Customer SHOULD HAVE address details - at least postal code
   * One this api call cost is $0.05 - DO NOT ALLOW user call this method in depth
   */
  private static async computePaymentIntentTax(
    sdk: StripeSdk,
    {
      amountUnit,
      paymentMethodId,
      entityId,
      behaviour = TaxBehaviour.EXCLUSIVE,
      shouldIgnoreNotCollecting = false,
    }: IComputePaymentIntentTaxParams,
  ): Promise<ITax> {
    /**
     * Get payment method data
     */
    const paymentMethod = await sdk.paymentMethods.retrieve(paymentMethodId, {
      expand: [StripePaymentMethods.CARD],
    });

    /* eslint-disable camelcase */
    const { postal_code, country } = paymentMethod?.billing_details?.address || {};

    if (!postal_code || !country) {
      throw new BaseException({
        status: 500,
        message:
          'For tax calculation, a payment method must include, at a minimum, the postal code and country information.',
      });
    }

    const tax = await sdk.tax.calculations.create({
      currency: 'usd',
      line_items: [
        {
          amount: amountUnit,
          reference: entityId,
          tax_behavior: behaviour,
          quantity: 1,
        },
      ],
      customer_details: {
        address: {
          country,
          postal_code,
        },
        address_source: 'billing',
      },

      expand: ['line_items.data.tax_breakdown'],
    });
    /* eslint-enable camelcase */

    /**
     * @TODO: Fix. This property exist in response, but sdk type - not
     */
    if (
      // @ts-ignore
      tax?.tax_breakdown?.some((breakdown) => breakdown?.taxability_reason === 'not_collecting') &&
      !shouldIgnoreNotCollecting
    ) {
      /**
       * @TODO: CHECK how to prevent register user tax from not collecting registration
       */
      throw new BaseException({
        status: 500,
        message: 'Failed to compute tax. One or more tax breakdown is not collecting.',
        payload: tax?.tax_breakdown,
      });
    }

    const totalAmountUnit = tax?.line_items?.data?.reduce(
      (total, { amount_tax: amountTax }) => total + amountTax,
      0,
    );
    const totalTaxPercent = tax?.tax_breakdown?.reduce(
      (total, { tax_rate_details: details }) => total + (Number(details?.percentage_decimal) || 0),
      0,
    );

    if (
      !tax.id ||
      !tax.expires_at ||
      typeof totalAmountUnit !== 'number' ||
      typeof totalTaxPercent !== 'number'
    ) {
      throw new BaseException({
        status: 500,
        message: 'Failed to compute tax. Tax is invalid.',
        payload: {
          taxId: tax.id,
          expireAt: tax.expires_at,
          amountUnit: totalAmountUnit,
        },
      });
    }

    return {
      id: tax.id,
      totalAmountUnit,
      totalTaxPercent,
      behaviour,
      transactionAmountWithTaxUnit: tax.amount_total,
      createdAt: new Date(tax.tax_date),
      expiresAt: new Date(tax.expires_at),
    };
  }
}

export default Calculation;
