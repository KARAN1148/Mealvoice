import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'mealvoice_super_secret_jwt_key_2026',
  nodeEnv: process.env.NODE_ENV || 'development',
  baseDeliveryFee: 30, // INR base fee
  perKmFee: 10,       // INR per km
  taxRate: 0.05       // 5% GST
};
