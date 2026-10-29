import { logger } from '../utils/logger';

export interface SMSMessage {
  phoneNumber: string;
  message: string;
  orderNumber: string;
  timestamp: string;
  status: 'SENT' | 'DELIVERED';
  senderHeader: string;
}

// In-memory persistent transactional SMS ledger accessible by the platform
export const smsLedger: SMSMessage[] = [];

export const smsService = {
  sendOrderConfirmation: async (phoneNumber: string, orderNumber: string, estimatedDelivery: string, restaurantName?: string) => {
    const sender = 'VM-MEALVC';
    const message = `[MealVoice] Order #${orderNumber} from ${restaurantName || 'Kitchen'} confirmed! Est. delivery: ${estimatedDelivery}. Track live at mealvoice.in/orders/${orderNumber}. For assistance, call 1800-472-6326.`;
    
    const logEntry: SMSMessage = {
      phoneNumber,
      message,
      orderNumber,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
      senderHeader: sender
    };
    
    smsLedger.unshift(logEntry);
    logger.info(`[SMS GATEWAY DISPATCH ${sender}] To: ${phoneNumber} | Msg: ${message}`);
    return { success: true, messageId: `msg_${Date.now()}`, senderHeader: sender };
  },

  sendOrderStatusUpdate: async (phoneNumber: string, orderNumber: string, statusText: string, riderName?: string) => {
    const sender = 'VM-MEALVC';
    const riderInfo = riderName ? ` Your rider is ${riderName}.` : '';
    const message = `[MealVoice] Update on Order #${orderNumber}: ${statusText}.${riderInfo} Track live at mealvoice.in/orders/${orderNumber}.`;
    
    const logEntry: SMSMessage = {
      phoneNumber,
      message,
      orderNumber,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
      senderHeader: sender
    };
    
    smsLedger.unshift(logEntry);
    logger.info(`[SMS GATEWAY DISPATCH ${sender}] To: ${phoneNumber} | Msg: ${message}`);
    return { success: true, messageId: `msg_${Date.now()}`, senderHeader: sender };
  },

  getRecentSMS: () => {
    return smsLedger.slice(0, 30);
  }
};
