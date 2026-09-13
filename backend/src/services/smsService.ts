import { logger } from '../utils/logger';

export interface SMSMessage {
  phoneNumber: string;
  message: string;
  orderNumber: string;
  timestamp: string;
}

// In-memory mock SMS store so UI can display recent SMS notifications
export const mockSmsLogs: SMSMessage[] = [];

export const smsService = {
  sendOrderConfirmation: async (phoneNumber: string, orderNumber: string, estimatedDelivery: string) => {
    const message = `MealVoice: Your order ${orderNumber} has been confirmed. Estimated delivery: ${estimatedDelivery}. Thank you for choosing MealVoice!`;
    const logEntry: SMSMessage = {
      phoneNumber,
      message,
      orderNumber,
      timestamp: new Date().toISOString()
    };
    mockSmsLogs.unshift(logEntry);
    logger.info(`[SMS MOCK DISPATCH] To: ${phoneNumber} | Message: ${message}`);
    return { success: true, messageId: `sms_${Date.now()}` };
  },

  sendOrderStatusUpdate: async (phoneNumber: string, orderNumber: string, statusText: string) => {
    const message = `MealVoice: Update on order ${orderNumber} - ${statusText}.`;
    const logEntry: SMSMessage = {
      phoneNumber,
      message,
      orderNumber,
      timestamp: new Date().toISOString()
    };
    mockSmsLogs.unshift(logEntry);
    logger.info(`[SMS MOCK DISPATCH] To: ${phoneNumber} | Message: ${message}`);
    return { success: true, messageId: `sms_${Date.now()}` };
  },

  getRecentSMS: () => {
    return mockSmsLogs.slice(0, 20);
  }
};
