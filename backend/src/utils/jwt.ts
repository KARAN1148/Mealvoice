import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  phone: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};
