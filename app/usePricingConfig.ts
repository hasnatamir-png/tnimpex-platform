"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PRICING_CONFIG,
  loadPricingConfig,
  type PricingConfig,
} from "./pricing.config";

export function usePricingConfig(): PricingConfig {
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);

  useEffect(() => {
    setConfig(loadPricingConfig());

    const syncConfig = () => setConfig(loadPricingConfig());
    window.addEventListener("pricing-config-updated", syncConfig);
    window.addEventListener("storage", syncConfig);

    return () => {
      window.removeEventListener("pricing-config-updated", syncConfig);
      window.removeEventListener("storage", syncConfig);
    };
  }, []);

  return config;
}
