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
  // Real-world coordinates used by LeafletMap to place a pin on the map
  lat?: number;
  lng?: number;
}

export const DESTINATIONS: DestinationOption[] = [
  // ── Cached destinations (show "Popular" badge, unlock flexible dates) ──
  { code: "CANCUN",     label: "Cancún, Mexico",            isCached: true,  lat: 21.1619,  lng: -86.8515 },
  { code: "ORLANDO",    label: "Orlando, Florida, USA",     isCached: true,  lat: 28.5383,  lng: -81.3792 },
  { code: "LOSANGELES", label: "Los Angeles, California",   isCached: true,  lat: 34.0522,  lng: -118.2437 },
  { code: "DUBAI",      label: "Dubai, UAE",                isCached: true,  lat: 25.2048,  lng:  55.2708 },
  { code: "BALI",       label: "Bali, Indonesia",           isCached: true,  lat: -8.3405,  lng: 115.0920 },
  { code: "MALDIVES",   label: "Maldives",                  isCached: true,  lat:  3.2028,  lng:  73.2207 },
  { code: "TENERIFE",   label: "Tenerife, Spain",           isCached: true,  lat: 28.2916,  lng: -16.6291 },
  { code: "MALLORCA",   label: "Mallorca, Spain",           isCached: true,  lat: 39.6953,  lng:   3.0176 },
  { code: "LANZAROTE",  label: "Lanzarote, Spain",          isCached: true,  lat: 29.0469,  lng: -13.5899 },

  // ── Non-cached destinations (standard date picker only) ─────────────────
  { code: "PHUKET",     label: "Phuket, Thailand",          isCached: false, lat:  7.8804,  lng:  98.3923 },
  { code: "MARRAKECH",  label: "Marrakech, Morocco",        isCached: false, lat: 31.6295,  lng:  -7.9811 },
  { code: "ANTALYA",    label: "Antalya, Turkey",           isCached: false, lat: 36.8969,  lng:  30.7133 },
  { code: "HURGHADA",   label: "Hurghada, Egypt",           isCached: false, lat: 27.2578,  lng:  33.8116 },
  { code: "SANTORINI",  label: "Santorini, Greece",         isCached: false, lat: 36.3932,  lng:  25.4615 },
  { code: "DUBROVNIK",  label: "Dubrovnik, Croatia",        isCached: false, lat: 42.6507,  lng:  18.0944 },
  { code: "COSTARICA",  label: "Costa Rica",                isCached: false, lat:  9.7489,  lng: -83.7534 },
  { code: "JAMAICA",    label: "Jamaica",                   isCached: false, lat: 18.1096,  lng: -77.2975 },
  { code: "HOCHIMINH",  label: "Ho Chi Minh City, Vietnam", isCached: false, lat: 10.8231,  lng: 106.6297 },
];
