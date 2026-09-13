import { PrismaClient } from '@prisma/client';
import { pricingService } from './pricingService';
import { paymentService } from './paymentService';
import { smsService } from './smsService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

let orderCounter = 100;

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
  agentId?: string;       // Present if created by Call Agent
  callDurationSeconds?: number;
  callNotes?: string;
}

export const orderService = {
  generateOrderNumber: () => {
    orderCounter += 1;
    const year = new Date().getFullYear();
    const formattedNum = String(orderCounter).padStart(6, '0');
    return `GC-${year}-${formattedNum}`;
  },

  createOrder: async (input: CreateOrderInput) => {
    logger.info(`[ORDER SERVICE] Creating new order via ${input.source} for customer ${input.customerId}`);

    // 1. Fetch Customer & Restaurant info
    const customer = await prisma.customer.findUnique({
      where: { id: input.customerId },
      include: { user: true }
    });

    if (!customer) {
      throw new Error(`Customer with ID ${input.customerId} not found.`);
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: input.restaurantId }
    });

    if (!restaurant) {
      throw new Error(`Restaurant with ID ${input.restaurantId} not found.`);
    }

    // 2. Fetch Menu Items & calculate pricing
    const menuItemIds = input.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } }
    });

    const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

    let subtotal = 0;
    const orderItemsData = input.items.map((itemInput) => {
      const item = menuItemMap.get(itemInput.menuItemId);
      if (!item) {
        throw new Error(`Menu item ${itemInput.menuItemId} not found.`);
      }
      const itemTotal = item.price * itemInput.quantity;
      subtotal += itemTotal;

      return {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: itemInput.quantity
      };
    });

    const pricing = pricingService.calculatePricing({ subtotal });

    // 3. Generate Order Number
    const orderNumber = orderService.generateOrderNumber();

    // 4. Create Order record in Database
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
        paymentMethod: input.paymentMethod || 'COD',
        paymentStatus: input.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        deliveryAddress: input.deliveryAddress,
        landmark: input.landmark,
        specialInstructions: input.specialInstructions,
        items: {
          create: orderItemsData
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            note: `Order created via ${input.source}`
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

    // 5. Payment processing
    const paymentResult = await paymentService.processPayment({
      orderId: order.id,
      amount: order.totalAmount,
      method: order.paymentMethod as any
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        method: order.paymentMethod,
        status: paymentResult.status as any,
        transactionRef: paymentResult.transactionRef
      }
    });

    // 6. If Call Order / Agent flow, record CallRecord
    if (input.agentId || input.source === 'PHONE_CALL' || input.source === 'AGENT') {
      const agentId = input.agentId || (await prisma.user.findFirst({ where: { role: 'CALL_AGENT' } }))?.id;
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
            notes: input.callNotes || `Phone order created by agent for ${customer.user.name}`
          }
        });
      }
    }

    // 7. Dispatch SMS notification
    await smsService.sendOrderConfirmation(
      customer.user.phone,
      order.orderNumber,
      '30-40 mins'
    );

    return order;
  },

  updateOrderStatus: async (orderId: string, newStatus: string, note?: string) => {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { customer: { include: { user: true } } }
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: newStatus,
        note: note || `Status updated to ${newStatus}`
      }
    });

    // Dispatch SMS notification for key statuses
    if (order.customer?.user?.phone) {
      await smsService.sendOrderStatusUpdate(
        order.customer.user.phone,
        order.orderNumber,
        `Status is now: ${newStatus.replace(/_/g, ' ')}`
      );
    }

    return order;
  }
};
