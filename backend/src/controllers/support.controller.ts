import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { smsService } from '../services/smsService';

const prisma = new PrismaClient();

export const createSupportTicket = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const { category, subject, description, orderId } = req.body;

    let customerId = null;
    if (userId) {
      const customer = await prisma.customer.findUnique({ where: { userId } });
      customerId = customer?.id;
    }

    if (!customerId) {
      // Fallback: pick first customer
      const fallback = await prisma.customer.findFirst();
      customerId = fallback?.id;
    }

    if (!customerId) {
      return res.status(400).json({ error: 'Customer record required.' });
    }

    const ticketNo = `TICK-${Date.now().toString().slice(-6)}`;
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNo,
        customerId,
        orderId,
        category: category || 'ORDER_ISSUE',
        subject: subject || 'General Query',
        description: description || 'Customer reported an issue via app.',
        status: 'OPEN'
      }
    });

    res.status(201).json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSMSLogs = async (req: Request, res: Response) => {
  try {
    const logs = smsService.getRecentSMS();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
