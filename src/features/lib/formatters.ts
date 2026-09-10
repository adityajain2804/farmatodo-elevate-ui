import { Country, OfferMechanic } from '../types';

export function formatCurrency(amount: number, country: Country = 'Colombia'): string {
  if (country === 'Colombia') {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(2)}B COP`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M COP`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K COP`;
    }
    return `$${amount.toLocaleString()} COP`;
  } else {
    if (Math.abs(amount) >= 1_000_000) {
      return `Bs. ${(amount / 1_000_000).toFixed(2)}M`;
    }
    return `Bs. ${amount.toLocaleString()}`;
  }
}

export function formatNumber(val: number): string {
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

export function formatPercent(val: number): string {
  return `${(val).toFixed(1)}%`;
}

/**
 * Requirement 3: Conditional Offer Formatting
 * No % for coupons, multibuy, or bundles!
 */
export function formatDiscountOffer(mechanic: OfferMechanic, value: number, country: Country = 'Colombia'): string {
  switch (mechanic) {
    case 'coupon':
      return country === 'Colombia' ? `-$${value * 1000} COP Coupon` : `-$${value} Voucher`;
    case 'multibuy':
      return `Buy 2 Get 1 Free`;
    case 'bundle':
      return `Bundle Combo Pack`;
    case 'special_price':
      return `${formatCurrency(value, country)} Fixed Price`;
    case 'prime_differential':
      return `+${value}% Prime Add-On`;
    case 'pct_discount':
    default:
      return `${value}%`;
  }
}
