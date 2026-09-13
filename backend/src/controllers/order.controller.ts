import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { orderService } from '../services/orderService';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, restaurantId, items, deliveryAddress, landmark, specialInstructions, paymentMethod, source } = req.body;

    if (!customerId || !restaurantId || !items || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required order fields (customerId, restaurantId, items, deliveryAddress).' });
    }

    const order = await orderService.createOrder({
      customerId,
      restaurantId,
      items,
      deliveryAddress,
      landmark,
      specialInstructions,
      paymentMethod: paymentMethod || 'COD',
      source: source || 'ONLINE'
    });

    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: { include: { user: true } },
        restaurant: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        delivery: { include: { rider: { include: { user: true } } } },
        payment: true,
        callRecord: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const updated = await orderService.updateOrderStatus(id, status, note);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const cancelled = await orderService.updateOrderStatus(id, 'CANCELLED', reason || 'Order cancelled by customer');
    res.json(cancelled);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
