import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_PRICING_CONFIG, mergePricingConfig, type PricingConfig } from "./pricing.config";

const PRICING_FILE = path.join(process.cwd(), "data", "pricing.json");

export async function readPricingFromFile(): Promise<PricingConfig> {
  try {
    const raw = await fs.readFile(PRICING_FILE, "utf8");
    return mergePricingConfig(JSON.parse(raw) as Partial<PricingConfig>);
  } catch {
    return DEFAULT_PRICING_CONFIG;
  }
}

export async function writePricingToFile(config: PricingConfig): Promise<void> {
  await fs.mkdir(path.dirname(PRICING_FILE), { recursive: true });
  await fs.writeFile(PRICING_FILE, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}
