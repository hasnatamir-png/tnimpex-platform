export type ShippingZone = "local" | "domestic" | "international";

export type PricingConfig = {
  materialRates: Record<string, number>;
  thicknessMultiplier: Record<string, number>;
  inkMultiplier: Record<string, number>;
  volumeDiscounts: Record<string, number>;
  windowCost: number;
  shippingRates: Record<ShippingZone, number>;
  profitMargin: number;
  surfaceAreaWasteFactor: number;
  minQuantity: number;
  defaultMaterialRate: number;
  defaultShippingZone: ShippingZone;
};

export const ADMIN_PASSWORD = "tnimpex-admin";
export const PRICING_STORAGE_KEY = "tnimpex-pricing-config";
export const ADMIN_AUTH_STORAGE_KEY = "tnimpex-admin-authenticated";

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  materialRates: {
    "SBS Premium White": 0.005,
    "Kraft Paperboard": 0.004,
    "Recycled Board": 0.0035,
    "Corrugated E-Flute": 0.012,
    "Corrugated B-Flute": 0.015,
    "Corrugated C-Flute": 0.018,
  },
  thicknessMultiplier: {
    "14pt (250gsm)": 0.8,
    "16pt (300gsm)": 1.0,
    "18pt (350gsm)": 1.2,
    "24pt (400gsm)": 1.5,
  },
  inkMultiplier: {
    "No Print (Blank)": 1.0,
    "Printed (CMYK)": 1.4,
    "Premium (Foil/Spot UV)": 2.1,
  },
  volumeDiscounts: {
    "500": 1.0,
    "1000": 0.85,
    "2500": 0.8,
    "5000": 0.75,
    "10000": 0.6,
  },
  windowCost: 0,
  shippingRates: {
    local: 75,
    domestic: 150,
    international: 350,
  },
  profitMargin: 0,
  surfaceAreaWasteFactor: 1.3,
  minQuantity: 500,
  defaultMaterialRate: 0.005,
  defaultShippingZone: "domestic",
};

export function getVolumeDiscount(
  quantity: number,
  volumeDiscounts: Record<string, number>,
): number {
  const tiers = Object.keys(volumeDiscounts)
    .map(Number)
    .filter((tier) => !Number.isNaN(tier))
    .sort((a, b) => b - a);

  for (const tier of tiers) {
    if (quantity >= tier) {
      return volumeDiscounts[String(tier)] ?? 1;
    }
  }

  return 1;
}

export function loadPricingConfig(): PricingConfig {
  if (typeof window === "undefined") {
    return DEFAULT_PRICING_CONFIG;
  }

  try {
    const stored = window.localStorage.getItem(PRICING_STORAGE_KEY);
    if (!stored) return DEFAULT_PRICING_CONFIG;

    const parsed = JSON.parse(stored) as Partial<PricingConfig>;
    return {
      ...DEFAULT_PRICING_CONFIG,
      ...parsed,
      materialRates: { ...DEFAULT_PRICING_CONFIG.materialRates, ...parsed.materialRates },
      thicknessMultiplier: {
        ...DEFAULT_PRICING_CONFIG.thicknessMultiplier,
        ...parsed.thicknessMultiplier,
      },
      inkMultiplier: { ...DEFAULT_PRICING_CONFIG.inkMultiplier, ...parsed.inkMultiplier },
      volumeDiscounts: {
        ...DEFAULT_PRICING_CONFIG.volumeDiscounts,
        ...parsed.volumeDiscounts,
      },
      shippingRates: { ...DEFAULT_PRICING_CONFIG.shippingRates, ...parsed.shippingRates },
    };
  } catch {
    return DEFAULT_PRICING_CONFIG;
  }
}

export function savePricingConfig(config: PricingConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event("pricing-config-updated"));
}

export type PriceCalculationInput = {
  length: number;
  width: number;
  height: number;
  material: string;
  materialCategory: string;
  thickness: string;
  quantity: number | "";
  inkCoverage: string;
  isWindowed: boolean;
};

export type PriceCalculationResult = {
  unit: number;
  total: number;
  displayQty: number;
  materialCost: number;
  printCost: number;
  setupFees: number;
  shippingEstimate: number;
  profitAmount: number;
};

export function calculatePrice(
  input: PriceCalculationInput,
  config: PricingConfig,
): PriceCalculationResult {
  const l = Number(input.length) || 0;
  const w = Number(input.width) || 0;
  const h = Number(input.height) || 0;
  const calcQty = Math.max(config.minQuantity, Number(input.quantity) || config.minQuantity);

  const surfaceAreaSqIn =
    ((l * w * 2) + (l * h * 2) + (w * h * 2)) * config.surfaceAreaWasteFactor;

  let baseRate = config.materialRates[input.material] ?? config.defaultMaterialRate;
  if (
    input.materialCategory === "Cardboard" &&
    config.thicknessMultiplier[input.thickness]
  ) {
    baseRate *= config.thicknessMultiplier[input.thickness];
  }

  const inkMultiplier = config.inkMultiplier[input.inkCoverage] ?? 1.0;
  const volumeDiscount = getVolumeDiscount(calcQty, config.volumeDiscounts);
  const materialUnit = baseRate * volumeDiscount * surfaceAreaSqIn;
  const materialCost = materialUnit * calcQty;
  const printCost = materialCost * Math.max(0, inkMultiplier - 1);
  const unitPrice = baseRate * inkMultiplier * volumeDiscount * surfaceAreaSqIn;
  const productionSubtotal = unitPrice * calcQty;
  const shipping = config.shippingRates[config.defaultShippingZone];
  const windowFee = input.isWindowed ? config.windowCost : 0;
  const setupFees = windowFee;
  const beforeMargin = productionSubtotal + shipping + setupFees;
  const profitAmount = beforeMargin * config.profitMargin;
  const total = beforeMargin * (1 + config.profitMargin);

  return {
    unit: unitPrice,
    total,
    displayQty: calcQty,
    materialCost,
    printCost,
    setupFees,
    shippingEstimate: shipping,
    profitAmount,
  };
}
