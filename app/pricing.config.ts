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
export const ADMIN_AUTH_STORAGE_KEY = "tnimpex-admin-authenticated";

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  materialRates: {
    "SBS Premium White": 0.000,
    "Kraft Paperboard": 0.004,
    "Recycled Board": 0.0035,
    "Corrugated E-Flute": 0.012,
    "Corrugated B-Flute": 0.015,
    "Corrugated C-Flute": 0.018,
  },
  thicknessMultiplier: {
    "14pt (250gsm)": 0.0,
    "16pt (300gsm)": 1.0,
    "18pt (350gsm)": 1.2,
    "24pt (400gsm)": 1.5,
  },
  inkMultiplier: {
    "No Print (Blank)": 0.0,
    "Printed (CMYK)": 1.4,
    "Premium (Foil/Spot UV)": 2.1,
  },
  volumeDiscounts: {
    "500": 0.0,
    "1000": 0.85,
    "2500": 0.8,
    "5000": 0.75,
    "10000": 0.6,
  },
  windowCost: 0,
  shippingRates: {
    local: 0,
    domestic: 0,
    international: 350,
  },
  profitMargin: 0,
  surfaceAreaWasteFactor: 0.0,
  minQuantity: 500,
  defaultMaterialRate: 0.000,
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

export function mergePricingConfig(parsed: Partial<PricingConfig>): PricingConfig {
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
}

export async function loadPricingConfig(): Promise<PricingConfig> {
  if (typeof window === "undefined") {
    const { readPricingFromFile } = await import("./pricing.server");
    return readPricingFromFile();
  }

  try {
    const response = await fetch("/api/pricing", { cache: "no-store" });
    if (!response.ok) return DEFAULT_PRICING_CONFIG;
    const parsed = (await response.json()) as Partial<PricingConfig>;
    return mergePricingConfig(parsed);
  } catch {
    return DEFAULT_PRICING_CONFIG;
  }
}

export async function savePricingConfig(config: PricingConfig): Promise<void> {
  const response = await fetch("/api/pricing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(result.error || "Failed to save pricing config.");
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pricing-config-updated"));
  }
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
