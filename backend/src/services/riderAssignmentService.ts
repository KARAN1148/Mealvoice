import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const riderAssignmentService = {
  assignBestAvailableRider: async (orderId: string, restaurantLat = 12.9716, restaurantLng = 77.5946) => {
    logger.info(`[RIDER ASSIGNMENT] Finding available rider for order ${orderId}`);

    // Fetch active riders
    const riders = await prisma.rider.findMany({
      where: { isOnline: true },
      include: { user: true }
    });

    if (riders.length === 0) {
      logger.warn(`[RIDER ASSIGNMENT] No online riders available for order ${orderId}`);
      return null;
    }

    // Pick rider with least active deliveries or closest simulated distance
    const selectedRider = riders[Math.floor(Math.random() * riders.length)];

    // Check if delivery record already exists
    const existingDelivery = await prisma.delivery.findUnique({
      where: { orderId }
    });

    let delivery;
    if (existingDelivery) {
      delivery = await prisma.delivery.update({
        where: { orderId },
        data: {
          riderId: selectedRider.id,
          assignedAt: new Date()
        }
      });
    } else {
      delivery = await prisma.delivery.create({
        data: {
          orderId,
          riderId: selectedRider.id,
          estimatedMinutes: 25 + Math.floor(Math.random() * 15),
          currentLat: restaurantLat,
          currentLng: restaurantLng
        }
      });
    }

    // Update order status to ASSIGNED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'ASSIGNED' }
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: 'ASSIGNED',
        note: `Assigned to MealVoice Rider: ${selectedRider.user.name}`
      }
    });

    logger.info(`[RIDER ASSIGNMENT] Successfully assigned rider ${selectedRider.user.name} to order ${orderId}`);
    return { delivery, rider: selectedRider };
  }
};
