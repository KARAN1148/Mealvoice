import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { orderService } from '../services/orderService';

const prisma = new PrismaClient();

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      restaurantId,
      items,
      deliveryAddress,
      landmark,
      specialInstructions,
      paymentMethod,
      source
    } = req.body;

    if (!customerId || !restaurantId || !items || items.length === 0 || !deliveryAddress) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: customerId, restaurantId, items[], deliveryAddress.' });
    }

    // Normalize payment method — accept both legacy MOCK_ names and real names
    const normalizedMethod = normalizePaymentMethod(paymentMethod || 'COD');

    const order = await orderService.createOrder({
      customerId,
      restaurantId,
      items,
      deliveryAddress,
      landmark,
      specialInstructions,
      paymentMethod: normalizedMethod,
      source: source || 'ONLINE'
    });

    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET ORDER BY ID ──────────────────────────────────────────────────────────
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
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── LIST ORDERS FOR AUTHENTICATED CUSTOMER ────────────────────────────────────
export const listMyOrders = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    // Find the customer profile
    const customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found.' });
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: customer.id },
        include: {
          items: true,
          restaurant: true,
          delivery: { include: { rider: { include: { user: true } } } },
          payment: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: { customerId: customer.id } })
    ]);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── UPDATE ORDER STATUS ──────────────────────────────────────────────────────
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ error: "'status' is required." });

    const updated = await orderService.updateOrderStatus(id, status, note);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── CANCEL ORDER ─────────────────────────────────────────────────────────────
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const nonCancellableStatuses = ['DELIVERED', 'CANCELLED', 'OUT_FOR_DELIVERY'];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        error: `Order cannot be cancelled at status: ${order.status}.`
      });
    }

    const cancelled = await orderService.updateOrderStatus(
      id,
      'CANCELLED',
      reason || 'Order cancelled by customer'
    );
    res.json(cancelled);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function normalizePaymentMethod(method: string): string {
  const map: Record<string, string> = {
    MOCK_UPI: 'UPI',
    MOCK_CARD: 'CARD',
    MOCK_COD: 'COD',
    NET_BANKING: 'NET_BANKING',
    UPI: 'UPI',
    CARD: 'CARD',
    COD: 'COD'
  };
  return map[method?.toUpperCase()] || 'COD';
}
