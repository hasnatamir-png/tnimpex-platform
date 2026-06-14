"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ADMIN_AUTH_STORAGE_KEY,
  ADMIN_PASSWORD,
  DEFAULT_PRICING_CONFIG,
  loadPricingConfig,
  savePricingConfig,
  type PricingConfig,
  type ShippingZone,
} from "../../pricing.config";

const VOLUME_TIERS = ["500", "1000", "2500", "5000", "10000"] as const;
const SHIPPING_ZONES: ShippingZone[] = ["local", "domestic", "international"];

function RecordEditor({
  title,
  records,
  onChange,
}: {
  title: string;
  records: Record<string, number>;
  onChange: (records: Record<string, number>) => void;
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">{title}</h2>
      <div className="grid gap-3">
        {Object.entries(records).map(([key, value]) => (
          <label key={key} className="grid grid-cols-[1fr_120px] gap-3 items-center">
            <span className="text-sm font-bold text-gray-700">{key}</span>
            <input
              type="number"
              step="0.0001"
              value={value}
              onChange={(e) =>
                onChange({ ...records, [key]: Number(e.target.value) || 0 })
              }
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#283593]"
            />
          </label>
        ))}
      </div>
    </section>
  );
}

export default function AdminPricingPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === "true") {
      setAuthenticated(true);
    }
    setConfig(loadPricingConfig());
  }, []);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "true");
      setAuthenticated(true);
      setAuthError("");
      return;
    }
    setAuthError("Incorrect password.");
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    savePricingConfig(config);
    setSavedMessage("Pricing saved to localStorage.");
    window.setTimeout(() => setSavedMessage(""), 2500);
  };

  const handleReset = () => {
    setConfig(DEFAULT_PRICING_CONFIG);
    savePricingConfig(DEFAULT_PRICING_CONFIG);
    setSavedMessage("Reset to defaults.");
    window.setTimeout(() => setSavedMessage(""), 2500);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 font-sans">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
        >
          <h1 className="text-2xl font-black text-gray-900 mb-2">Pricing Admin</h1>
          <p className="text-sm text-gray-500 mb-6">Enter the admin password to edit pricing.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[#283593] mb-3"
          />
          {authError && <p className="text-sm font-bold text-red-600 mb-3">{authError}</p>}
          <button
            type="submit"
            className="w-full px-5 py-3 bg-[#283593] rounded-lg text-sm font-bold text-white hover:bg-[#1A237E] transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-bold text-[#283593] hover:underline transition-colors"
          >
            ← Back to Studio
          </Link>
          <div className="w-px h-5 bg-gray-300" />
          <h1 className="font-black text-gray-900 text-[15px] tracking-tight">Pricing Admin</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
            setAuthenticated(false);
          }}
          className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          Sign Out
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <RecordEditor
            title="Material Rates"
            records={config.materialRates}
            onChange={(materialRates) => setConfig({ ...config, materialRates })}
          />

          <RecordEditor
            title="Thickness Multiplier"
            records={config.thicknessMultiplier}
            onChange={(thicknessMultiplier) => setConfig({ ...config, thicknessMultiplier })}
          />

          <RecordEditor
            title="Ink Multiplier"
            records={config.inkMultiplier}
            onChange={(inkMultiplier) => setConfig({ ...config, inkMultiplier })}
          />

          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
              Volume Discounts
            </h2>
            <div className="grid gap-3">
              {VOLUME_TIERS.map((tier) => (
                <label key={tier} className="grid grid-cols-[1fr_120px] gap-3 items-center">
                  <span className="text-sm font-bold text-gray-700">{tier}+ units</span>
                  <input
                    type="number"
                    step="0.01"
                    value={config.volumeDiscounts[tier] ?? 1}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        volumeDiscounts: {
                          ...config.volumeDiscounts,
                          [tier]: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#283593]"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
              Flat Fees & Margin
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Window Cost
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={config.windowCost}
                  onChange={(e) =>
                    setConfig({ ...config, windowCost: Number(e.target.value) || 0 })
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#283593]"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Profit Margin
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={config.profitMargin}
                  onChange={(e) =>
                    setConfig({ ...config, profitMargin: Number(e.target.value) || 0 })
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#283593]"
                />
              </label>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
              Shipping Rates
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {SHIPPING_ZONES.map((zone) => (
                <label key={zone} className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {zone}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={config.shippingRates[zone]}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        shippingRates: {
                          ...config.shippingRates,
                          [zone]: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#283593]"
                  />
                </label>
              ))}
            </div>
            <label className="flex flex-col gap-2 mt-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Default Shipping Zone
              </span>
              <select
                value={config.defaultShippingZone}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    defaultShippingZone: e.target.value as ShippingZone,
                  })
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#283593] bg-white max-w-xs"
              >
                {SHIPPING_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#283593] rounded-lg text-sm font-bold text-white hover:bg-[#1A237E] transition-colors"
            >
              Save Pricing
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reset to Defaults
            </button>
            {savedMessage && (
              <span className="text-sm font-bold text-[#283593]">{savedMessage}</span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
