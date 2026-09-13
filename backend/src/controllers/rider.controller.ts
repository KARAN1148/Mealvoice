import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { orderService } from '../services/orderService';

const prisma = new PrismaClient();

export const getRiderDeliveries = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    let rider = await prisma.rider.findUnique({ where: { userId } });

    if (!rider) {
      // Fallback: pick first rider for demo account
      rider = await prisma.rider.findFirst();
    }

    if (!rider) {
      return res.status(404).json({ error: 'Rider profile not found.' });
    }

    const activeDeliveries = await prisma.delivery.findMany({
      where: {
        riderId: rider.id,
        order: { status: { notIn: ['DELIVERED', 'CANCELLED'] } }
      },
      include: {
        order: {
          include: {
            restaurant: true,
            customer: { include: { user: true } },
            items: true
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    const completedDeliveries = await prisma.delivery.findMany({
      where: {
        riderId: rider.id,
        order: { status: 'DELIVERED' }
      },
      include: {
        order: {
          include: {
            restaurant: true,
            customer: { include: { user: true } }
          }
        }
      },
      orderBy: { deliveredAt: 'desc' },
      take: 20
    });

    // Also fetch available orders awaiting rider assignment
    const availableOrders = await prisma.order.findMany({
      where: {
        status: 'READY_FOR_PICKUP',
        delivery: null
      },
      include: {
        restaurant: true,
        customer: { include: { user: true } },
        items: true
      }
    });

    res.json({
      rider,
      activeDeliveries,
      completedDeliveries,
      availableOrders
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const acceptDelivery = async (req: any, res: Response) => {
  try {
    const { id } = req.params; // orderId or deliveryId
    const userId = req.user.id;
    let rider = await prisma.rider.findUnique({ where: { userId } });
    if (!rider) rider = await prisma.rider.findFirst();
    if (!rider) return res.status(404).json({ error: 'Rider profile not found.' });

    let delivery = await prisma.delivery.findUnique({ where: { orderId: id } });

    if (!delivery) {
      delivery = await prisma.delivery.create({
        data: {
          orderId: id,
          riderId: rider.id,
          acceptedAt: new Date(),
          estimatedMinutes: 30
        }
      });
    } else {
      delivery = await prisma.delivery.update({
        where: { orderId: id },
        data: {
          riderId: rider.id,
          acceptedAt: new Date()
        }
      });
    }

    await orderService.updateOrderStatus(id, 'RIDER_ACCEPTED', `Accepted by rider ${req.user.name}`);

    res.json({ success: true, delivery });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // orderId
    const { status, lat, lng } = req.body;

    const delivery = await prisma.delivery.findUnique({ where: { orderId: id } });
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery record not found.' });
    }

    const updateData: any = {};
    if (lat) updateData.currentLat = lat;
    if (lng) updateData.currentLng = lng;

    if (status === 'PICKED_UP') {
      updateData.pickedUpAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();

      // Credit earnings to rider
      const order = await prisma.order.findUnique({ where: { id } });
      const deliveryFee = order?.deliveryFee || 40;
      await prisma.rider.update({
        where: { id: delivery.riderId },
        data: { totalEarnings: { increment: Math.round(deliveryFee * 0.8) } }
      });
    }

    await prisma.delivery.update({
      where: { orderId: id },
      data: updateData
    });

    const updatedOrder = await orderService.updateOrderStatus(id, status);

    res.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
