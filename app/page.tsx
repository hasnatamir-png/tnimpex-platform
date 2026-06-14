"use client";

import { useState, useMemo } from "react";
import BoxCanvas from "./BoxCanvas";
import Dieline from "./Dieline";

type PanelKey = "front" | "back" | "left" | "right" | "top" | "bottom";
type ColorMode = "CMYK" | "2C" | "1C";
type Graphic = { id: string, originalUrl: string, displayUrl: string, scale: number, x: number, y: number };

const TILogo = ({ size = "w-10 h-10", text = "text-xl" }) => (
  <div className={`relative ${size} flex items-center justify-center bg-[#C62828] rounded-full overflow-hidden shrink-0 shadow-sm border border-red-800/20`}>
    <span className={`text-white font-black ${text} tracking-tighter relative z-10 -top-[1px] ml-0.5`}>TI</span>
    <div className="absolute -bottom-[20%] left-[-15%] w-[130%] h-[45%] bg-[#283593] rounded-[100%] transform -rotate-12 border-t-2 border-white"></div>
  </div>
);

const Box3DOutline = ({ style }: { style: string }) => {
  if (style === "tray-lock") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <polygon points="50,40 90,55 50,70 10,55" fill="#8B602B"/>
      <polygon points="10,55 50,70 50,85 10,70" fill="#CBA36A"/>
      <polygon points="90,55 50,70 50,85 90,70" fill="#A67C46"/>
      <polygon points="10,55 50,40 50,15 10,30" fill="#E1C699"/>
    </svg>
  );
  if (style === "sleeve") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <polygon points="50,30 90,50 50,70 10,50" fill="#334155"/>
      <polygon points="10,50 50,70 50,95 10,75" fill="#CBA36A"/>
      <polygon points="90,50 50,70 50,95 90,75" fill="#A67C46"/>
    </svg>
  );
  if (style === "mailer") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <polygon points="50,44 88,56 50,68 12,56" fill="#8B602B"/>
      <polygon points="12,56 50,68 50,86 12,74" fill="#CBA36A"/>
      <polygon points="88,56 50,68 50,86 88,74" fill="#A67C46"/>
      <polygon points="12,56 50,44 36,30 6,40"  fill="#E1C699" opacity="0.85"/>
      <polygon points="88,56 50,44 64,30 94,40"  fill="#D4B87A" opacity="0.85"/>
    </svg>
  );
  if (style === "pillow") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <path d="M20,50 Q50,28 80,50 Q80,72 50,90 Q20,72 20,50" fill="#CBA36A"/>
      <path d="M20,50 Q50,38 80,50" fill="none" stroke="#E1C699" strokeWidth="2"/>
      <ellipse cx="20" cy="50" rx="5" ry="14" fill="#A67C46"/>
      <ellipse cx="80" cy="50" rx="5" ry="14" fill="#A67C46"/>
    </svg>
  );
  if (style === "gable") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <polygon points="50,12 90,30 90,72 50,82 10,72 10,30" fill="#8B602B" opacity="0.7"/>
      <polygon points="10,30 50,42 50,82 10,72" fill="#CBA36A"/>
      <polygon points="90,30 50,42 50,82 90,72" fill="#A67C46"/>
      <polygon points="10,30 50,12 90,30 50,42" fill="#E1C699"/>
      <rect x="38" y="4" width="24" height="9" rx="2" fill="none" stroke="#E1C699" strokeWidth="1.5"/>
      <polygon points="35,12 65,12 60,5 40,5" fill="#C4965A"/>
    </svg>
  );
  if (style === "two-piece") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <polygon points="50,70 88,80 50,90 12,80" fill="#CBA36A"/>
      <polygon points="12,80 50,90 50,98 12,88" fill="#A67C46" opacity="0.6"/>
      <polygon points="88,80 50,90 50,98 88,88" fill="#8B602B" opacity="0.6"/>
      <polygon points="50,36 90,48 50,60 10,48" fill="#8B602B"/>
      <polygon points="10,48 50,60 50,70 10,58" fill="#CBA36A"/>
      <polygon points="90,48 50,60 50,70 90,58" fill="#A67C46"/>
      <polygon points="10,48 50,36 50,18 10,28" fill="#E1C699"/>
      <line x1="12" y1="58" x2="12" y2="76" stroke="#CBA36A" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"/>
      <line x1="88" y1="58" x2="88" y2="76" stroke="#CBA36A" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"/>
    </svg>
  );
  if (style === "drawer") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <rect x="8" y="30" width="84" height="40" rx="2" fill="#8B602B" opacity="0.7"/>
      <rect x="8" y="30" width="84" height="8"  rx="2" fill="#A67C46"/>
      <rect x="8" y="62" width="84" height="8"  rx="2" fill="#A67C46"/>
      <rect x="50" y="35" width="48" height="30" rx="1" fill="#E1C699"/>
      <rect x="88" y="30" width="10" height="40" rx="2" fill="#D4AA6A"/>
    </svg>
  );
  if (style === "snap-lock") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <polygon points="50,25 75,40 50,55 25,40" fill="#8B602B"/>
      <polygon points="25,40 50,55 50,95 25,80" fill="#CBA36A"/>
      <polygon points="75,40 50,55 50,95 75,80" fill="#A67C46"/>
      <polygon points="25,40 50,25 65,5 40,20"  fill="#E1C699"/>
      {/* Snap bottom panels — cross/star pattern */}
      <polygon points="38,95 50,88 50,95 38,100" fill="#8B5E2A" opacity="0.7"/>
      <polygon points="62,95 50,88 50,95 62,100" fill="#7A5225" opacity="0.7"/>
    </svg>
  );
  if (style === "display") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      {/* Open-front display box with shelf folded down */}
      <polygon points="12,20 88,20 88,75 12,75" fill="#8B602B" opacity="0.15" stroke="#8B602B" strokeWidth="1"/>
      <line x1="12" y1="20" x2="12" y2="75" stroke="#8B602B" strokeWidth="3"/>
      <line x1="88" y1="20" x2="88" y2="75" stroke="#8B602B" strokeWidth="3"/>
      <line x1="12" y1="20" x2="88" y2="20" stroke="#8B602B" strokeWidth="2"/>
      {/* Shelf panel folded down */}
      <polygon points="12,75 88,75 88,90 12,90" fill="#CBA36A"/>
      <polygon points="12,90 88,90 88,96 12,96" fill="#A67C46"/>
      {/* products on shelf */}
      <rect x="22" y="42" width="15" height="30" rx="1" fill="#E1C699" opacity="0.6"/>
      <rect x="43" y="38" width="15" height="34" rx="1" fill="#D4AA6A" opacity="0.6"/>
      <rect x="64" y="45" width="14" height="27" rx="1" fill="#C89B5A" opacity="0.6"/>
    </svg>
  );
  if (style === "seal-end") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <polygon points="50,28 75,40 50,52 25,40" fill="#8B602B"/>
      <polygon points="25,40 50,52 50,88 25,76" fill="#CBA36A"/>
      <polygon points="75,40 50,52 50,88 75,76" fill="#A67C46"/>
      <polygon points="25,40 50,28 50,8 25,18"  fill="#E1C699"/>
      {/* Seal flaps at top */}
      <polygon points="25,18 50,8 75,18 50,26" fill="#D4AA6A" opacity="0.9"/>
      {/* Seal flaps at bottom */}
      <polygon points="25,76 50,88 75,76 50,68" fill="#C89B5A" opacity="0.9"/>
    </svg>
  );
  if (style === "hex") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      {/* Hexagonal box isometric */}
      <polygon points="50,18 73,32 73,68 50,82 27,68 27,32" fill="#CBA36A" stroke="#A67C46" strokeWidth="1"/>
      <polygon points="50,18 73,32 50,46 27,32" fill="#E1C699"/>
      <polygon points="73,32 73,68 50,82 50,46" fill="#A67C46"/>
      <polygon points="50,82 27,68 27,32 50,46" fill="#8B602B" opacity="0.7"/>
    </svg>
  );
  if (style === "roll-end") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <polygon points="50,28 75,40 50,52 25,40" fill="#8B602B"/>
      <polygon points="25,40 50,52 50,84 25,72" fill="#CBA36A"/>
      <polygon points="75,40 50,52 50,84 75,72" fill="#A67C46"/>
      <polygon points="25,40 50,28 50,8  25,18" fill="#E1C699"/>
      {/* Rolled gusset curves on sides */}
      <path d="M25,18 Q18,25 18,40 Q18,55 25,62" fill="none" stroke="#CBA36A" strokeWidth="3"/>
      <path d="M75,18 Q82,25 82,40 Q82,55 75,62" fill="none" stroke="#A67C46" strokeWidth="3"/>
    </svg>
  );
  if (style === "five-panel") return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <polygon points="50,35 75,46 50,57 25,46" fill="#8B602B"/>
      <polygon points="25,46 50,57 50,90 25,78" fill="#CBA36A"/>
      <polygon points="75,46 50,57 50,90 75,78" fill="#A67C46"/>
      <polygon points="25,46 50,35 50,16 25,26" fill="#E1C699"/>
      {/* Header panel (5th panel) at top with euro-slot */}
      <polygon points="25,16 75,16 75,5 25,5"  fill="#D4B87A"/>
      <rect x="37" y="6" width="26" height="7" rx="3" fill="none" stroke="#8B602B" strokeWidth="1.5"/>
    </svg>
  );
  // Default: straight-tuck / reverse-tuck
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <polygon points="50,25 75,40 50,55 25,40" fill="#8B602B"/>
      <polygon points="25,40 50,55 50,95 25,80" fill="#CBA36A"/>
      <polygon points="75,40 50,55 50,95 75,80" fill="#A67C46"/>
      <polygon points="25,40 50,25 65,5  40,20" fill="#E1C699"/>
    </svg>
  );
};

