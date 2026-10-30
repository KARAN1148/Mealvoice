import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // Note: required-field validation is handled by validateBody middleware on the route
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Use a generic message to avoid leaking whether the email exists
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone
    });

    // Resolve role-specific profile ID so the frontend can deep-link dashboards
    let roleProfileId: string | null = null;
    if (user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
      roleProfileId = customer?.id ?? null;
    } else if (user.role === 'RIDER') {
      const rider = await prisma.rider.findUnique({ where: { userId: user.id } });
      roleProfileId = rider?.id ?? null;
    } else if (user.role === 'RESTAURANT_ADMIN') {
      const restaurant = await prisma.restaurant.findFirst({ where: { ownerId: user.id } });
      roleProfileId = restaurant?.id ?? null;
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
    res.status(500).json({ error: 'Authentication service error. Please try again.' });
  }
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, password, and phone are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    // Only CUSTOMER self-registration is allowed via this endpoint; staff roles require admin creation
    const userRole = 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        passwordHash: hashedPassword,
        role: userRole
      }
    });

    // Auto-create Customer profile
    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        addresses: {
          create: {
            label: 'Home',
            street: 'Enter your street address',
            landmark: '',
            city: 'Bengaluru',
            zipcode: '560001'
          }
        }
      }
    });

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
        role: user.role,
        roleProfileId: customer.id
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
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
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Strip password hash from response
    const { passwordHash: _, ...safeUser } = user as any;
    res.json({ user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
export const changePassword = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: hashed } });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Password change failed.' });
  }
};
