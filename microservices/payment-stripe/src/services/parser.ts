import { Log } from '@lomray/microservice-helpers';
import DisputeReason from '@constants/dispute-reason';
import DisputeStatus from '@constants/dispute-status';
import RefundStatus from '@constants/refund-status';
import StripeDisputeReason from '@constants/stripe-dispute-reason';
import StripeDisputeStatus from '@constants/stripe-dispute-status';
import StripeRefundStatus from '@constants/stripe-refund-status';
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
   * Parse Stripe refund status
   */
  public static parseStripeRefundStatus(stripeStatus: StripeRefundStatus): RefundStatus {
    switch (stripeStatus) {
      case StripeRefundStatus.SUCCEEDED:
        return RefundStatus.SUCCESS;

      case StripeRefundStatus.PENDING:
        return RefundStatus.IN_PROCESS;

      case StripeRefundStatus.FAILED:
        return RefundStatus.ERROR;

      case StripeRefundStatus.CANCELED:
        return RefundStatus.CANCELED;

      case StripeRefundStatus.REQUIRES_ACTION:
        return RefundStatus.REQUIRES_ACTION;

      default:
        Log.error(`Unknown Stripe refund status: ${stripeStatus as string}`);

        assert(stripeStatus);
    }
  }

  /**
   * Parse Stripe dispute status
   */
  public static parseStripeDisputeStatus(stripeStatus: StripeDisputeStatus): DisputeStatus {
    switch (stripeStatus) {
      case StripeDisputeStatus.NEEDS_RESPONSE:
        return DisputeStatus.NEEDS_RESPONSE;

      case StripeDisputeStatus.LOST:
        return DisputeStatus.LOST;

      case StripeDisputeStatus.UNDER_REVIEW:
        return DisputeStatus.UNDER_REVIEW;

      case StripeDisputeStatus.WARNING_CLOSED:
        return DisputeStatus.WARNING_CLOSED;

      case StripeDisputeStatus.WON:
        return DisputeStatus.WON;

      case StripeDisputeStatus.WARNING_NEEDS_RESPONSE:
        return DisputeStatus.WARNING_NEEDS_RESPONSE;

      case StripeDisputeStatus.WARNING_UNDER_REVIEW:
        return DisputeStatus.WARNING_UNDER_REVIEW;

      default:
        Log.error(`Unknown Stripe dispute status: ${stripeStatus as string}`);

        assert(stripeStatus);
    }
  }

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