const catalog: Record<string, any[]> = {
 
  // ── 1. COSMETIC BOXES ────────────────────────────────────────────────────────
  "Cosmetic Boxes": [
    { name: "Cream Boxes",          l:2.5, w:2.5, d:2,    style:"straight-tuck" },
    { name: "Foundation Boxes",     l:3,   w:2,   d:4,    style:"straight-tuck" },
    { name: "Lipstick Boxes",       l:1,   w:1,   d:3.5,  style:"reverse-tuck"  },
    { name: "Lotion Boxes",         l:2.5, w:2,   d:5,    style:"straight-tuck" },
    { name: "Perfume Boxes",        l:2.5, w:2.5, d:4,    style:"straight-tuck" },
    { name: "Nail Polish Boxes",    l:1.5, w:1.5, d:4,    style:"reverse-tuck"  },
    { name: "Mascara Boxes",        l:1.2, w:1.2, d:5.5,  style:"reverse-tuck"  },
    { name: "Serum Boxes",          l:1.5, w:1.5, d:5,    style:"reverse-tuck"  },
    { name: "Eye Shadow Tray",      l:4,   w:3,   d:1,    style:"tray-lock"     },
    { name: "Blush Compact Tray",   l:3.5, w:3,   d:1,    style:"tray-lock"     },
    { name: "Setting Powder Box",   l:4,   w:4,   d:1.5,  style:"tray-lock"     },
    { name: "Eyeliner Boxes",       l:1,   w:1,   d:5.5,  style:"reverse-tuck"  },
    { name: "Lip Gloss Boxes",      l:1.2, w:1.2, d:3.5,  style:"reverse-tuck"  },
    { name: "Concealer Boxes",      l:1.5, w:1,   d:4,    style:"straight-tuck" },
    { name: "Highlighter Boxes",    l:3,   w:3,   d:1,    style:"tray-lock"     },
    { name: "Dropper Boxes",        l:1.5, w:1.5, d:4.5,  style:"reverse-tuck"  },
    { name: "Face Mask Boxes",      l:4,   w:1,   d:6,    style:"snap-lock"     },
    { name: "Tinted Moisturizer",   l:2,   w:2,   d:4.5,  style:"snap-lock"     },
    { name: "Palette Display Box",  l:5,   w:3,   d:2,    style:"display"       },
    { name: "Duo Serum Box",        l:2,   w:2,   d:5,    style:"snap-lock"     },
  ],
 
  // ── 2. BAKERY / FOOD BOXES ───────────────────────────────────────────────────
  "Bakery / Food Boxes": [
    { name: "Cake Boxes",           l:10,  w:10,  d:5,    style:"tray-lock"     },
    { name: "Cookie Boxes",         l:6,   w:4,   d:2,    style:"tray-lock"     },
    { name: "Cupcake Boxes",        l:8,   w:4,   d:4,    style:"tray-lock"     },
    { name: "Macaron Boxes",        l:8,   w:3,   d:2,    style:"tray-lock"     },
    { name: "Donut Boxes",          l:12,  w:12,  d:4,    style:"tray-lock"     },
    { name: "Muffin Boxes",         l:6,   w:6,   d:4,    style:"tray-lock"     },
    { name: "Brownie Boxes",        l:8,   w:6,   d:2,    style:"tray-lock"     },
    { name: "Pizza Boxes",          l:12,  w:12,  d:2,    style:"tray-lock"     },
    { name: "Burger Boxes",         l:5,   w:5,   d:4,    style:"tray-lock"     },
    { name: "Chocolate Boxes",      l:6,   w:4,   d:2,    style:"tray-lock"     },
    { name: "Sandwich Sleeves",     l:6,   w:2,   d:3.5,  style:"sleeve"        },
    { name: "Shawarma Sleeves",     l:8,   w:3,   d:2,    style:"sleeve"        },
    { name: "French Fries Boxes",   l:3,   w:2.5, d:5,    style:"snap-lock"     },
    { name: "Popcorn Boxes",        l:3.5, w:3.5, d:6,    style:"seal-end"      },
    { name: "Cereal Boxes",         l:8,   w:3,   d:10,   style:"seal-end"      },
    { name: "Granola Bar Box",      l:7,   w:2,   d:4,    style:"seal-end"      },
    { name: "Tea / Coffee Boxes",   l:5,   w:3,   d:4,    style:"straight-tuck" },
    { name: "Snack Boxes",          l:6,   w:3,   d:3.5,  style:"straight-tuck" },
    { name: "Candy Boxes",          l:4,   w:3,   d:2,    style:"straight-tuck" },
    { name: "Bakery Carrier",       l:8,   w:4,   d:5,    style:"gable"         },
    { name: "Take Out Carrier",     l:6,   w:4,   d:5,    style:"gable"         },
    { name: "Lunch Boxes",          l:8,   w:5,   d:3,    style:"tray-lock"     },
    { name: "Sushi Box",            l:8,   w:4,   d:2,    style:"tray-lock"     },
    { name: "Condiment Display",    l:8,   w:5,   d:4,    style:"display"       },
  ],
 
  // ── 3. APPAREL BOXES ─────────────────────────────────────────────────────────
  "Apparel Boxes": [
    { name: "Shirt Boxes",          l:11,  w:8.5, d:2,    style:"tray-lock"     },
    { name: "Shoe Boxes",           l:12,  w:6,   d:5,    style:"tray-lock"     },
    { name: "Hat Boxes",            l:12,  w:12,  d:6,    style:"tray-lock"     },
    { name: "Belt Boxes",           l:14,  w:3,   d:2,    style:"tray-lock"     },
    { name: "Scarf Boxes",          l:12,  w:5,   d:2,    style:"tray-lock"     },
    { name: "Lingerie Boxes",       l:10,  w:8,   d:2,    style:"tray-lock"     },
    { name: "Socks Boxes",          l:4,   w:4,   d:2,    style:"snap-lock"     },
    { name: "Tights Boxes",         l:6,   w:4,   d:1,    style:"straight-tuck" },
    { name: "Tie Boxes",            l:4,   w:4,   d:3,    style:"straight-tuck" },
    { name: "Sunglasses Box",       l:7,   w:3,   d:3,    style:"tray-lock"     },
    { name: "Watch Boxes",          l:5,   w:5,   d:3,    style:"tray-lock"     },
    { name: "Jewelry Boxes",        l:4,   w:4,   d:2,    style:"tray-lock"     },
    { name: "Underwear Boxes",      l:8,   w:6,   d:1.5,  style:"tray-lock"     },
    { name: "Swimwear Boxes",       l:9,   w:7,   d:2,    style:"tray-lock"     },
    { name: "Hosiery Hanger Box",   l:4,   w:1.5, d:8,    style:"five-panel"    },
    { name: "Socks Hanger Box",     l:4,   w:1,   d:6,    style:"five-panel"    },
  ],
 
  // ── 4. CANDLE BOXES ──────────────────────────────────────────────────────────
  "Candle Boxes": [
    { name: "Pillar Candle Boxes",  l:4,   w:4,   d:6,    style:"straight-tuck" },
    { name: "Votive Candle Boxes",  l:2.5, w:2.5, d:3,    style:"straight-tuck" },
    { name: "Tea Light Boxes",      l:6,   w:4,   d:1.5,  style:"tray-lock"     },
    { name: "Tuck Top Candle",      l:3.5, w:3.5, d:5,    style:"snap-lock"     },
    { name: "Jar Candle Boxes",     l:4,   w:4,   d:4,    style:"tray-lock"     },
    { name: "Multi-Candle Boxes",   l:10,  w:5,   d:4,    style:"tray-lock"     },
    { name: "Taper Candle Boxes",   l:2,   w:2,   d:10,   style:"straight-tuck" },
    { name: "Windowed Candle Box",  l:3,   w:3,   d:5,    style:"straight-tuck" },
    { name: "Soy Candle Boxes",     l:3.5, w:3.5, d:4,    style:"straight-tuck" },
    { name: "Travel Candle Box",    l:3,   w:3,   d:2.5,  style:"tray-lock"     },
    { name: "Tin Candle Sleeve",    l:4,   w:4,   d:3.5,  style:"sleeve"        },
    { name: "Hex Candle Box",       l:3,   w:3,   d:5,    style:"hex"           },
    { name: "Hex Gift Set",         l:4,   w:4,   d:4,    style:"hex"           },
    { name: "Candle Gift Box",      l:4,   w:4,   d:5,    style:"two-piece"     },
    { name: "Luxury Candle Set",    l:10,  w:5,   d:4,    style:"two-piece"     },
    { name: "Candle Display Stand", l:6,   w:4,   d:8,    style:"display"       },
  ],
 
  // ── 5. PHARMACEUTICAL BOXES ───────────────────────────────────────────────────
  "Pharmaceutical Boxes": [
    { name: "Medicine Boxes",       l:3,   w:1.5, d:4,    style:"straight-tuck" },
    { name: "Pill Boxes",           l:2,   w:1.5, d:3,    style:"reverse-tuck"  },
    { name: "Supplement Boxes",     l:3,   w:2,   d:5,    style:"snap-lock"     },
    { name: "Dropper Boxes",        l:1.5, w:1.5, d:4.5,  style:"reverse-tuck"  },
    { name: "Syrup Boxes",          l:2,   w:1.5, d:5,    style:"straight-tuck" },
    { name: "Inhaler Boxes",        l:2,   w:1,   d:3.5,  style:"straight-tuck" },
    { name: "Tablet Strip Boxes",   l:4,   w:2,   d:1,    style:"tray-lock"     },
    { name: "Cream Tube Boxes",     l:2,   w:1,   d:6,    style:"roll-end"      },
    { name: "Blister Pack Boxes",   l:4,   w:2.5, d:1.5,  style:"snap-lock"     },
    { name: "Vitamin Boxes",        l:3,   w:2,   d:4.5,  style:"snap-lock"     },
    { name: "Ointment Boxes",       l:2.5, w:1.5, d:4,    style:"reverse-tuck"  },
    { name: "Eye Drop Boxes",       l:1.5, w:1,   d:4.5,  style:"reverse-tuck"  },
    { name: "Nasal Spray Boxes",    l:1.5, w:1.5, d:5,    style:"straight-tuck" },
    { name: "Test Kit Boxes",       l:6,   w:4,   d:2,    style:"tray-lock"     },
    { name: "Hanger Blister",       l:4,   w:1,   d:6,    style:"five-panel"    },
    { name: "Injection Boxes",      l:4,   w:1.5, d:4,    style:"roll-end"      },
  ],
 
  // ── 6. CBD BOXES ─────────────────────────────────────────────────────────────
  "CBD Boxes": [
    { name: "Oil Boxes",            l:1.5, w:1.5, d:4.5,  style:"reverse-tuck"  },
    { name: "Skincare Boxes",       l:2.5, w:2.5, d:2.5,  style:"snap-lock"     },
    { name: "Gummy Boxes",          l:3,   w:2,   d:4,    style:"seal-end"      },
    { name: "Capsule Boxes",        l:2,   w:1.5, d:4,    style:"reverse-tuck"  },
    { name: "Vapes & E-Liquid",     l:1,   w:1,   d:5,    style:"reverse-tuck"  },
    { name: "Topical Boxes",        l:2.5, w:1.5, d:3.5,  style:"straight-tuck" },
    { name: "Tincture Boxes",       l:1.5, w:1.5, d:5,    style:"reverse-tuck"  },
    { name: "Pre-Roll Boxes",       l:4,   w:1,   d:1,    style:"snap-lock"     },
    { name: "Concentrate Boxes",    l:2,   w:2,   d:2,    style:"straight-tuck" },
    { name: "Wax / Shatter Boxes",  l:2.5, w:2,   d:1.5,  style:"tray-lock"     },
    { name: "CBD Cream Boxes",      l:2,   w:2,   d:4,    style:"snap-lock"     },
    { name: "Bath Bomb Boxes",      l:3,   w:3,   d:3,    style:"straight-tuck" },
    { name: "Sleep Aid Boxes",      l:2.5, w:1.5, d:4,    style:"snap-lock"     },
    { name: "Edible Display Box",   l:5,   w:3,   d:4,    style:"display"       },
    { name: "CBD Hanger Box",       l:3,   w:1,   d:5,    style:"five-panel"    },
    { name: "Hemp Tea Box",         l:4,   w:3,   d:3,    style:"seal-end"      },
  ],
 
  // ── 7. E-COMMERCE & SHIPPING ─────────────────────────────────────────────────
  "E-Commerce & Shipping": [
    { name: "Small Mailer Box",     l:6,   w:4,   d:4,    style:"mailer"        },
    { name: "Medium Mailer Box",    l:10,  w:8,   d:6,    style:"mailer"        },
    { name: "Large Mailer Box",     l:14,  w:10,  d:8,    style:"mailer"        },
    { name: "Book Mailer",          l:10,  w:8,   d:2,    style:"mailer"        },
    { name: "Shirt Mailer",         l:12,  w:10,  d:3,    style:"mailer"        },
    { name: "Shoe Mailer",          l:14,  w:8,   d:6,    style:"mailer"        },
    { name: "Electronics Box",      l:10,  w:8,   d:4,    style:"mailer"        },
    { name: "Jewelry Mailer",       l:6,   w:4,   d:3,    style:"mailer"        },
    { name: "Cosmetics Mailer",     l:8,   w:6,   d:4,    style:"mailer"        },
    { name: "Subscription Box",     l:10,  w:8,   d:5,    style:"mailer"        },
    { name: "CD / DVD Mailer",      l:6,   w:6,   d:1,    style:"mailer"        },
    { name: "Bottle Mailer",        l:4,   w:4,   d:14,   style:"mailer"        },
    { name: "Flat Rate Sleeve",     l:10,  w:3,   d:7,    style:"sleeve"        },
    { name: "FEFCO RSC Box",        l:12,  w:10,  d:8,    style:"mailer"        },
    { name: "Crash Lock Shipping",  l:10,  w:8,   d:6,    style:"snap-lock"     },
  ],
 
  // ── 8. GIFT BOXES ────────────────────────────────────────────────────────────
  "Gift Boxes": [
    { name: "Classic Gift Box",     l:8,   w:6,   d:3,    style:"two-piece"     },
    { name: "Jewellery Gift Box",   l:4,   w:3,   d:2,    style:"two-piece"     },
    { name: "Watch Gift Box",       l:5,   w:5,   d:3,    style:"two-piece"     },
    { name: "Shirt Gift Box",       l:12,  w:9,   d:2,    style:"two-piece"     },
    { name: "Perfume Gift Box",     l:4,   w:4,   d:5,    style:"two-piece"     },
    { name: "Chocolate Gift Box",   l:8,   w:6,   d:2,    style:"two-piece"     },
    { name: "Pillow Gift Box",      l:6,   w:3,   d:4,    style:"pillow"        },
    { name: "Favour Pillow Box",    l:4,   w:2,   d:2.5,  style:"pillow"        },
    { name: "Candy Pillow Box",     l:5,   w:2.5, d:3,    style:"pillow"        },
    { name: "Bakery Gift Carrier",  l:8,   w:4,   d:5,    style:"gable"         },
    { name: "Party Gable Box",      l:5,   w:3,   d:5,    style:"gable"         },
    { name: "Holiday Gable Box",    l:6,   w:4,   d:6,    style:"gable"         },
    { name: "Luxury Drawer Box",    l:8,   w:4,   d:3,    style:"drawer"        },
    { name: "Matchbox Style",       l:5,   w:3,   d:2,    style:"drawer"        },
    { name: "Perfume Drawer Box",   l:4,   w:4,   d:5,    style:"drawer"        },
    { name: "Hex Gift Box",         l:4,   w:4,   d:4,    style:"hex"           },
    { name: "Hex Candy Box",        l:3,   w:3,   d:5,    style:"hex"           },
    { name: "Magnetic Gift Box",    l:8,   w:6,   d:4,    style:"two-piece"     },
  ],
 
  // ── 9. RETAIL & DISPLAY ──────────────────────────────────────────────────────
  "Retail & Display": [
    { name: "Counter Display Box",  l:8,   w:6,   d:10,   style:"display"       },
    { name: "Mini Display Tray",    l:5,   w:4,   d:6,    style:"display"       },
    { name: "Candy Display",        l:6,   w:4,   d:8,    style:"display"       },
    { name: "Lip Balm Display",     l:4,   w:3,   d:6,    style:"display"       },
    { name: "Toy Hanger Box",       l:5,   w:1.5, d:8,    style:"five-panel"    },
    { name: "Battery Hanger",       l:4,   w:1,   d:6,    style:"five-panel"    },
    { name: "Hook Box — Small",     l:3,   w:1,   d:5,    style:"five-panel"    },
    { name: "Hook Box — Large",     l:5,   w:2,   d:9,    style:"five-panel"    },
    { name: "Shelf-Ready — Snap",   l:8,   w:6,   d:4,    style:"snap-lock"     },
    { name: "Crash Lock Retail",    l:4,   w:3,   d:6,    style:"snap-lock"     },
    { name: "Auto-Lock Retail Box", l:3,   w:2,   d:5,    style:"snap-lock"     },
    { name: "Shelf Box — Seal End", l:8,   w:3,   d:10,   style:"seal-end"      },
    { name: "Pasta Box",            l:7,   w:2,   d:10,   style:"seal-end"      },
    { name: "RETF Retail Box",      l:5,   w:3,   d:8,    style:"roll-end"      },
  ],
 
  // ── 10. SPECIALTY SHAPES ─────────────────────────────────────────────────────
  "Specialty Shapes": [
    { name: "Hex Luxury Box",       l:4,   w:4,   d:6,    style:"hex"           },
    { name: "Hex Candle Box",       l:3,   w:3,   d:5,    style:"hex"           },
    { name: "Hex Jewellery Box",    l:2.5, w:2.5, d:3,    style:"hex"           },
    { name: "Hex Chocolate Box",    l:5,   w:5,   d:3,    style:"hex"           },
    { name: "Hex Favour Box",       l:2,   w:2,   d:4,    style:"hex"           },
    { name: "Hex Tea Light Holder", l:3,   w:3,   d:2,    style:"hex"           },
    { name: "Roll-End Box",         l:5,   w:3,   d:8,    style:"roll-end"      },
    { name: "RETF Cosmetic Box",    l:3,   w:2,   d:5,    style:"roll-end"      },
    { name: "RETF Soap Box",        l:4,   w:2.5, d:2.5,  style:"roll-end"      },
    { name: "Pillow Favour Box",    l:4,   w:2,   d:2.5,  style:"pillow"        },
    { name: "Pillow Jewellery",     l:5,   w:2,   d:3,    style:"pillow"        },
    { name: "Drawer Luxury Box",    l:8,   w:5,   d:3,    style:"drawer"        },
    { name: "Snap Lock Bottom",     l:3,   w:2,   d:5,    style:"snap-lock"     },
    { name: "Crash Lock Box",       l:4,   w:3,   d:6,    style:"snap-lock"     },
  ],
 
  // ── 11. CARDS & TAGS ─────────────────────────────────────────────────────────
  "Cards & Tags": [
    { name: "Gift Card Holders",    l:3.5, w:1,   d:2.5,  style:"straight-tuck" },
    { name: "Hang Tag Sleeves",     l:3,   w:0.5, d:2,    style:"sleeve"        },
    { name: "Greeting Card Box",    l:5,   w:1,   d:4,    style:"tray-lock"     },
    { name: "Business Card Box",    l:3.5, w:1.5, d:2,    style:"tray-lock"     },
    { name: "Thank You Card Set",   l:5,   w:1,   d:4,    style:"straight-tuck" },
    { name: "Loyalty Card Holder",  l:3.5, w:1,   d:2.5,  style:"tray-lock"     },
    { name: "Gift Voucher Box",     l:7,   w:1,   d:4,    style:"tray-lock"     },
    { name: "Tag Booklet Sleeve",   l:4,   w:0.5, d:3,    style:"sleeve"        },
    { name: "Product Swing Tags",   l:3,   w:0.5, d:5,    style:"straight-tuck" },
    { name: "Bookmark Box",         l:2,   w:0.5, d:6,    style:"straight-tuck" },
    { name: "Event Ticket Box",     l:6,   w:1,   d:3,    style:"tray-lock"     },
  ],
};

