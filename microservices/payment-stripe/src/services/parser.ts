import { Log } from '@lomray/microservice-helpers';
import DisputeReason from '@constants/dispute-reason';
import StripeDisputeReason from '@constants/stripe-dispute-reason';
import StripeTransactionStatus from '@constants/stripe-transaction-status';
import TransactionStatus from '@constants/transaction-status';

declare function assert(status: never): never;

/**
 * Stripe data parser
 * @description Parse Stripe data for readable microservices view format.
 * Decomposed payment stripe logic
 */
class Parser {
  /**
   * Parse Stripe dispute reason
   */
  public static parseStripeDisputeReason(stripeReason: StripeDisputeReason): DisputeReason {
    switch (stripeReason) {
      case StripeDisputeReason.BANK_CANNOT_PROCESS:
        return DisputeReason.BANK_CANNOT_PROCESS;

      case StripeDisputeReason.CHECK_RETURNED:
        return DisputeReason.CHECK_RETURNED;

      case StripeDisputeReason.CREDIT_NOT_PROCESSED:
        return DisputeReason.CREDIT_NOT_PROCESSED;

      case StripeDisputeReason.CUSTOMER_INITIATED:
        return DisputeReason.CUSTOMER_INITIATED;

      case StripeDisputeReason.DEBIT_NOT_AUTHORIZED:
        return DisputeReason.DEBIT_NOT_AUTHORIZED;

      case StripeDisputeReason.DUPLICATE:
        return DisputeReason.DUPLICATE;

      case StripeDisputeReason.FRAUDULENT:
        return DisputeReason.FRAUDULENT;

      case StripeDisputeReason.GENERAL:
        return DisputeReason.GENERAL;

      case StripeDisputeReason.INCORRECT_ACCOUNT_DETAILS:
        return DisputeReason.INCORRECT_ACCOUNT_DETAILS;

      case StripeDisputeReason.INSUFFICIENT_FUNDS:
        return DisputeReason.INSUFFICIENT_FUNDS;

      case StripeDisputeReason.PRODUCT_NOT_RECEIVED:
        return DisputeReason.PRODUCT_NOT_RECEIVED;

      case StripeDisputeReason.PRODUCT_UNACCEPTABLE:
        return DisputeReason.PRODUCT_UNACCEPTABLE;

      case StripeDisputeReason.SUBSCRIPTION_CANCELED:
        return DisputeReason.SUBSCRIPTION_CANCELED;

      case StripeDisputeReason.UNRECOGNIZED:
        return DisputeReason.UNRECOGNIZED;

      default:
        Log.error(`Unknown Stripe dispute reason: ${stripeReason as string}`);

        // Throw ts waring if new StripeDisputeReason was added, and it's not handled
        assert(stripeReason);
    }
  }

  /**
   * Parse Stripe transaction status
   */
  public static parseStripeTransactionStatus(
    stripeStatus: StripeTransactionStatus,
  ): TransactionStatus {
    switch (stripeStatus) {
      case StripeTransactionStatus.SUCCEEDED:
      case StripeTransactionStatus.PAID:
        return TransactionStatus.SUCCESS;

      case StripeTransactionStatus.UNPAID:
      case StripeTransactionStatus.REQUIRES_CONFIRMATION:
        return TransactionStatus.REQUIRED_PAYMENT;

      case StripeTransactionStatus.ERROR:
      case StripeTransactionStatus.PAYMENT_FAILED:
      case StripeTransactionStatus.CANCELED:
      case StripeTransactionStatus.REQUIRES_PAYMENT_METHOD:
        return TransactionStatus.ERROR;

      case StripeTransactionStatus.NO_PAYMENT_REQUIRED:
      case StripeTransactionStatus.PROCESSING:
        return TransactionStatus.IN_PROCESS;

      case StripeTransactionStatus.REFUND_SUCCEEDED:
        return TransactionStatus.REFUNDED;

      case StripeTransactionStatus.REFUND_PENDING:
        return TransactionStatus.REFUND_IN_PROCESS;

      case StripeTransactionStatus.REFUND_CANCELED:
        return TransactionStatus.REFUND_CANCELED;

      case StripeTransactionStatus.REFUND_FAILED:
        return TransactionStatus.REFUND_FAILED;

      default:
        Log.error(`Unknown Stripe transaction status: ${stripeStatus as string}`);

        assert(stripeStatus);
    }
  }
}

export default Parser;
