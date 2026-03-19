// ─────────────────────────────────────────────────────────────────────────────
// Destinations Mock Data
//
// Single source of truth for all destination options used across the app.
// Both PackageSearchForm and other components should import from here.
//
// isCached: true  → destination has a pre-built supply cache
//                   → unlocks Flexible Dates tab in the search form
//                   → triggers the full cached + live search sequence
// isCached: false → live-only search (no cache available)
//                   → only specific date search, no flexible tab
// ─────────────────────────────────────────────────────────────────────────────

export interface DestinationOption {
  code: string;       // Unique key used in MONTHLY_PRICES lookup
  label: string;      // Human-readable display label
  isCached: boolean;  // Whether this destination has pre-built cache
  heroImage?: string; // Optional hero image URL for destination cards
}

export const DESTINATIONS: DestinationOption[] = [
  // ── Cached destinations (show "Popular" badge, unlock flexible dates) ──
  { code: "CANCUN",   label: "Cancún, Mexico",            isCached: true  },
  { code: "ORLANDO",  label: "Orlando, Florida, USA",     isCached: true  },
  { code: "LOSANGELES", label: "Los Angeles, California", isCached: true  },
  { code: "DUBAI",    label: "Dubai, UAE",                isCached: true  },
  { code: "BALI",     label: "Bali, Indonesia",           isCached: true  },
  { code: "MALDIVES", label: "Maldives",                  isCached: true  },
  { code: "TENERIFE", label: "Tenerife, Spain",           isCached: true  },
  { code: "MALLORCA", label: "Mallorca, Spain",           isCached: true  },
  { code: "LANZAROTE", label: "Lanzarote, Spain",         isCached: true  },

  // ── Non-cached destinations (standard date picker only) ─────────────────
  { code: "PHUKET",     label: "Phuket, Thailand",            isCached: false },
  { code: "MARRAKECH",  label: "Marrakech, Morocco",          isCached: false },
  { code: "ANTALYA",    label: "Antalya, Turkey",             isCached: false },
  { code: "HURGHADA",   label: "Hurghada, Egypt",             isCached: false },
  { code: "SANTORINI",  label: "Santorini, Greece",           isCached: false },
  { code: "DUBROVNIK",  label: "Dubrovnik, Croatia",          isCached: false },
  { code: "COSTARICA",  label: "Costa Rica",                  isCached: false },
  { code: "JAMAICA",    label: "Jamaica",                     isCached: false },
  { code: "HOCHIMINH",  label: "Ho Chi Minh City, Vietnam",   isCached: false },
];