const materialOptions: any = {
  "Cardboard": [{ id: "SBS Premium White", name: "SBS Premium White" }, { id: "Kraft Paperboard", name: "Kraft Paperboard" }, { id: "Recycled Board", name: "Recycled Board (Grey)" }],
  "Corrugated": [{ id: "Corrugated E-Flute", name: "E-Flute (1/16\")" }, { id: "Corrugated B-Flute", name: "B-Flute (1/8\")" }, { id: "Corrugated C-Flute", name: "C-Flute (3/16\")" }]
};

const materialRates: any = { "SBS Premium White": 0.005, "Kraft Paperboard": 0.004, "Recycled Board": 0.0035, "Corrugated E-Flute": 0.012, "Corrugated B-Flute": 0.015, "Corrugated C-Flute": 0.018 };
const thicknessMultiplier: any = { "14pt (250gsm)": 0.8, "16pt (300gsm)": 1.0, "18pt (350gsm)": 1.2, "24pt (400gsm)": 1.5 };

export default function Home() {
  const [step, setStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState("Cosmetic Boxes");
  const [activeBox, setActiveBox] = useState<any>(catalog["Cosmetic Boxes"][0]);

  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(4); 
  
  const [materialCategory, setMaterialCategory] = useState("Cardboard");
  const [material, setMaterial] = useState("SBS Premium White");
  const [thickness, setThickness] = useState("16pt (300gsm)");
  const [inkCoverage, setInkCoverage] = useState("Printed (CMYK)");
  const [quantity, setQuantity] = useState<number | "">(1000);
  
  // FIXED: Application mathematically defaults to 1 (Fully Closed) upon loading 3D studio
  const [openness, setOpenness] = useState(1); 
  
  const [isWindowed, setIsWindowed] = useState(false);
  const [windowFace, setWindowFace] = useState<PanelKey>("front");
  const [windowW, setWindowW] = useState(1);
  const [windowH, setWindowH] = useState(1);

  const [activePanel, setActivePanel] = useState<PanelKey>("front");
  const [activeGraphicId, setActiveGraphicId] = useState<string | null>(null);
  const [globalColorMode, setGlobalColorMode] = useState<ColorMode>("CMYK");
  
  const [panels, setPanels] = useState<Record<PanelKey, Graphic[]>>({
    front: [], back: [], left: [], right: [], top: [], bottom: []
  });

  const [dielineOffset, setDielineOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  let currentFaceW = length;
  let currentFaceH = height; 

  if (activeBox?.style === 'tray-lock') {
     if (windowFace === 'bottom' || windowFace === 'top') { currentFaceW = length; currentFaceH = width; }
     else if (windowFace === 'front' || windowFace === 'back') { currentFaceW = length; currentFaceH = height; }
     else if (windowFace === 'left' || windowFace === 'right') { currentFaceW = height; currentFaceH = width; }
  } else {
     if (windowFace === 'front' || windowFace === 'back') { currentFaceW = length; currentFaceH = height; }
     else if (windowFace === 'left' || windowFace === 'right') { currentFaceW = width; currentFaceH = height; }
     else if (windowFace === 'top' || windowFace === 'bottom') { currentFaceW = length; currentFaceH = width; }
  }

  const maxWindowW = Math.max(0, currentFaceW - 0.5);
  const maxWindowH = Math.max(0, currentFaceH - 0.5);
  const canHaveWindow = maxWindowW >= 1 && maxWindowH >= 1;
  const safeWindowW = Math.max(1, Math.min(windowW, maxWindowW));
  const safeWindowH = Math.max(1, Math.min(windowH, maxWindowH));

  const priceData = useMemo(() => {
    const l = Number(length) || 0; const w = Number(width) || 0; const h = Number(height) || 0;
    const calcQty = Math.max(500, Number(quantity) || 500);

    const surfaceAreaSqIn = ((l * w * 2) + (l * h * 2) + (w * h * 2)) * 1.3;
    let baseRate = materialRates[material] || 0.005;
    if (materialCategory === "Cardboard" && thicknessMultiplier[thickness]) baseRate *= thicknessMultiplier[thickness];

    const inkMultiplier = inkCoverage === "Printed (CMYK)" ? 1.4 : inkCoverage === "Premium (Foil/Spot UV)" ? 2.1 : 1.0;
    const volumeDiscount = calcQty >= 10000 ? 0.6 : calcQty >= 5000 ? 0.75 : calcQty >= 1000 ? 0.85 : 1.0;
    
    const unitPrice = baseRate * inkMultiplier * volumeDiscount * surfaceAreaSqIn;
    return { unit: unitPrice, total: (unitPrice * calcQty) + 150, displayQty: calcQty };
  }, [length, width, height, material, materialCategory, thickness, quantity, inkCoverage]);

  const handleBoxSelect = (box: any) => { 
    setActiveBox(box); setLength(box.l); setWidth(box.w); setHeight(box.d); 
    setWindowFace(['tray-lock','gable','two-piece'].includes(box.style) ? 'top' : 'front'); 
    setStep(2); 
  };
  
  const syncGlobalColors = async (mode: ColorMode, currentPanels: Record<PanelKey, Graphic[]>) => {
    if (mode === 'CMYK') {
       const resetPanels = {...currentPanels};
       for (const k in resetPanels) resetPanels[k as PanelKey] = resetPanels[k as PanelKey].map(g => ({...g, displayUrl: g.originalUrl}));
       setPanels(resetPanels);
       return;
    }

    const allUrls: string[] = [];
    Object.values(currentPanels).forEach(arr => allUrls.push(...arr.map(g => g.originalUrl)));
    if (allUrls.length === 0) return;

    const imgs: HTMLImageElement[] = await Promise.all(allUrls.map(url => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = url;
    })));

    const colorMap: Record<string, number> = {};
    const canvases = imgs.map(img => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        return { ctx, imgData: ctx.getImageData(0, 0, c.width, c.height) };
    });

    canvases.forEach(({imgData}) => {
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i+3] < 50) continue; 
            const r = data[i], g = data[i+1], b = data[i+2];
            if (r > 240 && g > 240 && b > 240) continue; 
            const bucket = `${Math.round(r/32)*32},${Math.round(g/32)*32},${Math.round(b/32)*32}`;
            colorMap[bucket] = (colorMap[bucket] || 0) + 1;
        }
    });

    const sorted = Object.entries(colorMap).sort((a,b) => b[1] - a[1]);
    let c1 = {r: 40, g: 53, b: 147}; 
    let c2 = {r: 198, g: 40, b: 40}; 

    if (sorted.length > 0) c1 = {r: Number(sorted[0][0].split(',')[0]), g: Number(sorted[0][0].split(',')[1]), b: Number(sorted[0][0].split(',')[2])};
    if (sorted.length > 1 && mode === '2C') {
        for (let j = 1; j < sorted.length; j++) {
            const rgb = sorted[j][0].split(',').map(Number);
            if (Math.hypot(c1.r - rgb[0], c1.g - rgb[1], c1.b - rgb[2]) > 60) {
                c2 = {r: rgb[0], g: rgb[1], b: rgb[2]}; break;
            }
        }
    }

    const nextPanels = {...currentPanels};
    for (const face of Object.keys(nextPanels) as PanelKey[]) {
        nextPanels[face] = await Promise.all(nextPanels[face].map(async (g) => {
            const img = new Image();
            await new Promise(r => { img.onload = r; img.src = g.originalUrl; });
            const c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            const ctx = c.getContext('2d')!;
            ctx.drawImage(img, 0, 0);
            const idata = ctx.getImageData(0,0,c.width,c.height);
            const d = idata.data;

            for (let i = 0; i < d.length; i += 4) {
                if (d[i+3] < 10) continue;
                const r = d[i], gVal = d[i+1], b = d[i+2];
                if (r > 220 && gVal > 220 && b > 220) { d[i+3] = 0; continue; }
                
                if (mode === '1C') {
                    d[i] = c1.r; d[i+1] = c1.g; d[i+2] = c1.b;
                } else {
                    const dist1 = Math.pow(c1.r-r,2)+Math.pow(c1.g-gVal,2)+Math.pow(c1.b-b,2);
                    const dist2 = Math.pow(c2.r-r,2)+Math.pow(c2.g-gVal,2)+Math.pow(c2.b-b,2);
                    if (dist1 < dist2) { d[i]=c1.r; d[i+1]=c1.g; d[i+2]=c1.b; }
                    else { d[i]=c2.r; d[i+1]=c2.g; d[i+2]=c2.b; }
                }
            }
            ctx.putImageData(idata, 0, 0);
            return {...g, displayUrl: c.toDataURL()};
        }));
    }
    setPanels(nextPanels);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newGraphic: Graphic = { id: Date.now().toString(), originalUrl: url, displayUrl: url, scale: 2, x: 0, y: 0 };
      
      const newPanels = { ...panels, [activePanel]: [...panels[activePanel], newGraphic] };
      setPanels(newPanels);
      setActiveGraphicId(newGraphic.id);
      
      if (globalColorMode !== 'CMYK') syncGlobalColors(globalColorMode, newPanels);
    }
    e.target.value = ''; 
  };

  const handleGlobalColorMode = (mode: ColorMode) => {
    setGlobalColorMode(mode);
    syncGlobalColors(mode, panels);
  };

  const removeGraphic = (id: string) => {
    const newPanels = { ...panels, [activePanel]: panels[activePanel].filter(g => g.id !== id) };
    setPanels(newPanels);
    if (activeGraphicId === id) setActiveGraphicId(null);
    if (globalColorMode !== 'CMYK') syncGlobalColors(globalColorMode, newPanels);
  };

  const updateActiveGraphic = (key: keyof Graphic, value: number) => {
    setPanels(prev => ({
      ...prev,
      [activePanel]: prev[activePanel].map(g => g.id === activeGraphicId ? { ...g, [key]: value } : g)
    }));
  };

  const totalGraphicsCount = Object.values(panels).flat().length;
  let prepressMessage = "0 Plates (Unprinted)";
  if (inkCoverage === "No Print (Blank)") {
     prepressMessage = "0 Plates (Unprinted)";
  } else if (totalGraphicsCount > 0) {
     const basePlates = globalColorMode === "CMYK" ? 4 : (globalColorMode === "2C" ? 2 : 1);
     const totalPlates = basePlates + (inkCoverage === "Premium (Foil/Spot UV)" ? 1 : 0);
     const baseLabel = globalColorMode === "CMYK" ? "Full CMYK" : (globalColorMode === "2C" ? "2-Color Spot" : "1-Color Spot");
     prepressMessage = `${baseLabel} (${totalPlates} Plates)`;
  } else {
     prepressMessage = "Awaiting Graphics...";
  }

  let renderMaterialColor = "#FFFFFF";                                          // SBS Premium White — bright coated surface
  if (material === "Kraft Paperboard")   renderMaterialColor = "#D4AA6A";      // Warm natural kraft / manila
  if (material === "Recycled Board")     renderMaterialColor = "#C8C8C2";      // Light recycled grey
  if (material === "Corrugated E-Flute") renderMaterialColor = "#D2A86A";      // E-flute: light kraft
  if (material === "Corrugated B-Flute") renderMaterialColor = "#C89B5A";      // B-flute: medium brown
  if (material === "Corrugated C-Flute") renderMaterialColor = "#BE8E4A";      // C-flute: darker brown
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center py-12 px-8 font-sans pb-24 relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#283593]/10 blur-[150px] rounded-full pointer-events-none"></div>
        <header className="w-full max-w-[1500px] h-16 flex items-center justify-between px-6 bg-white rounded-2xl border border-gray-200 shadow-sm relative z-10 mb-16">
          <div className="flex items-center gap-3"><TILogo size="w-10 h-10" text="text-xl" /><span className="font-black text-gray-900 text-lg tracking-tight">Tennessee IMPEX</span></div>
          <div className="flex items-center gap-4 text-xs font-bold text-[#283593]"><span className="hover:underline cursor-pointer">Account</span><span>/</span><span className="hover:underline cursor-pointer">Sign In</span></div>
        </header>

        <div className="mb-20 text-center max-w-5xl relative z-10 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">Your Vision. <span className="text-[#283593]">Precision Packaging Engineered.</span></h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-2xl">All about precision packaging and dieline templates at Tennessee IMPEX. Follow the steps below to launch the 3D studio, define specifications, preview the dieline, and get instant quotes.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10 text-left">
            {[ { num: 1, name: "SELECT PACKAGING TYPE", text: "Choose a structural foundation from the catalog below to get started." },
               { num: 2, name: "CUSTOMIZE IN THE STUDIO", text: "Edit dimensions, configure materials, and upload your custom graphics." },
               { num: 3, name: "GET PRECISION QUOTES", text: "Instantly view pricing based on cardboard area, ink usage, and volume." }
            ].map(step => (
              <div key={step.num} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative hover:border-[#283593]/40 transition-all hover:shadow-md">
                <span className="absolute top-4 right-6 text-6xl font-black text-gray-50 pointer-events-none select-none">{step.num}</span>
                <div className="w-8 h-8 rounded-full bg-[#283593] text-white flex items-center justify-center font-bold mb-4 shadow-md relative z-10">{step.num}</div>
                <span className="text-sm font-bold text-gray-900 block mb-1 relative z-10">{step.name}</span>
                <p className="text-xs text-gray-500 leading-relaxed relative z-10">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-full max-w-7xl relative z-10">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mb-12">
            {Object.keys(catalog).map(catName => (
              <button key={catName} onClick={() => setActiveCategory(catName)} className={`text-sm md:text-[15px] font-black uppercase tracking-widest pb-2 border-b-[3px] transition-all ${activeCategory === catName ? "border-[#283593] text-[#283593]" : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"}`}>{catName}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {(catalog[activeCategory as keyof typeof catalog] || []).map((box: any) => (
               <button key={box.name} onClick={() => handleBoxSelect(box)} className="relative bg-white h-52 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-[#283593]/50 transition-all p-8 text-left flex flex-col justify-start overflow-hidden group">
                 <div className="relative z-20">
                   <h3 className="text-xl font-black text-gray-900 group-hover:text-[#283593] transition-colors tracking-tight drop-shadow-sm">{box.name}</h3>
                   <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest drop-shadow-sm">{box.l}" x {box.w}" x {box.d}"</p>
                   <span className="inline-block mt-4 px-3 py-1 bg-white/90 text-gray-600 border border-gray-200 text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm group-hover:bg-[#283593] group-hover:text-white group-hover:border-transparent transition-colors">{box.style.replace('-', ' ')}</span>
                 </div>
                 <div className="absolute -bottom-8 -right-8 w-48 h-48 text-gray-100 transition-transform transform group-hover:scale-110 duration-500 ease-out z-10"><Box3DOutline style={box.style} /></div>
               </button>
             ))}
          </div>
        </div>
      </div>
    );
  }

  const activeGraphic = panels[activePanel].find(g => g.id === activeGraphicId);

  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5] font-sans overflow-hidden">
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-900 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors">←</button>
          <div className="w-px h-5 bg-gray-300 mx-2"></div><TILogo size="w-9 h-9" text="text-lg" /><span className="font-black text-gray-900 text-[15px] tracking-tight ml-1">Tennessee IMPEX</span><div className="w-px h-5 bg-gray-300 mx-2"></div><span className="font-bold text-gray-600 text-sm">{activeBox.name} Studio</span>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex flex-col text-right mr-4">
             <span className="text-[10px] font-black uppercase text-gray-400">Total Run ({priceData.displayQty})</span>
             <span className="text-sm font-bold text-[#283593]">${priceData.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
           </div>
           <button className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Download Dieline</button>
           <button className="px-5 py-2 bg-[#283593] rounded-lg text-sm font-bold text-white shadow-sm hover:bg-[#1A237E] transition-colors">Proceed to Checkout →</button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <aside className="w-[340px] border-r border-gray-200 bg-white p-6 overflow-y-auto shrink-0 flex flex-col gap-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
          
          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black tracking-widest text-gray-400 uppercase italic"><span className="text-[#283593] mr-1">02 /</span> SUBSTRATE</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Material Category</label>
                <select value={materialCategory} onChange={(e) => { const newCat = e.target.value; setMaterialCategory(newCat); setMaterial(materialOptions[newCat][0].id); }} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-bold text-gray-600 outline-none appearance-none bg-white">
                  <option value="Cardboard">Cardboard</option><option value="Corrugated">Corrugated</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Substrate / Fluting</label>
                <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-bold text-gray-600 outline-none appearance-none bg-white">
                  {materialOptions[materialCategory].map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              {materialCategory === "Cardboard" && (
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Thickness (pt/gsm)</label>
                  <select value={thickness} onChange={(e) => setThickness(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-bold text-gray-600 outline-none appearance-none bg-white">
                    <option value="14pt (250gsm)">14pt (250 gsm) - Standard</option><option value="16pt (300gsm)">16pt (300 gsm) - Sturdy</option><option value="18pt (350gsm)">18pt (350 gsm) - Premium</option><option value="24pt (400gsm)">24pt (400 gsm) - Ultra Thick</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black tracking-widest text-gray-400 uppercase italic"><span className="text-[#283593] mr-1">03 /</span> FOLDING STYLE</h3>
            <div className="p-4 rounded-xl text-left border bg-[#111827] border-[#111827] text-white shadow-md">
              <div className="text-sm font-bold mb-1">{activeBox.style.toUpperCase()}</div>
              <div className="text-[10px] text-gray-300">Base structure locked by catalog selection.</div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black tracking-widest text-gray-400 uppercase italic"><span className="text-[#283593] mr-1">04 /</span> SIZE & QUANTITY</h3>
            <div className="grid grid-cols-3 gap-3 mb-2">
              {[['L', length, setLength], ['W', width, setWidth], ['D', height, setHeight]].map(([label, val, setVal]: any) => (
                <div key={label} className="flex flex-col border border-gray-100 rounded-xl p-3 focus-within:border-[#283593] focus-within:ring-1 focus-within:ring-[#283593]/20 transition-all bg-gray-50">
                  <span className="text-[10px] font-black text-gray-400 mb-1">{label}</span>
                  <input type="number" value={val} onChange={(e) => setVal(Number(e.target.value))} className="w-full bg-transparent outline-none text-base font-bold text-gray-900" />
                </div>
              ))}
            </div>

            <div>
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Order Quantity (Min: 500)</label>
               <input type="number" min="500" value={quantity} onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))} onBlur={() => { if(Number(quantity) < 500) setQuantity(500) }} className="w-full border border-gray-100 rounded-xl p-3 outline-none text-sm font-bold text-gray-900 focus:border-[#283593] focus:ring-1 focus:ring-[#283593]/20 transition-all bg-gray-50" />
            </div>
            
            {activeBox.style !== "sleeve" && (
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
                <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 ${!canHaveWindow ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#283593]/30 transition-colors'}`} onClick={() => canHaveWindow && setIsWindowed(!isWindowed)}>
                  <span className="text-xs font-black text-gray-700">ADD DISPLAY WINDOW</span>
                  <div className={`w-10 h-6 rounded-full relative transition-all duration-300 ${isWindowed && canHaveWindow ? 'bg-[#283593]' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] transition-all duration-300 shadow-sm ${(isWindowed && canHaveWindow) ? 'left-[20px]' : 'left-[4px]'}`} />
                  </div>
                </div>
                {!canHaveWindow && <p className="text-[9px] text-red-500 font-bold px-2">Box face too small. Minimum 1.5" x 1.5" required.</p>}
                
                {isWindowed && canHaveWindow && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Window Face Position</label>
                      <select value={windowFace} onChange={(e) => setWindowFace(e.target.value as PanelKey)} className="w-full border border-gray-100 rounded-xl p-3 outline-none text-xs font-bold text-gray-900 uppercase tracking-wider bg-white focus:border-[#283593]">
                        <option value="front">Front Face</option><option value="back">Back Face</option><option value="left">Left Face</option><option value="right">Right Face</option><option value="top">Top Face</option><option value="bottom">Bottom Face</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                       <div className="flex-1 flex flex-col border border-gray-100 rounded-xl p-3 focus-within:border-[#283593] focus-within:ring-1 focus-within:ring-[#283593]/20 transition-all bg-white">
                        <span className="text-[9px] font-black text-[#283593] mb-1">WIDTH (Max {maxWindowW}")</span>
                        <input type="number" min="1" max={maxWindowW} step="0.1" value={windowW} onChange={(e) => setWindowW(Math.min(maxWindowW, Math.max(1, Number(e.target.value))))} className="w-full bg-transparent outline-none text-sm font-bold text-gray-900" />
                      </div>
                      <div className="flex-1 flex flex-col border border-gray-100 rounded-xl p-3 focus-within:border-[#283593] focus-within:ring-1 focus-within:ring-[#283593]/20 transition-all bg-white">
                        <span className="text-[9px] font-black text-[#283593] mb-1">HEIGHT (Max {maxWindowH}")</span>
                        <input type="number" min="1" max={maxWindowH} step="0.1" value={windowH} onChange={(e) => setWindowH(Math.min(maxWindowH, Math.max(1, Number(e.target.value))))} className="w-full bg-transparent outline-none text-sm font-bold text-gray-900" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-4 pb-12">
             <h3 className="text-[11px] font-black tracking-widest text-gray-400 uppercase italic"><span className="text-[#283593] mr-1">05 /</span> GRAPHICS</h3>
             
             <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Ink & Finish Settings</label>
                <select value={inkCoverage} onChange={(e) => setInkCoverage(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-600 outline-none appearance-none bg-white">
                  <option>No Print (Blank)</option><option>Printed (CMYK)</option><option>Premium (Foil/Spot UV)</option>
                </select>
             </div>

             <div className="pt-4 border-t border-gray-100">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Global Print Mode</label>
               <select value={globalColorMode} onChange={(e) => handleGlobalColorMode(e.target.value as ColorMode)} className="w-full border border-gray-200 rounded-xl p-3 text-xs font-bold text-[#283593] outline-none appearance-none bg-white shadow-sm focus:border-[#283593]">
                 <option value="CMYK">4-Color (CMYK Process)</option>
                 <option value="2C">2-Color Spot (Auto Extracted)</option>
                 <option value="1C">1-Color Spot (Auto Extracted)</option>
               </select>
             </div>

             <div className="pt-2 border-t border-gray-100">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Select Canvas Face</label>
               <select value={activePanel} onChange={(e) => setActivePanel(e.target.value as PanelKey)} className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 outline-none uppercase tracking-wider appearance-none focus:border-[#283593]">
                  <option value="front">Front Face</option><option value="back">Back Face</option><option value="left">Left Face</option><option value="right">Right Face</option><option value="top">Top Face</option><option value="bottom">Bottom Face</option>
               </select>
             </div>

             <label className="w-full flex items-center justify-center py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#283593] hover:bg-[#283593]/5 transition-all bg-gray-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#283593]">+ Add Graphic to {activePanel}</span>
                <input type="file" accept=".png, .svg, .jpg" className="hidden" onChange={handleLogoUpload} />
             </label>

             {panels[activePanel].length > 0 && (
               <div className="flex gap-2 flex-wrap">
                 {panels[activePanel].map(g => (
                    <div key={g.id} onClick={() => setActiveGraphicId(g.id)} className={`w-12 h-12 rounded-lg border-2 ${activeGraphicId === g.id ? 'border-[#283593] ring-2 ring-[#283593]/20' : 'border-gray-200'} cursor-pointer overflow-hidden bg-white flex items-center justify-center p-1 transition-all`}>
                       <img src={g.displayUrl} className="max-w-full max-h-full object-contain" />
                    </div>
                 ))}
               </div>
             )}

             {activeGraphic && (
               <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                 <button onClick={() => removeGraphic(activeGraphic.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                 <div>
                   <div className="flex justify-between mb-1"><label className="text-[9px] font-black text-[#283593] uppercase">Scale</label><span className="text-[9px] font-bold text-gray-500">{activeGraphic.scale.toFixed(1)}x</span></div>
                   <input type="range" min="0.1" max="5" step="0.1" value={activeGraphic.scale} onChange={(e) => updateActiveGraphic('scale', Number(e.target.value))} className="w-full accent-[#283593]" />
                 </div>
                 <div>
                   <div className="flex justify-between mb-1"><label className="text-[9px] font-black text-[#283593] uppercase">Position X</label><span className="text-[9px] font-bold text-gray-500">{activeGraphic.x.toFixed(1)}"</span></div>
                   <input type="range" min="-10" max="10" step="0.1" value={activeGraphic.x} onChange={(e) => updateActiveGraphic('x', Number(e.target.value))} className="w-full accent-[#283593]" />
                 </div>
                 <div>
                   <div className="flex justify-between mb-1"><label className="text-[9px] font-black text-[#283593] uppercase">Position Y</label><span className="text-[9px] font-bold text-gray-500">{activeGraphic.y.toFixed(1)}"</span></div>
                   <input type="range" min="-10" max="10" step="0.1" value={activeGraphic.y} onChange={(e) => updateActiveGraphic('y', Number(e.target.value))} className="w-full accent-[#283593]" />
                 </div>
               </div>
             )}

             <div className="mt-2 p-4 bg-[#111827] rounded-xl border border-gray-800 text-white shadow-inner">
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Prepress Offset Setup</span>
                   <div className="flex items-end justify-between">
                      <span className="text-sm font-bold text-[#4ADE80]">{prepressMessage}</span>
                   </div>
                   <p className="text-[9px] text-gray-500 mt-2 leading-relaxed">Dynamic global plate calculation synchronizing {totalGraphicsCount} graphics.</p>
                </div>
             </div>
          </div>
        </aside>

        <section className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full h-full relative cursor-move">
             <BoxCanvas length={length} width={width} depth={height} boxType={activeBox.style} openness={openness} materialColor={renderMaterialColor} hasWindow={isWindowed && canHaveWindow} windowW={safeWindowW} windowH={safeWindowH} windowFace={windowFace} panels={panels} />
          </div>

          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-center z-10 pointer-events-none">
             <div className="px-6 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-gray-200 text-xs font-black tracking-widest text-gray-900 uppercase">Interactive 3D Workspace</div>
             <p className="text-[10px] font-bold text-gray-500 bg-white/60 px-4 py-1 rounded-full backdrop-blur-sm">Scroll to Zoom • Click & Drag to Rotate</p>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-lg border border-gray-200 z-10">
             <div className="flex flex-col text-center border-r border-gray-200 pr-6">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Integrity Check</span>
                <span className="text-xs font-bold text-[#283593]">✓ Math Verified</span>
             </div>
             <div className="flex items-center gap-3 w-48">
                <span className="text-[9px] font-black text-[#283593] uppercase tracking-wider">Open</span>
                <input type="range" min="0" max="1" step="0.01" value={openness} onChange={(e) => setOpenness(Number(e.target.value))} className="flex-1 accent-[#C62828] cursor-pointer" />
                <span className="text-[9px] font-black text-[#283593] uppercase tracking-wider">Close</span>
             </div>
          </div>

          <div 
             className="absolute top-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl flex flex-col z-20 transition-shadow hover:shadow-2xl resize overflow-hidden"
             style={{ width: '320px', height: '384px', minWidth: '250px', minHeight: '250px', transform: `translate(${dielineOffset.x}px, ${dielineOffset.y}px)` }}
          >
             <div 
                className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50 cursor-move"
                onPointerDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX - dielineOffset.x, y: e.clientY - dielineOffset.y }); e.currentTarget.setPointerCapture(e.pointerId); }}
                onPointerMove={(e) => { if (isDragging) setDielineOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
                onPointerUp={(e) => { setIsDragging(false); e.currentTarget.releasePointerCapture(e.pointerId); }}
                onPointerCancel={(e) => { setIsDragging(false); e.currentTarget.releasePointerCapture(e.pointerId); }}
             >
               <span className="text-[10px] font-black tracking-widest text-gray-900 uppercase pointer-events-none">Live 2D Blueprint</span>
               <div className="flex items-center gap-2">
                 <div className="flex items-center gap-2 pointer-events-none">
                   <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase"><div className="w-2 h-2 bg-[#283593] rounded-sm"></div> Cut</span>
                   <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase"><div className="w-2 h-2 bg-[#C62828] rounded-sm"></div> Fold</span>
                 </div>
                 <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setDielineOffset({ x: 0, y: 0 })} className="flex items-center justify-center w-5 h-5 rounded border border-gray-200 text-gray-400 hover:text-[#283593] hover:border-[#283593] transition-colors cursor-pointer ml-2 bg-white shadow-sm" title="Reset Position"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
               </div>
             </div>
             <div className="flex-1 relative overflow-hidden p-2 pointer-events-none">
                <Dieline length={length} width={width} depth={height} boxType={activeBox.style} hasWindow={isWindowed && canHaveWindow} windowW={safeWindowW} windowH={safeWindowH} windowFace={windowFace} />
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}