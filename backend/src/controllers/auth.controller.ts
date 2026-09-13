import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone
    });

    let roleProfileId = null;
    if (user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
      roleProfileId = customer?.id;
    } else if (user.role === 'RIDER') {
      const rider = await prisma.rider.findUnique({ where: { userId: user.id } });
      roleProfileId = rider?.id;
    } else if (user.role === 'RESTAURANT_ADMIN') {
      const restaurant = await prisma.restaurant.findFirst({ where: { ownerId: user.id } });
      roleProfileId = restaurant?.id;
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        roleProfileId
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, password, and phone are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role: userRole
      }
    });

    if (userRole === 'CUSTOMER') {
      await prisma.customer.create({
        data: {
          userId: user.id,
          addresses: {
            create: {
              label: 'Home',
              street: '123 Indiranagar 10th Main',
              landmark: 'Near Metro Station',
              city: 'Bengaluru',
              zipcode: '560038'
            }
          }
        }
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: { include: { addresses: true } },
        rider: true,
        restaurants: true
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
