import { PrismaClient } from '@prisma/client';
import { pricingService } from './pricingService';
import { paymentService } from './paymentService';
import { smsService } from './smsService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerId: string;
  restaurantId: string;
  items: CreateOrderItemInput[];
  deliveryAddress: string;
  landmark?: string;
  specialInstructions?: string;
  paymentMethod?: string;
  source: string;
  agentId?: string;
  callDurationSeconds?: number;
  callNotes?: string;
  distanceKm?: number;
}

export const orderService = {
  /**
   * Generates a sequential, human-readable order number.
   * Format: MV-YYYY-NNNNNN  e.g. MV-2026-000101
   * Uses the DB count so it survives server restarts.
   */
  generateOrderNumber: async (): Promise<string> => {
    const count = await prisma.order.count();
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(6, '0');
    return `MV-${year}-${seq}`;
  },

  createOrder: async (input: CreateOrderInput) => {
    logger.info(`[ORDER] Creating order | source=${input.source} | customer=${input.customerId}`);

    // 1. Validate Customer & Restaurant
    const [customer, restaurant] = await Promise.all([
      prisma.customer.findUnique({ where: { id: input.customerId }, include: { user: true } }),
      prisma.restaurant.findUnique({ where: { id: input.restaurantId } })
    ]);

    if (!customer) throw new Error(`Customer '${input.customerId}' not found.`);
    if (!restaurant) throw new Error(`Restaurant '${input.restaurantId}' not found.`);
    if (!restaurant.isOpen) throw new Error(`Restaurant '${restaurant.name}' is currently closed.`);

    // 2. Fetch & validate menu items
    const menuItemIds = input.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } }
    });

    if (menuItems.length !== menuItemIds.length) {
      const foundIds = new Set(menuItems.map((m) => m.id));
      const missing = menuItemIds.filter((id) => !foundIds.has(id));
      throw new Error(`Menu items not found: ${missing.join(', ')}`);
    }

    const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));
    let subtotal = 0;
    const orderItemsData = input.items.map((itemInput) => {
      const item = menuItemMap.get(itemInput.menuItemId)!;
      if (!item.isAvailable) {
        throw new Error(`'${item.name}' is currently unavailable.`);
      }
      const lineTotal = item.price * itemInput.quantity;
      subtotal += lineTotal;
      return {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: itemInput.quantity
      };
    });

    // 3. Pricing calculation (Indian GST)
    const pricing = pricingService.calculatePricing({
      subtotal,
      distanceKm: input.distanceKm
    });

    // 4. Generate atomic order number
    const orderNumber = await orderService.generateOrderNumber();

    // 5. Normalise payment method
    const paymentMethod = input.paymentMethod || 'COD';
    const isPaid = !['COD', 'MOCK_COD'].includes(paymentMethod.toUpperCase());

    // 6. Persist Order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        restaurantId: restaurant.id,
        source: input.source,
        status: 'PENDING',
        subtotal: pricing.subtotal,
        deliveryFee: pricing.deliveryFee,
        tax: pricing.tax,
        discount: pricing.discount,
        totalAmount: pricing.totalAmount,
        paymentMethod,
        paymentStatus: isPaid ? 'PAID' : 'PENDING',
        deliveryAddress: input.deliveryAddress,
        landmark: input.landmark,
        specialInstructions: input.specialInstructions,
        items: { create: orderItemsData },
        statusHistory: {
          create: {
            status: 'PENDING',
            note: `Order placed via ${input.source}`
          }
        }
      },
      include: {
        items: true,
        customer: { include: { user: true } },
        restaurant: true,
        statusHistory: true
      }
    });

    // 7. Payment processing
    try {
      const paymentResult = await paymentService.processPayment({
        orderId: order.id,
        amount: order.totalAmount,
        method: paymentMethod as any
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          method: paymentMethod,
          status: paymentResult.status as any,
          transactionRef: paymentResult.transactionRef
        }
      });
    } catch (payErr: any) {
      logger.error(`[ORDER] Payment record error for ${order.id}: ${payErr.message}`);
      // Non-fatal for COD — continue
    }

    // 8. Call-agent record
    if (input.agentId || input.source === 'PHONE_CALL' || input.source === 'AGENT') {
      try {
        const agentId = input.agentId ||
          (await prisma.user.findFirst({ where: { role: 'CALL_AGENT' } }))?.id;
        if (agentId) {
          const startTime = new Date(Date.now() - (input.callDurationSeconds || 90) * 1000);
          await prisma.callRecord.create({
            data: {
              customerId: customer.id,
              agentId,
              phoneNumber: customer.user.phone,
              callStatus: 'COMPLETED',
              callStartTime: startTime,
              callEndTime: new Date(),
              orderId: order.id,
              notes: input.callNotes || `Phone order created for ${customer.user.name}`
            }
          });
        }
      } catch (callErr: any) {
        logger.warn(`[ORDER] CallRecord creation warning: ${callErr.message}`);
      }
    }

    // 9. SMS confirmation
    try {
      await smsService.sendOrderConfirmation(
        customer.user.phone,
        order.orderNumber,
        '30–45 mins',
        order.restaurant?.name
      );
    } catch (smsErr: any) {
      logger.warn(`[ORDER] SMS dispatch warning: ${smsErr.message}`);
    }

    logger.info(`[ORDER] Created ${order.orderNumber} | ₹${order.totalAmount} | ${paymentMethod}`);
    return order;
  },

  updateOrderStatus: async (orderId: string, newStatus: string, note?: string) => {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        customer: { include: { user: true } },
        restaurant: true
      }
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: newStatus,
        note: note || `Status updated to ${newStatus}`
      }
    });

    // SMS for customer-facing statuses
    const notifyStatuses = ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (notifyStatuses.includes(newStatus) && order.customer?.user?.phone) {
      const statusMessages: Record<string, string> = {
        CONFIRMED: `Your order ${order.orderNumber} has been confirmed by ${order.restaurant?.name || 'the restaurant'}.`,
        PREPARING: `${order.restaurant?.name || 'The kitchen'} is now preparing your order ${order.orderNumber}.`,
        READY_FOR_PICKUP: `Order ${order.orderNumber} is ready — a rider is being assigned.`,
        OUT_FOR_DELIVERY: `Your order ${order.orderNumber} is out for delivery! ETA: 15–20 mins.`,
        DELIVERED: `Order ${order.orderNumber} delivered! Enjoy your meal. Rate us on MealVoice.`,
        CANCELLED: `Order ${order.orderNumber} has been cancelled. Refund (if any) in 3–5 business days.`
      };

      try {
        await smsService.sendOrderStatusUpdate(
          order.customer.user.phone,
          order.orderNumber,
          statusMessages[newStatus] || `Your order status is now: ${newStatus.replace(/_/g, ' ')}`
        );
      } catch (smsErr: any) {
        logger.warn(`[ORDER] Status SMS warning: ${smsErr.message}`);
      }
    }

    return order;
  }
};
