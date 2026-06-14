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
    loadPricingConfig().then(setConfig);

    const syncConfig = () => {
      loadPricingConfig().then(setConfig);
    };
    window.addEventListener("pricing-config-updated", syncConfig);

    return () => {
      window.removeEventListener("pricing-config-updated", syncConfig);
    };
  }, []);

  return config;
}
