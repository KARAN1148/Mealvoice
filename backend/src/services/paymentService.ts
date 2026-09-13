import { logger } from '../utils/logger';

export interface PaymentProcessInput {
  orderId: string;
  amount: number;
  method: 'COD' | 'MOCK_UPI' | 'MOCK_CARD';
  cardDetails?: { cardNumber?: string; expiry?: string; cvv?: string };
  upiId?: string;
}

export const paymentService = {
  processPayment: async (input: PaymentProcessInput) => {
    logger.info(`[PAYMENT SERVICE] Processing ${input.method} payment of ₹${input.amount} for order ${input.orderId}`);

    if (input.method === 'COD') {
      return {
        status: 'PENDING',
        transactionRef: `COD_${Date.now()}`,
        message: 'Cash on Delivery selected. Payment pending delivery.'
      };
    } else if (input.method === 'MOCK_UPI') {
      return {
        status: 'PAID',
        transactionRef: `UPI_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        message: 'Mock UPI Payment Successful!'
      };
    } else {
      return {
        status: 'PAID',
        transactionRef: `CARD_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        message: 'Mock Card Payment Successful!'
      };
    }
  }
};
