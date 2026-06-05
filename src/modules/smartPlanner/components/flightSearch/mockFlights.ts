// Mock flight data — moved out of FlightListPage so the page stays focused
// on layout and state, and so we can swap this for a real API later without
// touching the UI.
//
// HOW THIS WORKS (high-level)
// ───────────────────────────
// Every route falls into one of three distance categories:
//
//   • "short"     — 1.5–3.5h, intra-Europe, mostly direct, $80–$200
//   • "long"      — 7–15h,    Europe ↔ Asia / North America, mix of direct + 1-stop
//                              via major hubs (Dubai, Singapore, Bangkok, …), $450–$1100
//   • "very-long" — 18–28h,   Europe ↔ Australasia / South America, always 1–2 stops
//                              via major hubs, $1200–$2800
//
// `ROUTE_PRESETS` is the canonical list — the search editor offers these as
// one-click shortcuts so we can demo the three scenarios without typing.
// `getMockFlightsForLeg(from, to)` resolves the category by matching the input
// against the preset list; unknown routes fall back to "long" so the UI never
// goes empty.
//
// We expose:
//   • ROUTE_PRESETS        — the preset routes (with category) for the picker
//   • getMockFlightsForLeg — turns a from/to into per-leg results
//   • parseDurationToMinutes — converts "13h 45m" → 825, used by the
//                              "Fastest" sort and the Max duration filter.

import type { FlightOption } from "../../../../App";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type RouteCategory = "short" | "long" | "very-long" | "featured";

