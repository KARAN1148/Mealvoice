import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const { cuisine, isVegOnly, search } = req.query;
    const whereClause: any = { isOpen: true };

    if (cuisine && typeof cuisine === 'string' && cuisine !== 'All') {
      whereClause.cuisine = { contains: cuisine };
    }
    if (isVegOnly === 'true') {
      whereClause.isVegOnly = true;
    }
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { name: { contains: search } },
        { cuisine: { contains: search } }
      ];
    }

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      include: {
        categories: {
          include: { items: true }
        }
      },
      orderBy: { rating: 'desc' }
    });

    res.json(restaurants);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: true
          }
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { customer: { include: { user: true } } }
        }
      }
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRestaurantOrders = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    let restaurantId = req.query.restaurantId;

    if (!restaurantId) {
      const restaurant = await prisma.restaurant.findFirst({ where: { ownerId: userId } });
      restaurantId = restaurant?.id;
    }

    if (!restaurantId) {
      // Fallback: return first restaurant orders if demo user
      const firstRestaurant = await prisma.restaurant.findFirst();
      restaurantId = firstRestaurant?.id;
    }

    const orders = await prisma.order.findMany({
      where: { restaurantId },
      include: {
        items: true,
        customer: { include: { user: true } },
        delivery: { include: { rider: { include: { user: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRestaurantOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const { orderService } = require('../services/orderService');
    const { riderAssignmentService } = require('../services/riderAssignmentService');

    const updatedOrder = await orderService.updateOrderStatus(id, status, note);

    // If marked READY_FOR_PICKUP, trigger rider assignment algorithm
    if (status === 'READY_FOR_PICKUP') {
      await riderAssignmentService.assignBestAvailableRider(id);
    }

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
