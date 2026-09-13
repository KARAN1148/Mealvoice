import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true }
    });
    const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

    const activeRidersCount = await prisma.rider.count({ where: { isOnline: true } });
    const totalRestaurantsCount = await prisma.restaurant.count({ where: { isOpen: true } });

    // Order source counts for Startup Differentiation & Accessibility Impact
    const onlineOrders = await prisma.order.count({ where: { source: 'ONLINE' } });
    const phoneOrders = await prisma.order.count({ where: { source: 'PHONE_CALL' } });
    const easyOrders = await prisma.order.count({ where: { source: 'EASY_ORDER' } });
    const agentOrders = await prisma.order.count({ where: { source: 'AGENT' } });

    const accessibilityTotal = phoneOrders + easyOrders + agentOrders;
    const accessibilityPercentage = totalOrders > 0 ? Math.round((accessibilityTotal / totalOrders) * 100) : 0;

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { include: { user: true } },
        restaurant: true,
        delivery: { include: { rider: { include: { user: true } } } }
      }
    });

    // Top restaurants
    const restaurants = await prisma.restaurant.findMany({
      take: 5,
      orderBy: { rating: 'desc' }
    });

    // Top riders
    const riders = await prisma.rider.findMany({
      take: 5,
      include: { user: true, deliveries: true },
      orderBy: { totalEarnings: 'desc' }
    });

    res.json({
      kpi: {
        totalOrders,
        totalRevenue,
        activeRiders: activeRidersCount,
        activeRestaurants: totalRestaurantsCount,
        avgDeliveryTimeMinutes: 32,
        cancellationRate: '1.8%'
      },
      accessibilityImpact: {
        totalOrders,
        onlineCount: onlineOrders,
        phoneCount: phoneOrders,
        easyOrderCount: easyOrders,
        agentCount: agentOrders,
        accessibilityTotal,
        accessibilityPercentage,
        onlinePercentage: totalOrders > 0 ? Math.round((onlineOrders / totalOrders) * 100) : 0
      },
      recentOrders,
      topRestaurants: restaurants,
      topRiders: riders
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        source: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    });

    const sourceBreakdown = {
      ONLINE: orders.filter((o) => o.source === 'ONLINE').length,
      PHONE_CALL: orders.filter((o) => o.source === 'PHONE_CALL').length,
      EASY_ORDER: orders.filter((o) => o.source === 'EASY_ORDER').length,
      AGENT: orders.filter((o) => o.source === 'AGENT').length
    };

    res.json({
      sourceBreakdown,
      totalOrders: orders.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: { include: { user: true } },
        restaurant: true,
        delivery: { include: { rider: { include: { user: true } } } },
        callRecord: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
