// ============================================================
// Shared TypeScript types — Monetizely Frontend
// These mirror the backend types to ensure type safety
// across the API boundary.
// ============================================================

export type Availability = 'included' | 'add-on' | 'not_available';
export type PricingModel = 'fixed_monthly' | 'per_seat' | 'percent_of_product';
export type TermLength = 'monthly' | 'annual' | 'two-year';

// ---- Catalog -----------------------------------------------

export interface TierConfig {
  tierId: string;
  tierName: string;
  availability: Availability;
  pricingModel?: PricingModel | null;
  pricingValue?: number | null;
}

export interface Feature {
  _id: string;
  name: string;
  tierConfigs: TierConfig[];
}

export interface Tier {
  _id: string;
  name: string;
  basePricePerSeat: number;
  order: number;
}

export interface Product {
  _id: string;
  name: string;
  tiers: Tier[];
  features: Feature[];
  createdAt: string;
  updatedAt: string;
}

// ---- Quotes ------------------------------------------------

export interface SelectedAddon {
  featureId: string;
  featureName: string;
  pricingModel: PricingModel;
  pricingValue: number;
  addonSeats?: number | null;
}

export interface LineItem {
  label: string;
  calculation: string;
  notes: string;
  amount: number;
}

export interface Quote {
  _id: string;
  quoteId: string;
  quoteName: string;
  customerName: string;
  quoteDate: string;
  validUntil: string;
  productId: string;
  productName: string;
  tierId: string;
  tierName: string;
  basePricePerSeat: number;
  seats: number;
  termLength: TermLength;
  termDiscountPercent: number;
  selectedAddons: SelectedAddon[];
  overallDiscountPercent: number;
  lineItems: LineItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  createdAt: string;
}

// ---- API response wrappers ---------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ---- Quote builder form state ------------------------------

export interface AddonInput {
  featureId: string;
  featureName: string;
  pricingModel: PricingModel;
  pricingValue: number;
  addonSeats?: number | null;
}

export interface CreateQuotePayload {
  quoteName: string;
  customerName: string;
  productId: string;
  tierId: string;
  seats: number;
  termLength: TermLength;
  selectedAddons: AddonInput[];
  overallDiscountPercent: number;
}
