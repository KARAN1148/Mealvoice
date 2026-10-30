import { config } from '../config';

export interface PricingInput {
  subtotal: number;
  distanceKm?: number;
  discountAmount?: number;
  isPeakHour?: boolean;
  isRainy?: boolean;
}

export interface PricingResult {
  subtotal: number;
  deliveryFee: number;
  deliveryFeeBreakdown: {
    baseFee: number;
    distanceFee: number;
    surcharge: number;
    surchargeLabel: string | null;
  };
  cgst: number;        // 2.5% food GST (Central)
  sgst: number;        // 2.5% food GST (State)
  tax: number;         // cgst + sgst = 5% total
  discount: number;
  totalAmount: number;
  distanceKm: number;
  taxRate: number;
}

export const pricingService = {
  calculatePricing: (input: PricingInput): PricingResult => {
    const subtotal = Math.max(0, Math.round(input.subtotal * 100) / 100);
    const distanceKm = input.distanceKm || 3.5;

    // Delivery fee: base + per-km (rounded to nearest ₹5)
    const baseFee = config.baseDeliveryFee;
    const distanceFee = Math.round(distanceKm * config.perKmFee);

    // Peak-hour / bad-weather surcharge
    let surcharge = 0;
    let surchargeLabel: string | null = null;
    if (input.isPeakHour) {
      surcharge = 15;
      surchargeLabel = 'Peak hour surcharge';
    }
    if (input.isRainy) {
      surcharge += 10;
      surchargeLabel = surchargeLabel ? 'Peak hour + rainy surcharge' : 'Rainy weather surcharge';
    }

    // Free delivery for orders above ₹500
    const rawDeliveryFee = subtotal >= 500 ? 0 : baseFee + distanceFee + surcharge;
    const deliveryFee = rawDeliveryFee;

    // GST: 5% total on food (CGST 2.5% + SGST 2.5%) per Indian tax law
    const taxRate = config.taxRate; // 0.05
    const tax = Math.round(subtotal * taxRate);
    const cgst = Math.round(tax / 2);
    const sgst = tax - cgst; // handles rounding remainder

    const discount = Math.max(0, input.discountAmount || 0);
    const totalAmount = Math.max(0, Math.round((subtotal + deliveryFee + tax - discount) * 100) / 100);

    return {
      subtotal,
      deliveryFee,
      deliveryFeeBreakdown: {
        baseFee: subtotal >= 500 ? 0 : baseFee,
        distanceFee: subtotal >= 500 ? 0 : distanceFee,
        surcharge: subtotal >= 500 ? 0 : surcharge,
        surchargeLabel: subtotal >= 500 ? null : surchargeLabel
      },
      cgst,
      sgst,
      tax,
      discount,
      totalAmount,
      distanceKm,
      taxRate
    };
  },

  formatForInvoice: (pricing: PricingResult) => ({
    itemTotal: `₹${pricing.subtotal.toFixed(2)}`,
    deliveryFee: pricing.deliveryFee === 0 ? 'FREE' : `₹${pricing.deliveryFee.toFixed(2)}`,
    cgst: `₹${pricing.cgst.toFixed(2)} (2.5%)`,
    sgst: `₹${pricing.sgst.toFixed(2)} (2.5%)`,
    taxTotal: `₹${pricing.tax.toFixed(2)} (5%)`,
    discount: pricing.discount > 0 ? `-₹${pricing.discount.toFixed(2)}` : null,
    grandTotal: `₹${pricing.totalAmount.toFixed(2)}`
  })
};
