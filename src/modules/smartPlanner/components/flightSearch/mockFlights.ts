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
// We reuse the airport catalogue's `region` field to decide which stopover hub
// makes geographic sense for a route — that way there's a single source of
// truth and we don't duplicate "which city is in which region" lists here.
import { findAirportByCode, type AirportRegion } from "./airports";

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

  // Look up the hand-tailored list for this route. The override map only
  // stores each featured route in ONE direction (e.g. "LAX-AKL"), but a round
  // trip also needs the RETURN leg ("AKL-LAX") to route through the same
  // sensible hub (Nadi) instead of falling back to the generic catalogue —
  // which is why the inbound flight was wrongly showing "via Istanbul". So we
  // also try the reversed key. The hub (Nadi) makes geographic sense in both
  // directions, so reusing the same list for the return leg is correct.
  const override = ROUTE_OVERRIDES[`${f}-${t}`] ?? ROUTE_OVERRIDES[`${t}-${f}`];
  if (override) {
    return override.map((opt, i) => ({
      ...opt,
      id: `${from}-${to}-override-${i}`,
      price: opt.price + offset,
    }));
  }

  // Drop the catalogue's "Direct" options on routes where no real non-stop
  // exists (Caribbean islands, far Oceania routes) so we don't show an
  // impossible non-stop. Routes that DO have non-stops keep theirs.
  const allowDirect = routeHasNonStop(from, to);
  const catalogue = CATALOGUES[categoriseRoute(from, to)].filter(
    (opt) => allowDirect || opt.stops !== "Direct",
  );

  // The generic catalogues bake in FIXED connection cities (e.g. "via Istanbul")
  // that don't fit every route. Rewrite each stopping flight to connect through
  // a hub that makes geographic sense for THIS route — and update the airline to
  // match so "airline via city" stays believable. Direct flights, and routes
  // with no sensible hub (short-haul / same-region), are left untouched.
  const hubs = getConnectionHubsForRoute(from, to);

  return catalogue.map((opt, i) => {
    const base = { ...opt, id: `${from}-${to}-${i}`, price: opt.price + offset };
    if (opt.stops === "Direct" || hubs.length === 0) return base;

    // How many cities to name: "2 stops" → two, otherwise one. Cycle through the
    // sensible-hub list (offset by the flight's index) so different flights show
    // different connections, then de-dupe in case the list is shorter than the
    // stop count (avoids "via Dubai + Dubai").
    const numStops = opt.stops === "2 stops" ? 2 : 1;
    const chosen = Array.from({ length: numStops }, (_, s) => hubs[(i + s) % hubs.length]);
    const cities = [...new Set(chosen.map((h) => h.city))];

    return {
      ...base,
      airline: chosen[0].airline,
      airlineCode: chosen[0].airlineCode,
      stopInfo: `via ${cities.join(" + ")}`,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Stopover offers
// ─────────────────────────────────────────────────────────────────────────────
// When the user opts into a stopover on the search form, we surface these on
// the chosen leg alongside the normal results. Each is a regular FlightOption
// with the extra `stopover` field set — that's what FlightResultCard reads to
// show the stopover treatment, and what App.tsx reads to add the hotel step.
//
// A stopover hub is a city travellers naturally break a long journey at —
// and crucially it has to make GEOGRAPHIC sense for the route. You'd never
// route a New York → Grenada trip through Dubai; you'd stop in Port of Spain.
//
// Each hub carries the TWO physical flights that make up the journey —
// origin→hub (`out`) and hub→destination (`onward`) — so the card can show
// both legs with their own times. `arrivesNextDay` drives the "+1" marker.
//
// We keep a small catalogue of hubs keyed by their airport code, then pick the
// right one(s) for a given route below in `getHubsForRoute`.
type StopoverHub = {
  city: string;
  hubCode: string;
  airline: string;
  airlineCode: string;
  duration: string; // overall journey time (used for sort / fallback)
  price: number;
  out: { depTime: string; arrTime: string; duration: string; arrivesNextDay?: boolean; note?: string };
  onward: { depTime: string; arrTime: string; duration: string; arrivesNextDay?: boolean; note?: string };
};

const HUBS: Record<string, StopoverHub> = {
  // ── Port of Spain — the natural break for Caribbean island-hopping.
  // Caribbean Airlines (BW) hubs here; e.g. JFK/YYZ → POS → GND/BGI.
  POS: {
    city: "Port of Spain",
    hubCode: "POS",
    airline: "Caribbean Airlines",
    airlineCode: "BW",
    duration: "9h 05m",
    price: 720,
    out: { depTime: "09:30", arrTime: "14:15", duration: "4h 45m", note: "direct" },
    onward: { depTime: "16:10", arrTime: "17:00", duration: "0h 50m", note: "short hop" },
  },
  // ── Nadi — the South Pacific gateway for the Americas → Australasia run.
  // Fiji Airways (FJ) hubs here; e.g. LAX/SFO → NAN → SYD/MEL/BNE/AKL/CHC.
  NAN: {
    city: "Nadi",
    hubCode: "NAN",
    airline: "Fiji Airways",
    airlineCode: "FJ",
    duration: "18h 40m",
    price: 1340,
    out: { depTime: "22:30", arrTime: "05:50", duration: "10h 50m", arrivesNextDay: true, note: "overnight, crosses date line" },
    onward: { depTime: "13:20", arrTime: "16:10", duration: "3h 50m", note: "direct" },
  },
  // ── Dubai — Emirates' hub; ideal for Europe ↔ Asia / Australasia.
  DXB: {
    city: "Dubai",
    hubCode: "DXB",
    airline: "Emirates",
    airlineCode: "EK",
    duration: "20h 35m",
    price: 1180,
    out: { depTime: "21:40", arrTime: "07:55", duration: "7h 15m", arrivesNextDay: true, note: "direct" },
    onward: { depTime: "09:50", arrTime: "06:10", duration: "13h 20m", arrivesNextDay: true, note: "overnight" },
  },
  // ── Singapore — Singapore Airlines' hub; ideal for Europe ↔ SE Asia / Australasia.
  SIN: {
    city: "Singapore",
    hubCode: "SIN",
    airline: "Singapore Airlines",
    airlineCode: "SQ",
    duration: "21h 25m",
    price: 1295,
    out: { depTime: "12:20", arrTime: "08:05", duration: "12h 45m", arrivesNextDay: true, note: "direct" },
    onward: { depTime: "20:30", arrTime: "07:40", duration: "8h 10m", arrivesNextDay: true, note: "overnight" },
  },
  // ── Doha — Qatar Airways' hub; a strong Europe ↔ Asia alternative to Dubai.
  DOH: {
    city: "Doha",
    hubCode: "DOH",
    airline: "Qatar Airways",
    airlineCode: "QR",
    duration: "20h 10m",
    price: 1225,
    out: { depTime: "08:15", arrTime: "17:05", duration: "6h 50m", note: "direct" },
    onward: { depTime: "20:40", arrTime: "08:30", duration: "8h 50m", arrivesNextDay: true, note: "overnight" },
  },
  // ── Istanbul — Turkish Airlines' hub; bridges Europe ↔ Asia / Africa.
  IST: {
    city: "Istanbul",
    hubCode: "IST",
    airline: "Turkish Airlines",
    airlineCode: "TK",
    duration: "16h 05m",
    price: 1090,
    out: { depTime: "14:30", arrTime: "19:45", duration: "4h 15m", note: "direct" },
    onward: { depTime: "02:10", arrTime: "16:30", duration: "9h 20m", arrivesNextDay: true, note: "overnight" },
  },
  // ── Reykjavík — Icelandair's famous free transatlantic stopover (Europe ↔ N. America).
  KEF: {
    city: "Reykjavík",
    hubCode: "KEF",
    airline: "Icelandair",
    airlineCode: "FI",
    duration: "12h 00m",
    price: 760,
    out: { depTime: "08:00", arrTime: "09:45", duration: "3h 15m", note: "direct" },
    onward: { depTime: "13:00", arrTime: "15:10", duration: "6h 10m", note: "direct" },
  },
  // ── São Paulo — LATAM's hub for Europe / N. America ↔ South America.
  GRU: {
    city: "São Paulo",
    hubCode: "GRU",
    airline: "LATAM",
    airlineCode: "LA",
    duration: "14h 30m",
    price: 980,
    out: { depTime: "22:00", arrTime: "05:30", duration: "10h 30m", arrivesNextDay: true, note: "overnight" },
    onward: { depTime: "10:00", arrTime: "13:00", duration: "3h 00m", note: "direct" },
  },
  // ── Hong Kong — Cathay Pacific's hub for trans-Pacific N. America ↔ Asia.
  HKG: {
    city: "Hong Kong",
    hubCode: "HKG",
    airline: "Cathay Pacific",
    airlineCode: "CX",
    duration: "20h 00m",
    price: 1210,
    out: { depTime: "01:30", arrTime: "06:00", duration: "15h 30m", arrivesNextDay: true, note: "crosses date line" },
    onward: { depTime: "09:00", arrTime: "13:00", duration: "4h 00m", note: "direct" },
  },
  // ── Tokyo — ANA's hub; a trans-Pacific alternative to Hong Kong.
  NRT: {
    city: "Tokyo",
    hubCode: "NRT",
    airline: "ANA",
    airlineCode: "NH",
    duration: "18h 30m",
    price: 1180,
    out: { depTime: "11:00", arrTime: "14:30", duration: "11h 30m", arrivesNextDay: true, note: "crosses date line" },
    onward: { depTime: "17:30", arrTime: "23:00", duration: "7h 00m", note: "direct" },
  },
  // ── Santiago de Chile — LATAM's hub for the trans-Pacific Oceania ↔ S. America
  //    run (e.g. Sydney → Santiago → Buenos Aires). Authored Oceania → S. America:
  //    `out` is the long ocean crossing, `onward` the short South-American hop.
  SCL: {
    city: "Santiago de Chile",
    hubCode: "SCL",
    airline: "LATAM",
    airlineCode: "LA",
    duration: "17h 00m",
    price: 1290,
    out: { depTime: "11:00", arrTime: "10:30", duration: "12h 30m", note: "crosses date line" },
    onward: { depTime: "13:45", arrTime: "16:00", duration: "2h 15m", note: "short hop" },
  },
};

// Codes treated as "Americas west coast" for the Pacific (Nadi) routing — the
// only place a simple region check isn't precise enough, because JFK → Sydney
// realistically routes via Asia/Gulf, not Fiji, whereas LAX → Sydney goes via
// Nadi. So we keep west-coast origins explicit; everything else uses regions.
const AMERICAS_WEST = new Set(["LAX", "SFO", "SEA", "YVR", "SAN"]);

// Which hub(s) make sense for an unordered pair of regions. Keys are the two
// region names sorted alphabetically and joined with "|" (see regionKey). The
// first entry is preferred; we keep a couple for variety. Pairs that involve
// the Caribbean / Oceania are handled by the dedicated rules below, so they're
// intentionally absent here.
//
// A pair is listed ONLY when a multi-night stopover genuinely makes sense for
// it (i.e. a long-haul journey with a natural hub in the middle). Short-haul or
// same-region pairs — intra-Europe, intra-US, Buenos Aires→São Paulo — are left
// OUT on purpose: the feature is opt-in, so showing nothing is better than
// inventing a pointless stopover. Unlisted pairs return no offers (see below).
const REGION_PAIR_HUBS: Record<string, string[]> = {
  "Asia|Europe": ["DXB", "DOH", "IST"],
  "Africa|Europe": ["DXB", "DOH", "IST"],
  "Europe|Middle East": ["DOH", "IST"], // DXB excluded automatically if it's the endpoint
  "Europe|North America": ["KEF"], // Icelandair's transatlantic stopover
  "Europe|South America": ["GRU"],
  "Asia|North America": ["HKG", "NRT"], // trans-Pacific
  "Asia|Middle East": ["DOH", "DXB"],
  "Asia|Asia": ["HKG", "SIN"],
  "Asia|South America": ["GRU", "DXB"],
  "Africa|Asia": ["DXB", "DOH"],
  "Africa|North America": ["DXB", "DOH"],
  "Africa|Middle East": ["DOH"],
  "Africa|South America": ["GRU"],
  "Middle East|North America": ["DOH"],
  "Middle East|South America": ["GRU"],
  "North America|South America": ["GRU"],
};

// The order-independent key into REGION_PAIR_HUBS.
function regionKey(a: AirportRegion, b: AirportRegion): string {
  return [a, b].sort().join("|");
}

function regionOf(code: string): AirportRegion | undefined {
  return findAirportByCode(code)?.region;
}

// Resolve a list of hub codes into hub objects, dropping any hub that IS one of
// the route's endpoints (you can't stop over in the city you're flying to) and
// any code we don't have flight data for. Caps at two so the list stays short.
function resolveHubs(codes: string[], from: string, to: string): StopoverHub[] {
  return codes
    .filter((code) => code !== from && code !== to)
    .map((code) => HUBS[code])
    .filter(Boolean)
    .slice(0, 2);
}

// Flip a hub's two segments. The `out`/`onward` flights are authored for the
// canonical OUTBOUND direction (e.g. JFK → POS is the long leg, POS → GND the
// short hop). On the RETURN leg the geography reverses — the short hop comes
// first — so we swap the two segments to keep each leg's duration believable.
function reverseHub(hub: StopoverHub): StopoverHub {
  return { ...hub, out: hub.onward, onward: hub.out };
}

// Pick the geographically appropriate hub(s) for a route. We test the regions
// of BOTH endpoints (matching is direction-AGNOSTIC — the user can opt into a
// stopover on the outbound OR the return leg), reverse a hub's segments when
// the leg runs "backwards" vs. the canonical direction, and exclude any hub
// that's itself an endpoint.
//
// Returns an EMPTY array when no hub makes geographic sense (short-haul, same
// region, or an unmapped/typed route). Because the stopover is opt-in, showing
// no offers is the right answer there — the normal flight results still appear.
function getHubsForRoute(from: string, to: string): StopoverHub[] {
  const orient = (reversed: boolean, hubs: StopoverHub[]) =>
    reversed ? hubs.map(reverseHub) : hubs;

  const fromRegion = regionOf(from);
  const toRegion = regionOf(to);

  // A trip that stays within one region is short-haul — no stopover offered.
  if (fromRegion && fromRegion === toRegion) return [];

  // 1. Caribbean island on either end → break at Port of Spain.
  //    Canonical = island is the destination; reverse when it's the origin.
  if (fromRegion === "Caribbean" || toRegion === "Caribbean") {
    return orient(fromRegion === "Caribbean", resolveHubs(["POS"], from, to));
  }

  // 2. Americas WEST coast ↔ Oceania → break at Nadi (Fiji).
  //    Canonical = Americas is the origin; reverse when Oceania is the origin.
  const westPacific =
    (AMERICAS_WEST.has(from) && toRegion === "Oceania") ||
    (fromRegion === "Oceania" && AMERICAS_WEST.has(to));
  if (westPacific) return orient(fromRegion === "Oceania", resolveHubs(["NAN"], from, to));

  // 3. Oceania ↔ South America → break at Santiago de Chile (LATAM's route).
  //    Canonical = Oceania is the origin; reverse when S. America is the origin.
  const oceaniaSouthAmerica =
    (fromRegion === "Oceania" && toRegion === "South America") ||
    (fromRegion === "South America" && toRegion === "Oceania");
  if (oceaniaSouthAmerica) {
    return orient(fromRegion === "South America", resolveHubs(["SCL"], from, to));
  }

  // 4. Any other Oceania route (Europe/Asia/Africa/Gulf/east-coast US ↔ AU/NZ)
  //    → the classic "Kangaroo route" Gulf/Asia hubs. Canonical = the non-Oceania
  //    side is the origin; reverse when Oceania is the origin.
  if (fromRegion === "Oceania" || toRegion === "Oceania") {
    return orient(fromRegion === "Oceania", resolveHubs(["SIN", "DXB"], from, to));
  }

  // 5. Everything else: look the region pair up in the table. The hubs here are
  //    symmetric enough that we don't need to reverse the segments. An unmapped
  //    pair (or a typed code we don't catalogue) yields no offers.
  if (fromRegion && toRegion) {
    return resolveHubs(REGION_PAIR_HUBS[regionKey(fromRegion, toRegion)] ?? [], from, to);
  }

  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Connection hubs for the GENERIC catalogues
// ─────────────────────────────────────────────────────────────────────────────
// The hand-written catalogues (SHORT/LONG/VERY_LONG_HAUL) have FIXED connection
// cities baked into each template — e.g. "Turkish Airlines via Istanbul". That's
// fine for a Europe↔Asia route, but nonsense for a Caribbean or trans-Pacific
// one, which is why the inbound GND→LAX flight was showing "via Istanbul".
//
// To fix EVERY route (not just the few with hand-tailored overrides), we rewrite
// each catalogue flight's connection so it makes geographic sense for the actual
// route. This is the transit-only cousin of the stopover HUBS above: same idea
// (pick a sensible hub for the route), but these are just pass-through layovers,
// not multi-night stays — so each only needs a city + the carrier that really
// connects there, so "airline via city" reads true.
type ConnectionHub = { city: string; airline: string; airlineCode: string };

const CONNECTION_HUBS: Record<string, ConnectionHub> = {
  FRA: { city: "Frankfurt",     airline: "Lufthansa",          airlineCode: "LH" },
  AMS: { city: "Amsterdam",     airline: "KLM",                airlineCode: "KL" },
  LHR: { city: "London",        airline: "British Airways",    airlineCode: "BA" },
  CDG: { city: "Paris",         airline: "Air France",         airlineCode: "AF" },
  DXB: { city: "Dubai",         airline: "Emirates",           airlineCode: "EK" },
  DOH: { city: "Doha",          airline: "Qatar Airways",      airlineCode: "QR" },
  IST: { city: "Istanbul",      airline: "Turkish Airlines",   airlineCode: "TK" },
  SIN: { city: "Singapore",     airline: "Singapore Airlines", airlineCode: "SQ" },
  BKK: { city: "Bangkok",       airline: "Thai Airways",       airlineCode: "TG" },
  HKG: { city: "Hong Kong",     airline: "Cathay Pacific",     airlineCode: "CX" },
  NRT: { city: "Tokyo",         airline: "ANA",                airlineCode: "NH" },
  KEF: { city: "Reykjavík",     airline: "Icelandair",         airlineCode: "FI" },
  GRU: { city: "São Paulo",     airline: "LATAM",              airlineCode: "LA" },
  SCL: { city: "Santiago",      airline: "LATAM",              airlineCode: "LA" },
  NAN: { city: "Nadi",          airline: "Fiji Airways",       airlineCode: "FJ" },
  HNL: { city: "Honolulu",      airline: "Hawaiian Airlines",  airlineCode: "HA" },
  POS: { city: "Port of Spain", airline: "Caribbean Airlines", airlineCode: "BW" },
  MIA: { city: "Miami",         airline: "American Airlines",  airlineCode: "AA" },
};

// Which connecting hub(s) make sense for an unordered region pair. Same key
// format as REGION_PAIR_HUBS (regions sorted + joined with "|"). We list a few
// per pair so a route's several stopping flights show some variety rather than
// all funnelling through one city. Order = preference.
const REGION_PAIR_CONNECTIONS: Record<string, string[]> = {
  "Europe|Europe":              ["FRA", "AMS", "LHR", "CDG"],
  "North America|North America":["MIA", "CDG"], // CDG dropped if not an endpoint match; mostly direct anyway
  "Asia|Asia":                  ["HKG", "SIN", "BKK"],
  "South America|South America":["GRU", "SCL"],
  "Middle East|Middle East":    ["DOH", "DXB"],
  "Asia|Europe":                ["DXB", "DOH", "IST", "FRA"],
  "Africa|Europe":              ["DXB", "DOH", "CDG", "IST"],
  "Europe|Middle East":         ["DOH", "IST", "FRA"],
  "Europe|North America":       ["KEF", "LHR", "AMS"],
  "Europe|South America":       ["GRU", "CDG", "LHR"],
  "Asia|North America":         ["HKG", "NRT", "SIN"],
  "Asia|Middle East":           ["DOH", "DXB"],
  "Asia|South America":         ["GRU", "DXB"],
  "Africa|Asia":                ["DXB", "DOH"],
  "Africa|North America":       ["DXB", "CDG", "DOH"],
  "Africa|Middle East":         ["DOH", "DXB"],
  "Africa|South America":       ["GRU"],
  "Middle East|North America":  ["DOH", "DXB"],
  "Middle East|South America":  ["GRU", "DOH"],
  "North America|South America":["MIA", "GRU"],
};

// Pick the geographically sensible connecting hub(s) for a route, as transit
// layovers. Mirrors the special-case geography of getHubsForRoute (Caribbean,
// Pacific, Oceania) and then falls back to the region-pair table. Excludes any
// hub that's itself an endpoint (you don't connect through your destination).
//
// Returns an EMPTY array when nothing sensible applies (same region with no
// entry, or an unmapped/typed route) — callers then leave the flight unchanged.
function getConnectionHubsForRoute(from: string, to: string): ConnectionHub[] {
  const f = normalise(from);
  const t = normalise(to);

  // Resolve a list of hub codes → hub objects, dropping endpoints + unknowns.
  const resolve = (codes: string[]) =>
    codes
      .filter((code) => code !== f && code !== t)
      .map((code) => CONNECTION_HUBS[code])
      .filter(Boolean);

  const fromRegion = regionOf(f);
  const toRegion = regionOf(t);

  // 1. Caribbean island on either end → Port of Spain (or Miami).
  if (fromRegion === "Caribbean" || toRegion === "Caribbean") {
    return resolve(["POS", "MIA"]);
  }

  // 2. Americas WEST coast ↔ Oceania → trans-Pacific via Nadi / Honolulu.
  const westPacific =
    (AMERICAS_WEST.has(f) && toRegion === "Oceania") ||
    (fromRegion === "Oceania" && AMERICAS_WEST.has(t));
  if (westPacific) return resolve(["NAN", "HNL"]);

  // 3. Oceania ↔ South America → trans-Pacific via Santiago.
  const oceaniaSouthAmerica =
    (fromRegion === "Oceania" && toRegion === "South America") ||
    (fromRegion === "South America" && toRegion === "Oceania");
  if (oceaniaSouthAmerica) return resolve(["SCL", "GRU"]);

  // 4. Any other Oceania route → the classic Gulf / Asia "Kangaroo route" hubs.
  if (fromRegion === "Oceania" || toRegion === "Oceania") {
    return resolve(["SIN", "DXB", "HKG"]);
  }

  // 5. Everything else: look the region pair up in the table.
  if (fromRegion && toRegion) {
    return resolve(REGION_PAIR_CONNECTIONS[regionKey(fromRegion, toRegion)] ?? []);
  }

  return [];
}

// Does a realistic NON-STOP flight exist for this route? When it doesn't, we
// drop the "Direct" options from the generic catalogue so we never invent an
// impossible non-stop (e.g. there's no direct Los Angeles → Grenada — you
// always connect through a hub). Featured overrides hand-control their own
// direct/connecting mix, so this only gates the generic catalogues.
function routeHasNonStop(from: string, to: string): boolean {
  const f = normalise(from);
  const t = normalise(to);
  const fromRegion = regionOf(f);
  const toRegion = regionOf(t);

  // Caribbean islands have no long-haul non-stops in this dataset — you always
  // connect through a hub like Port of Spain.
  if (fromRegion === "Caribbean" || toRegion === "Caribbean") return false;

  // Oceania (Australia / NZ) is reachable non-stop ONLY from the US West Coast,
  // Asia, the Gulf, or South America. From Europe / Africa / the US East Coast
  // it always connects (the classic "Kangaroo route"), so no direct exists.
  if (fromRegion === "Oceania" || toRegion === "Oceania") {
    const otherRegion = fromRegion === "Oceania" ? toRegion : fromRegion;
    const otherCode = fromRegion === "Oceania" ? t : f;
    return (
      AMERICAS_WEST.has(otherCode) ||      // LAX / SFO ↔ Oceania
      otherRegion === "Asia" ||            // Singapore / Hong Kong ↔ Oceania
      otherRegion === "Middle East" ||     // Dubai / Doha ↔ Oceania
      otherRegion === "South America"      // Sydney ↔ Santiago
    );
  }

  // Every other route (intra-region, transatlantic, Europe↔Asia, trans-Pacific,
  // Europe↔South America…) has real non-stop service, so keep the directs.
  return true;
}

// True when this route has at least one geographically sensible stopover hub.
// The stepper uses this to decide whether to show the "Stopover hotel" step —
// it must agree with getStopoverOffersForLeg (both build on getHubsForRoute) so
// the step never appears for a route that surfaces no offers.
export function routeHasStopover(from: string, to: string): boolean {
  return getHubsForRoute(from, to).length > 0;
}

export function getStopoverOffersForLeg(
  from: string,
  to: string,
  nights: number,
): FlightOption[] {
  const offset = ((from.length + to.length) % 5) * 20;
  return getHubsForRoute(from, to).map((hub, i) => ({
    id: `${from}-${to}-stopover-${hub.airlineCode}`,
    airline: hub.airline,
    airlineCode: hub.airlineCode,
    // Top-level times describe the overall journey (out departs → onward
    // arrives) — kept for sorting and the simpler fallback layout.
    departure: hub.out.depTime,
    arrival: hub.onward.arrTime,
    duration: hub.duration,
    // It's still a 1-stop flight — the difference is you stay a few nights.
    stops: "1 stop",
    stopInfo: `via ${hub.city}`,
    price: hub.price + offset,
    // The second hub offers one fewer night so the list shows some variety,
    // always clamped to at least 1.
    stopover: {
      city: hub.city,
      nights: Math.max(1, nights - i),
      hubCode: hub.hubCode,
      out: hub.out,
      onward: hub.onward,
    },
  }));
}

// Parse "13h 45m" → 825 minutes. Returns 0 if the string is malformed.
export function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}
