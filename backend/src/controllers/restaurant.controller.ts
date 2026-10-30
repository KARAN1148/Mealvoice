import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── LIST RESTAURANTS (with search, filter, pagination) ────────────────────────
export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const { cuisine, isVegOnly, search, page, limit, sortBy } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = { isOpen: true };

    if (cuisine && typeof cuisine === 'string' && cuisine !== 'All') {
      whereClause.cuisine = { contains: cuisine };
    }
    if (isVegOnly === 'true') {
      whereClause.isVegOnly = true;
    }
    if (search && typeof search === 'string' && search.trim().length > 0) {
      whereClause.OR = [
        { name: { contains: search.trim() } },
        { cuisine: { contains: search.trim() } },
        { address: { contains: search.trim() } }
      ];
    }

    const orderByMap: Record<string, any> = {
      rating: { rating: 'desc' },
      deliveryTime: { deliveryTime: 'asc' },
      minOrder: { minOrder: 'asc' },
      newest: { createdAt: 'desc' }
    };
    const orderBy = orderByMap[(sortBy as string) || 'rating'] || { rating: 'desc' };

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where: whereClause,
        include: {
          categories: {
            orderBy: { sortOrder: 'asc' },
            include: { items: { where: { isAvailable: true }, take: 5 } }
          },
          _count: { select: { reviews: true } }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.restaurant.count({ where: whereClause })
    ]);

    res.json({
      restaurants,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET RESTAURANT BY ID ──────────────────────────────────────────────────────
export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: { where: { isAvailable: true }, orderBy: { name: 'asc' } }
          }
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { customer: { include: { user: { select: { name: true } } } } }
        }
      }
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    res.json(restaurant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET RESTAURANT MENU ONLY ──────────────────────────────────────────────────
export const getRestaurantMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId: id },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: { where: { isAvailable: true }, orderBy: { name: 'asc' } }
      }
    });
    res.json({ restaurantId: id, categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET RESTAURANT ORDERS (for Restaurant Admin dashboard) ───────────────────
export const getRestaurantOrders = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const status = req.query.status as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    let restaurantId = req.query.restaurantId as string | undefined;

    if (!restaurantId) {
      const restaurant = await prisma.restaurant.findFirst({ where: { ownerId: userId } });
      restaurantId = restaurant?.id;
    }
    if (!restaurantId) {
      // Demo fallback
      const first = await prisma.restaurant.findFirst();
      restaurantId = first?.id;
    }
    if (!restaurantId) {
      return res.status(404).json({ error: 'No restaurant found for this account.' });
    }

    const whereClause: any = { restaurantId };
    if (status) whereClause.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          items: true,
          customer: { include: { user: true } },
          delivery: { include: { rider: { include: { user: true } } } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereClause })
    ]);

    res.json({
      orders,
      restaurantId,
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

// ─── UPDATE RESTAURANT ORDER STATUS ───────────────────────────────────────────
export const updateRestaurantOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ error: "'status' is required." });

    const { orderService } = require('../services/orderService');
    const { riderAssignmentService } = require('../services/riderAssignmentService');

    const updatedOrder = await orderService.updateOrderStatus(id, status, note);

    // Auto-assign rider when food is ready for pickup
    if (status === 'READY_FOR_PICKUP') {
      try {
        await riderAssignmentService.assignBestAvailableRider(id);
      } catch (assignErr: any) {
        // Non-fatal — log and continue
        console.warn(`[RESTAURANT] Rider auto-assign warning: ${assignErr.message}`);
      }
    }

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
