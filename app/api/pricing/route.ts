import { NextResponse } from "next/server";
import { mergePricingConfig, type PricingConfig } from "../../pricing.config";
import { readPricingFromFile, writePricingToFile } from "../../pricing.server";

export const runtime = "nodejs";

export async function GET() {
  const config = await readPricingFromFile();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PricingConfig>;
    const config = mergePricingConfig(body);
    await writePricingToFile(config);
    return NextResponse.json({ success: true, config });
  } catch {
    return NextResponse.json({ error: "Failed to save pricing config." }, { status: 500 });
  }
}
