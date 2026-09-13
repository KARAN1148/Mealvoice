import { config } from '../config';

export interface PricingInput {
  subtotal: number;
  distanceKm?: number;
  discountAmount?: number;
}

export const pricingService = {
  calculatePricing: (input: PricingInput) => {
    const subtotal = Math.max(0, input.subtotal);
    const distance = input.distanceKm || 3.5; // Default ~3.5 km
    const deliveryFee = config.baseDeliveryFee + Math.round(distance * config.perKmFee);
    const tax = Math.round(subtotal * config.taxRate);
    const discount = input.discountAmount || 0;
    const totalAmount = Math.max(0, subtotal + deliveryFee + tax - discount);

    return {
      subtotal,
      deliveryFee,
      tax,
      discount,
      totalAmount,
      distanceKm: distance
    };
  }
};
