import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { orderService } from '../services/orderService';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const lookupCustomerByPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Phone number parameter required.' });
    }

    const cleanPhone = phone.trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: { contains: cleanPhone.replace('+91', '').trim() } }
        ]
      },
      include: {
        customer: {
          include: {
            addresses: true,
            orders: {
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: {
                restaurant: true,
                items: { include: { menuItem: true } }
              }
            }
          }
        }
      }
    });

    if (!user || !user.customer) {
      return res.json({ exists: false, phone: cleanPhone });
    }

    const lastOrder = user.customer.orders[0] || null;

    res.json({
      exists: true,
      customer: {
        id: user.customer.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferredLanguage: user.customer.preferredLanguage,
        notes: user.customer.notes,
        addresses: user.customer.addresses,
        lastOrder,
        recentOrders: user.customer.orders
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPhoneCustomer = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, street, landmark, city, zipcode, notes } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required.' });
    }

    const generatedEmail = email || `phone_${phone.replace(/\D/g, '')}@mealvoice.phone`;
    const hashedPassword = await bcrypt.hash('phone1234', 10);

    let user = await prisma.user.findFirst({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          phone,
          email: generatedEmail,
          passwordHash: hashedPassword,
          role: 'CUSTOMER'
        }
      });
    }

    let customer = await prisma.customer.findUnique({
      where: { userId: user.id },
      include: { addresses: true }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId: user.id,
          notes: notes || 'Created via Call Agent',
          addresses: {
            create: {
              label: 'Delivery Address',
              street: street || 'Main Road',
              landmark: landmark || '',
              city: city || 'Bengaluru',
              zipcode: zipcode || '560001'
            }
          }
        },
        include: { addresses: true }
      });
    }

    res.status(201).json({
      customer: {
        id: customer.id,
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        addresses: customer.addresses
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCallOrder = async (req: any, res: Response) => {
  try {
    const {
      customerId,
      restaurantId,
      items,
      deliveryAddress,
      landmark,
      specialInstructions,
      paymentMethod,
      source,
      callDurationSeconds,
      callNotes
    } = req.body;

    const agentId = req.user?.id;

    if (!customerId || !restaurantId || !items || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required call order parameters.' });
    }

    const order = await orderService.createOrder({
      customerId,
      restaurantId,
      items,
      deliveryAddress,
      landmark,
      specialInstructions,
      paymentMethod: paymentMethod || 'COD',
      source: source || 'PHONE_CALL',
      agentId,
      callDurationSeconds: callDurationSeconds || 120,
      callNotes
    });

    res.status(201).json({
      success: true,
      message: 'Call Order successfully created.',
      order
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCallOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        source: { in: ['PHONE_CALL', 'AGENT'] }
      },
      include: {
        customer: { include: { user: true } },
        restaurant: true,
        items: true,
        callRecord: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const activeCalls = await prisma.callRecord.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { customer: { include: { user: true } }, order: true }
    });

    res.json({ orders, activeCalls });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
