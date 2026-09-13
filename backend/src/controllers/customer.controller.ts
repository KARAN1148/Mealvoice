import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCustomerProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const customer = await prisma.customer.findUnique({
      where: { userId },
      include: {
        user: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            restaurant: true,
            items: true,
            statusHistory: true,
            delivery: { include: { rider: { include: { user: true } } } }
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addCustomerAddress = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { label, street, landmark, city, zipcode } = req.body;

    const customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const address = await prisma.address.create({
      data: {
        customerId: customer.id,
        label: label || 'Home',
        street,
        landmark,
        city: city || 'Bengaluru',
        zipcode: zipcode || '560001'
      }
    });

    res.status(201).json(address);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
