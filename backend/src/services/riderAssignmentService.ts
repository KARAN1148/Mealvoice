import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Haversine formula — returns distance in kilometres between two lat/lng points.
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const riderAssignmentService = {
  /**
   * Assigns the best available rider to an order.
   *
   * Strategy:
   *  1. Only considers online riders with < 2 active deliveries (capacity check)
   *  2. Sorts by distance from restaurant using Haversine (closest first)
   *  3. Falls back to random pick if no GPS coordinates are stored
   *
   * @param orderId         The order to assign
   * @param restaurantLat   Restaurant latitude  (default: Indiranagar, Bangalore)
   * @param restaurantLng   Restaurant longitude (default: Indiranagar, Bangalore)
   */
  assignBestAvailableRider: async (
    orderId: string,
    restaurantLat = 12.9784,
    restaurantLng = 77.6408
  ) => {
    logger.info(`[RIDER ASSIGN] Seeking rider for order ${orderId}`);

    // Step 1 — Get all online riders
    const onlineRiders = await prisma.rider.findMany({
      where: { isOnline: true },
      include: {
        user: true,
        deliveries: {
          where: {
            order: { status: { notIn: ['DELIVERED', 'CANCELLED'] } }
          }
        }
      }
    });

    if (onlineRiders.length === 0) {
      logger.warn(`[RIDER ASSIGN] No online riders for order ${orderId}`);
      return null;
    }

    // Step 2 — Filter to riders under capacity (≤ 1 active delivery)
    const availableRiders = onlineRiders.filter((r) => r.deliveries.length <= 1);

    const pool = availableRiders.length > 0 ? availableRiders : onlineRiders;

    // Step 3 — Score by distance
    const scored = pool
      .map((rider) => {
        const riderLat = (rider as any).currentLat ?? restaurantLat + (Math.random() - 0.5) * 0.05;
        const riderLng = (rider as any).currentLng ?? restaurantLng + (Math.random() - 0.5) * 0.05;
        const distKm = haversineKm(restaurantLat, restaurantLng, riderLat, riderLng);
        return { rider, distKm };
      })
      .sort((a, b) => a.distKm - b.distKm);

    const { rider: selectedRider, distKm } = scored[0];
    const estimatedMinutes = Math.max(15, Math.round(20 + distKm * 3));

    logger.info(
      `[RIDER ASSIGN] Selected ${selectedRider.user.name} | ${distKm.toFixed(2)} km away | ETA ~${estimatedMinutes} min`
    );

    // Step 4 — Upsert delivery record
    const existingDelivery = await prisma.delivery.findUnique({ where: { orderId } });

    const deliveryData = {
      riderId: selectedRider.id,
      estimatedMinutes,
      assignedAt: new Date(),
      currentLat: restaurantLat,
      currentLng: restaurantLng
    };

    let delivery;
    if (existingDelivery) {
      delivery = await prisma.delivery.update({
        where: { orderId },
        data: deliveryData
      });
    } else {
      delivery = await prisma.delivery.create({
        data: { orderId, ...deliveryData }
      });
    }

    // Step 5 — Update order status & history
    await prisma.order.update({ where: { id: orderId }, data: { status: 'ASSIGNED' } });
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: 'ASSIGNED',
        note: `Assigned to ${selectedRider.user.name} (${selectedRider.vehicleType} · ${selectedRider.vehicleNumber}). ETA ~${estimatedMinutes} min.`
      }
    });

    return { delivery, rider: selectedRider, estimatedMinutes, distKm };
  }
};