export type RoutePreset = {
  category: RouteCategory;
  // Display label for the picker — e.g. "London → Bangkok"
  label: string;
  // Strings written into FlightLeg.from / .to. We use airport codes because
  // FlightResultCard renders these straight into the times bar as fromCode /
  // toCode (e.g. "ZRH", "JFK"). Free text still works, it just looks less
  // tidy on the card.
  from: string;
  to: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Preset routes — one-click shortcuts surfaced in the search editor
// ─────────────────────────────────────────────────────────────────────────────
// Add or remove entries here to change what the "Quick routes" picker offers.
// The category controls which flight catalogue gets returned for that route.

export const ROUTE_PRESETS: RoutePreset[] = [
  // Short — within Europe (1.5–3.5h, mostly direct)
  { category: "short", label: "London → Paris",     from: "LHR", to: "CDG" },
  { category: "short", label: "Zurich → London",    from: "ZRH", to: "LHR" },
  { category: "short", label: "Madrid → Berlin",    from: "MAD", to: "BER" },

  // Long — Europe ↔ Asia / North America (7–15h, layovers via hubs)
  { category: "long", label: "London → Bangkok",    from: "LHR", to: "BKK" },
  { category: "long", label: "Zurich → New York",   from: "ZRH", to: "JFK" },
  { category: "long", label: "Paris → Singapore",   from: "CDG", to: "SIN" },

  // Very long — Europe ↔ Australasia / South America (18–28h, always with stops)
  { category: "very-long", label: "London → Sydney",        from: "LHR", to: "SYD" },
  { category: "very-long", label: "Zurich → Auckland",      from: "ZRH", to: "AKL" },
  { category: "very-long", label: "Paris → Buenos Aires",   from: "CDG", to: "EZE" },

  // ── Featured carrier routes ────────────────────────────────────────────
  // These have hand-tailored flight lists (see ROUTE_OVERRIDES below) that
  // feature a specific carrier's hub stopover instead of the generic
  // distance-based catalogue. Categorised as "featured" so the picker can
  // group them separately.
  //
  // Caribbean Airlines (BW) — via Port of Spain (POS)
  { category: "featured", label: "New York → Grenada (BW via POS)",   from: "JFK", to: "GND" },
  { category: "featured", label: "Toronto → Bridgetown (BW via POS)", from: "YYZ", to: "BGI" },
  // Fiji Airways (FJ) — via Nadi (NAN). 2 origins × 5 destinations.
  { category: "featured", label: "Los Angeles → Sydney (FJ via NAN)",       from: "LAX", to: "SYD" },
  { category: "featured", label: "Los Angeles → Melbourne (FJ via NAN)",    from: "LAX", to: "MEL" },
  { category: "featured", label: "Los Angeles → Brisbane (FJ via NAN)",     from: "LAX", to: "BNE" },
  { category: "featured", label: "Los Angeles → Auckland (FJ via NAN)",     from: "LAX", to: "AKL" },
  { category: "featured", label: "Los Angeles → Christchurch (FJ via NAN)", from: "LAX", to: "CHC" },
  { category: "featured", label: "San Francisco → Sydney (FJ via NAN)",       from: "SFO", to: "SYD" },
  { category: "featured", label: "San Francisco → Melbourne (FJ via NAN)",    from: "SFO", to: "MEL" },
  { category: "featured", label: "San Francisco → Brisbane (FJ via NAN)",     from: "SFO", to: "BNE" },
  { category: "featured", label: "San Francisco → Auckland (FJ via NAN)",     from: "SFO", to: "AKL" },
  { category: "featured", label: "San Francisco → Christchurch (FJ via NAN)", from: "SFO", to: "CHC" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Per-category flight catalogues
// ─────────────────────────────────────────────────────────────────────────────
// Each catalogue is a list of "template" flights — no id, no leg-specific
// price offset. `getMockFlightsForLeg` clones them per route and stamps in
// the id + a tiny deterministic price offset (so the same route always
// shows the same numbers — switching back to leg 1 doesn't shuffle prices).

// ── SHORT-HAUL (intra-Europe) ───────────────────────────────────────────────
// Mostly direct, low-cost + flag carriers, $80–$200, 1.5–3.5h.
const SHORT_HAUL: Omit<FlightOption, "id">[] = [
  {
    airline: "easyJet",
    airlineCode: "EZY",
    departure: "06:45",
    arrival: "08:15",
    duration: "1h 30m",
    stops: "Direct",
    price: 89,
    badge: "Cheapest",
  },
  {
    airline: "British Airways",
    airlineCode: "BA",
    departure: "07:30",
    arrival: "09:05",
    duration: "1h 35m",
    stops: "Direct",
    price: 155,
    badge: "Fastest",
  },
  {
    airline: "KLM",
    airlineCode: "KL",
    departure: "09:15",
    arrival: "11:05",
    duration: "1h 50m",
    stops: "Direct",
    price: 135,
  },
  {
    airline: "British Airways",
    airlineCode: "BA",
    departure: "11:00",
    arrival: "12:40",
    duration: "1h 40m",
    stops: "Direct",
    price: 165,
    badge: "Best",
  },
  {
    airline: "Lufthansa",
    airlineCode: "LH",
    departure: "13:20",
    arrival: "15:30",
    duration: "2h 10m",
    stops: "Direct",
    price: 175,
  },
  {
    airline: "easyJet",
    airlineCode: "EZY",
    departure: "16:40",
    arrival: "18:35",
    duration: "1h 55m",
    stops: "Direct",
    price: 99,
  },
  {
    airline: "Lufthansa",
    airlineCode: "LH",
    departure: "18:50",
    arrival: "21:55",
    duration: "3h 5m",
    stops: "1 stop",
    stopInfo: "via Frankfurt",
    price: 119,
  },
  {
    airline: "Turkish Airlines",
    airlineCode: "TK",
    departure: "21:15",
    arrival: "00:40",
    duration: "3h 25m",
    stops: "1 stop",
    stopInfo: "via Istanbul",
    price: 85,
  },
];

// ── LONG-HAUL (Europe ↔ Asia / North America) ───────────────────────────────
// Mix of direct and 1-stop via the big hubs. $450–$1100, 7–15h.
const LONG_HAUL: Omit<FlightOption, "id">[] = [
  {
    airline: "British Airways",
    airlineCode: "BA",
    departure: "06:30",
    arrival: "17:50",
    duration: "11h 20m",
    stops: "Direct",
    price: 720,
    badge: "Best",
  },
  {
    airline: "Singapore Airlines",
    airlineCode: "SQ",
    departure: "09:15",
    arrival: "21:00",
    duration: "11h 45m",
    stops: "Direct",
    price: 945,
    badge: "Fastest",
  },
  {
    airline: "Emirates",
    airlineCode: "EK",
    departure: "10:45",
    arrival: "23:15",
    duration: "12h 30m",
    stops: "1 stop",
    stopInfo: "via Dubai",
    price: 645,
  },
  {
    airline: "Lufthansa",
    airlineCode: "LH",
    departure: "13:00",
    arrival: "02:35",
    duration: "13h 35m",
    stops: "1 stop",
    stopInfo: "via Frankfurt",
    price: 565,
  },
  {
    airline: "KLM",
    airlineCode: "KL",
    departure: "14:25",
    arrival: "04:15",
    duration: "13h 50m",
    stops: "1 stop",
    stopInfo: "via Amsterdam",
    price: 585,
  },
  {
    airline: "Thai Airways",
    airlineCode: "TG",
    departure: "16:30",
    arrival: "06:45",
    duration: "14h 15m",
    stops: "1 stop",
    stopInfo: "via Bangkok",
    price: 635,
  },
  {
    airline: "Turkish Airlines",
    airlineCode: "TK",
    departure: "20:15",
    arrival: "11:25",
    duration: "15h 10m",
    stops: "1 stop",
    stopInfo: "via Istanbul",
    price: 475,
    badge: "Cheapest",
  },
  {
    airline: "Emirates",
    airlineCode: "EK",
    departure: "22:30",
    arrival: "12:55",
    duration: "13h 25m",
    stops: "1 stop",
    stopInfo: "via Dubai",
    price: 695,
  },
];

// ── VERY-LONG-HAUL (Europe ↔ Oceania / South America) ───────────────────────
// Always 1 or 2 stops via Dubai, Singapore, Bangkok, Doha, Istanbul, Amsterdam.
// $1200–$2800, 18–28h.
const VERY_LONG_HAUL: Omit<FlightOption, "id">[] = [
  {
    airline: "Emirates",
    airlineCode: "EK",
    departure: "08:30",
    arrival: "07:00",
    duration: "22h 30m",
    stops: "1 stop",
    stopInfo: "via Dubai",
    price: 1485,
    badge: "Best",
  },
  {
    airline: "Singapore Airlines",
    airlineCode: "SQ",
    departure: "11:15",
    arrival: "09:00",
    duration: "21h 45m",
    stops: "1 stop",
    stopInfo: "via Singapore",
    price: 1620,
    badge: "Fastest",
  },
  {
    airline: "Emirates",
    airlineCode: "EK",
    departure: "13:50",
    arrival: "12:55",
    duration: "23h 5m",
    stops: "1 stop",
    stopInfo: "via Dubai",
    price: 1545,
  },
  {
    airline: "Thai Airways",
    airlineCode: "TG",
    departure: "15:20",
    arrival: "15:10",
    duration: "23h 50m",
    stops: "1 stop",
    stopInfo: "via Bangkok",
    price: 1395,
  },
  {
    airline: "British Airways",
    airlineCode: "BA",
    departure: "17:45",
    arrival: "17:55",
    duration: "24h 10m",
    stops: "1 stop",
    stopInfo: "via Singapore",
    price: 1745,
  },
  {
    airline: "KLM",
    airlineCode: "KL",
    departure: "19:30",
    arrival: "20:20",
    duration: "24h 50m",
    stops: "2 stops",
    stopInfo: "via Amsterdam + Doha",
    price: 1295,
  },
  {
    airline: "Lufthansa",
    airlineCode: "LH",
    departure: "21:00",
    arrival: "22:35",
    duration: "25h 35m",
    stops: "2 stops",
    stopInfo: "via Frankfurt + Bangkok",
    price: 1350,
  },
  {
    airline: "Turkish Airlines",
    airlineCode: "TK",
    departure: "22:45",
    arrival: "01:00",
    duration: "26h 15m",
    stops: "2 stops",
    stopInfo: "via Istanbul + Singapore",
    price: 1185,
    badge: "Cheapest",
  },
];

// Quick lookup so getMockFlightsForLeg() returns the right catalogue.
// "featured" routes are normally handled by ROUTE_OVERRIDES (below) — the
// LONG_HAUL fallback only kicks in if a "featured" preset is added without a
// matching override, which would otherwise leave the page empty.
const CATALOGUES: Record<RouteCategory, Omit<FlightOption, "id">[]> = {
  "short": SHORT_HAUL,
  "long": LONG_HAUL,
  "very-long": VERY_LONG_HAUL,
  "featured": LONG_HAUL,
};

// ─────────────────────────────────────────────────────────────────────────────
// Featured-carrier route overrides
// ─────────────────────────────────────────────────────────────────────────────
// When `from-to` matches a key here, `getMockFlightsForLeg` returns this
// hand-tailored list INSTEAD of the generic distance-based catalogue. Use
// these for itineraries where the airline-via-hub combination is the whole
// point of the demo (e.g. Caribbean Airlines via Port of Spain, Fiji Airways
// via Nadi).
//
// Conventions for each list:
//   • The featured carrier appears first
//   • Badges still map to the actual values they label (Cheapest = lowest
//     price in the list, Fastest = shortest duration). Otherwise the
//     filter-bar sort behaves oddly.

// Tiny helper so the Fiji builder below stays readable. "Xh Ym" matches the
// format `parseDurationToMinutes` expects in filterFlights.ts.
function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

// ── Fiji Airways generator ──────────────────────────────────────────────────
// Every LAX/SFO origin × SYD/MEL/BNE/AKL/CHC destination. We generate these
// rather than hand-writing 10 nearly-identical lists. The deltas tweak
// duration + price so different city pairs feel slightly different without
// trying to be timetable-accurate (this is a prototype).
type FijiOrigin = { code: string; deltaMin: number; priceBias: number };
type FijiDest = { code: string; isNZ: boolean; deltaMin: number; priceBias: number };

const FIJI_ORIGINS: FijiOrigin[] = [
  // LAX is the baseline (no delta); SFO adds a touch because of the slightly
  // longer westbound first leg.
  { code: "LAX", deltaMin: 0,  priceBias: 0 },
  { code: "SFO", deltaMin: 25, priceBias: 35 },
];

const FIJI_DESTINATIONS: FijiDest[] = [
  // SYD is the baseline. Delta is "how much longer/shorter than LAX→SYD".
  { code: "SYD", isNZ: false, deltaMin: 0,    priceBias: 0 },
  { code: "MEL", isNZ: false, deltaMin: 55,   priceBias: 40 },
  { code: "BNE", isNZ: false, deltaMin: -50,  priceBias: -25 },
  { code: "AKL", isNZ: true,  deltaMin: -150, priceBias: -80 },
  { code: "CHC", isNZ: true,  deltaMin: -90,  priceBias: -50 },
];

function buildFijiRoute(
  origin: FijiOrigin,
  dest: FijiDest,
): Omit<FlightOption, "id">[] {
  const fjDelta = origin.deltaMin + dest.deltaMin;
  const priceBias = origin.priceBias + dest.priceBias;

  // The direct competitor depends on the destination's country — Qantas for
  // Australia, Air New Zealand for NZ.
  const directCarrier = dest.isNZ
    ? { name: "Air New Zealand", code: "NZ" }
    : { name: "Qantas",          code: "QF" };
  // Direct nonstop baseline: LAX→SYD ≈ 14h 10m; NZ destinations ~13h.
  const directBaseMins = dest.isNZ ? 13 * 60 + 5 : 14 * 60 + 10;
  const directMins = directBaseMins + origin.deltaMin + Math.max(0, dest.deltaMin);

  return [
    // Featured: Fiji Airways via Nadi — Cheapest of the bunch
    {
      airline: "Fiji Airways",
      airlineCode: "FJ",
      departure: "23:55",
      arrival: "11:25",
      duration: formatDuration(17 * 60 + 35 + fjDelta),
      stops: "1 stop",
      stopInfo: "via Nadi",
      price: 1185 + priceBias,
      badge: "Cheapest",
    },
    // Direct competitor — Fastest
    {
      airline: directCarrier.name,
      airlineCode: directCarrier.code,
      departure: "22:30",
      arrival: "10:15",
      duration: formatDuration(directMins),
      stops: "Direct",
      price: 1685 + priceBias,
      badge: "Fastest",
    },
    // United direct — curated "Best" pick (mid-price, direct)
    {
      airline: "United Airlines",
      airlineCode: "UA",
      departure: "21:15",
      arrival: "07:50",
      duration: formatDuration(directMins + 95),
      stops: "Direct",
      price: 1545 + priceBias,
      badge: "Best",
    },
    // Fiji Airways alternative — daytime departure, longer layover
    {
      airline: "Fiji Airways",
      airlineCode: "FJ",
      departure: "11:30",
      arrival: "09:45",
      duration: formatDuration(21 * 60 + 45 + fjDelta),
      stops: "1 stop",
      stopInfo: "via Nadi",
      price: 1325 + priceBias,
    },
    // Hawaiian via Honolulu — a different stopover for visual variety
    {
      airline: "Hawaiian Airlines",
      airlineCode: "HA",
      departure: "08:45",
      arrival: "16:25",
      duration: formatDuration(directMins + 4 * 60 + 15),
      stops: "1 stop",
      stopInfo: "via Honolulu",
      price: 1395 + priceBias,
    },
  ];
}

// Build the override map. Caribbean routes are hand-rolled; Fiji generated.
const ROUTE_OVERRIDES: Record<string, Omit<FlightOption, "id">[]> = {
  // ── Caribbean Airlines via Port of Spain ─────────────────────────────────
  "JFK-GND": [
    {
      airline: "Caribbean Airlines",
      airlineCode: "BW",
      departure: "08:30",
      arrival: "17:15",
      duration: "8h 45m",
      stops: "1 stop",
      stopInfo: "via Port of Spain",
      price: 580,
      badge: "Fastest",
    },
    {
      airline: "Caribbean Airlines",
      airlineCode: "BW",
      departure: "14:40",
      arrival: "01:55",
      duration: "11h 15m",
      stops: "1 stop",
      stopInfo: "via Port of Spain",
      price: 495,
      badge: "Cheapest",
    },
    {
      airline: "American Airlines",
      airlineCode: "AA",
      departure: "07:00",
      arrival: "16:25",
      duration: "9h 25m",
      stops: "1 stop",
      stopInfo: "via Miami",
      price: 645,
      badge: "Best",
    },
    {
      airline: "JetBlue",
      airlineCode: "B6",
      departure: "11:40",
      arrival: "22:50",
      duration: "11h 10m",
      stops: "1 stop",
      stopInfo: "via Fort Lauderdale",
      price: 565,
    },
    {
      airline: "Delta",
      airlineCode: "DL",
      departure: "16:25",
      arrival: "06:50",
      duration: "14h 25m",
      stops: "1 stop",
      stopInfo: "via Atlanta",
      price: 715,
    },
  ],

  "YYZ-BGI": [
    {
      airline: "Air Canada",
      airlineCode: "AC",
      departure: "09:30",
      arrival: "14:40",
      duration: "5h 10m",
      stops: "Direct",
      price: 685,
      badge: "Fastest",
    },
    {
      airline: "Caribbean Airlines",
      airlineCode: "BW",
      departure: "07:45",
      arrival: "14:20",
      duration: "6h 35m",
      stops: "1 stop",
      stopInfo: "via Port of Spain",
      price: 540,
      badge: "Best",
    },
    {
      airline: "WestJet",
      airlineCode: "WS",
      departure: "12:15",
      arrival: "17:50",
      duration: "5h 35m",
      stops: "Direct",
      price: 525,
      badge: "Cheapest",
    },
    {
      airline: "Caribbean Airlines",
      airlineCode: "BW",
      departure: "16:30",
      arrival: "03:55",
      duration: "11h 25m",
      stops: "1 stop",
      stopInfo: "via Port of Spain",
      price: 465,
    },
    {
      airline: "American Airlines",
      airlineCode: "AA",
      departure: "10:00",
      arrival: "19:35",
      duration: "9h 35m",
      stops: "1 stop",
      stopInfo: "via Miami",
      price: 615,
    },
  ],
};

// Populate the 10 Fiji Airways routes (LAX/SFO × 5 destinations).
FIJI_ORIGINS.forEach((origin) => {
  FIJI_DESTINATIONS.forEach((dest) => {
    ROUTE_OVERRIDES[`${origin.code}-${dest.code}`] = buildFijiRoute(origin, dest);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Route → category resolution
// ─────────────────────────────────────────────────────────────────────────────
// Match against the preset list first (handles "LHR" → "BKK" → "long").
// If the user typed something we don't recognise, fall back to "long" so the
// page never goes empty and they still see a useful demo set.
//
// We normalise both sides to upper-case + trim so casing / whitespace don't
// matter ("lhr " still matches "LHR").

function normalise(input: string): string {
  return input.trim().toUpperCase();
}

export function categoriseRoute(from: string, to: string): RouteCategory {
  const f = normalise(from);
  const t = normalise(to);
  const match = ROUTE_PRESETS.find(
    (p) => normalise(p.from) === f && normalise(p.to) === t,
  );
  return match?.category ?? "long";
}

// ─────────────────────────────────────────────────────────────────────────────
// Public helpers used by FlightListPage / FlightFilterBar
// ─────────────────────────────────────────────────────────────────────────────

// Same `from` + `to` always produces the same prices — feels less random
// than `Math.random()` and means switching back to leg 1 doesn't shuffle prices.
//
// Resolution order:
//   1. ROUTE_OVERRIDES   — hand-tailored carrier-specific itineraries
//   2. CATALOGUES[cat]   — generic distance-based catalogue
// Same deterministic price offset is applied in both branches.
export function getMockFlightsForLeg(from: string, to: string): FlightOption[] {
  const f = normalise(from);
  const t = normalise(to);
  const offset = ((from.length + to.length) % 5) * 20;

  const override = ROUTE_OVERRIDES[`${f}-${t}`];
  if (override) {
    return override.map((opt, i) => ({
      ...opt,
      id: `${from}-${to}-override-${i}`,
      price: opt.price + offset,
    }));
  }

  const catalogue = CATALOGUES[categoriseRoute(from, to)];
  return catalogue.map((opt, i) => ({
    ...opt,
    id: `${from}-${to}-${i}`,
    price: opt.price + offset,
  }));
}

// Parse "13h 45m" → 825 minutes. Returns 0 if the string is malformed.
export function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}
