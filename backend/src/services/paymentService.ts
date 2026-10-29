import { logger } from '../utils/logger';

export interface PaymentProcessInput {
  orderId: string;
  amount: number;
  method: 'COD' | 'UPI' | 'CARD' | 'NET_BANKING' | 'MOCK_UPI' | 'MOCK_CARD';
  cardDetails?: {
    cardNumber?: string;
    cardHolder?: string;
    expiry?: string;
    cvv?: string;
    brand?: string;
  };
  upiId?: string;
  bankName?: string;
}

export interface PaymentResult {
  status: 'PAID' | 'PENDING' | 'FAILED';
  transactionRef: string;
  gateway: 'MealVoice-PayEngine' | 'Razorpay-Direct' | 'UPI-Switch' | 'Cash-On-Delivery';
  paidAt?: string;
  message: string;
  paymentDetails: {
    method: string;
    amount: number;
    currency: string;
    receiptNumber: string;
    taxInvoiceId: string;
  };
}

export const paymentService = {
  processPayment: async (input: PaymentProcessInput): Promise<PaymentResult> => {
    logger.info(`[PAYMENT ENGINE] Initiating ${input.method} transaction of ₹${input.amount} for Order ${input.orderId}`);

    const now = new Date();
    const timestampStr = now.getTime().toString();
    const receiptNumber = `RCPT-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const taxInvoiceId = `INV-${now.getFullYear()}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Normalize methods
    const methodUpper = input.method.toUpperCase();

    if (methodUpper === 'COD') {
      return {
        status: 'PENDING',
        transactionRef: `TXN_COD_${timestampStr.slice(-8)}`,
        gateway: 'Cash-On-Delivery',
        message: 'Order confirmed with Cash on Delivery. Collect amount upon doorstep delivery.',
        paymentDetails: {
          method: 'Cash on Delivery (COD)',
          amount: input.amount,
          currency: 'INR',
          receiptNumber,
          taxInvoiceId
        }
      };
    }

    if (methodUpper === 'UPI' || methodUpper === 'MOCK_UPI') {
      const vpa = input.upiId || 'customer@upi';
      return {
        status: 'PAID',
        transactionRef: `TXN_UPI_${timestampStr.slice(-10)}`,
        gateway: 'UPI-Switch',
        paidAt: now.toISOString(),
        message: `UPI payment of ₹${input.amount} received successfully via ${vpa}.`,
        paymentDetails: {
          method: `UPI (${vpa})`,
          amount: input.amount,
          currency: 'INR',
          receiptNumber,
          taxInvoiceId
        }
      };
    }

    if (methodUpper === 'NET_BANKING') {
      const bank = input.bankName || 'Verified NetBanking';
      return {
        status: 'PAID',
        transactionRef: `TXN_NB_${timestampStr.slice(-10)}`,
        gateway: 'MealVoice-PayEngine',
        paidAt: now.toISOString(),
        message: `Internet Banking payment of ₹${input.amount} authorized by ${bank}.`,
        paymentDetails: {
          method: `Net Banking (${bank})`,
          amount: input.amount,
          currency: 'INR',
          receiptNumber,
          taxInvoiceId
        }
      };
    }

    // Default: CARD / MOCK_CARD
    const last4 = input.cardDetails?.cardNumber?.replace(/\D/g, '').slice(-4) || '4242';
    const brand = input.cardDetails?.brand || 'VISA';

    return {
      status: 'PAID',
      transactionRef: `TXN_CARD_${timestampStr.slice(-10)}`,
      gateway: 'MealVoice-PayEngine',
      paidAt: now.toISOString(),
      message: `Card transaction of ₹${input.amount} authorized successfully (${brand} ending in •••• ${last4}).`,
      paymentDetails: {
        method: `${brand} •••• ${last4}`,
        amount: input.amount,
        currency: 'INR',
        receiptNumber,
        taxInvoiceId
      }
    };
  }
};
