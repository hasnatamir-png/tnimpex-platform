import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  DEFAULT_PRICING_CONFIG,
  mergePricingConfig,
  type PricingConfig,
} from "../../pricing.config";

export const runtime = "nodejs";

const PRICING_FILE = path.join(process.cwd(), "data", "pricing.json");

async function readPricingFile(): Promise<PricingConfig> {
  try {
    const raw = await fs.readFile(PRICING_FILE, "utf8");
    return mergePricingConfig(JSON.parse(raw) as Partial<PricingConfig>);
  } catch {
    return DEFAULT_PRICING_CONFIG;
  }
}

async function writePricingFile(config: PricingConfig): Promise<void> {
  await fs.mkdir(path.dirname(PRICING_FILE), { recursive: true });
  await fs.writeFile(PRICING_FILE, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export async function GET() {
  const config = await readPricingFile();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PricingConfig>;
    const config = mergePricingConfig(body);
    await writePricingFile(config);
    return NextResponse.json({ success: true, config });
  } catch {
    return NextResponse.json({ error: "Failed to save pricing config." }, { status: 500 });
  }
}
