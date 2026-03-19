// ─────────────────────────────────────────────────────────────────────────────
// Cached Packages Mock Data
//
// These represent packages that were pre-built by the TripCache service.
// They arrive almost instantly (200ms simulated delay) and include a
// rateCalendar so users can explore different departure dates in the modal.
//
// All packages are Cancún, flying LHR → CUN. Two of these packages
// (pkg_c001 and pkg_c003) share their deduplicationKey with live packages —
// so when live results arrive, those cards update in place with fresher prices.
//
// Deduplication key format: `${giataId}_${outboundFlight}_${returnFlight}_${departureDate}`
// ─────────────────────────────────────────────────────────────────────────────

import { addDays, format } from 'date-fns';
import { UnifiedPackage } from '../../types';

// ── Shared flight legs ────────────────────────────────────────────────────────
// Two flight variants: British Airways (BA) and Virgin Atlantic (VS).
// Reused across packages to keep mock data concise.

const ba_outbound = (departureDate: string) => ({
  carrier: "British Airways",
  flightNumber: "BA2491",
  departureAirport: "LHR",
  arrivalAirport: "CUN",
  departureTime: `${departureDate}T11:00:00Z`,
  arrivalTime: `${departureDate}T21:30:00Z`,
  durationMinutes: 630,
});

const ba_return = (returnDate: string) => ({
  carrier: "British Airways",
  flightNumber: "BA2492",
  departureAirport: "CUN",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T17:00:00Z`,
  arrivalTime: `${returnDate}T09:00:00Z`, // next day, but ISO includes the date
  durationMinutes: 600,
});

const vs_outbound = (departureDate: string) => ({
  carrier: "Virgin Atlantic",
  flightNumber: "VS113",
  departureAirport: "LHR",
  arrivalAirport: "CUN",
  departureTime: `${departureDate}T09:30:00Z`,
  arrivalTime: `${departureDate}T19:45:00Z`,
  durationMinutes: 615,
});

const vs_return = (returnDate: string) => ({
  carrier: "Virgin Atlantic",
  flightNumber: "VS114",
  departureAirport: "CUN",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T16:00:00Z`,
  arrivalTime: `${returnDate}T07:30:00Z`,
  durationMinutes: 570,
});

// ── Rate calendar helper ───────────────────────────────────────────────────────
// Generates a price for EVERY day in March–May 2026 so the calendar looks
// like a real price-per-day holiday grid (similar to TUI / jet2holidays).
// Starts from March so prices are visible in the current month.
//
// Price variation rules:
//   - Weekends (Sat/Sun) → +8% premium (typically more popular departures)
//   - A gentle sine-wave oscillation adds ±~35pp of daily variation
//   - A handful of specific dates are marked `available: false` (sold out)
const makeRateCalendar = (basePricePerPerson: number) => {
  // Dates that are fully sold out — price still shows but cell is non-selectable
  const soldOut = new Set([
    "2026-03-21", "2026-03-22", // late-March weekend sold out
    "2026-03-28", "2026-03-29", // Easter weekend March sold out
    "2026-04-08", "2026-04-09", // Easter weekend April sold out
    "2026-04-22", "2026-04-23", // mid-April weekend sold out
    "2026-05-01",               // May Day bank holiday sold out
    "2026-05-12", "2026-05-13", // mid-May sold out
    "2026-05-26", "2026-05-27", // late May bank holiday sold out
  ]);

  // Use date-fns addDays + format so the date strings are generated the same
  // way as the calendar component — no Date mutation, no timezone ambiguity.
  const entries: { departureDate: string; pricePerPerson: number; available: boolean }[] = [];
  const startDate = new Date(2026, 2, 1);  // March 1 — month is 0-indexed (2 = March)
  const totalDays = 92;                    // 31 days in March + 30 in April + 31 in May

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(startDate, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = date.getDay();       // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Weekend premium (Saturday/Sunday departures sell at a slight uplift)
    const weekendPremium = isWeekend ? Math.round(basePricePerPerson * 0.08) : 0;
    // Gentle wave so adjacent days aren't all the same price
    const wave = Math.round(Math.sin(date.getDate() * 0.65) * 35);
    // Floor at 85% of base so we never generate unrealistically cheap dates
    const price = Math.max(
      Math.round(basePricePerPerson + weekendPremium + wave),
      Math.round(basePricePerPerson * 0.85),
    );

    entries.push({
      departureDate: dateStr,
      pricePerPerson: price,
      available: !soldOut.has(dateStr),
    });
  }

  return entries;
};

// ── Package data ───────────────────────────────────────────────────────────────

export const CACHED_PACKAGES: UnifiedPackage[] = [

  // pkg_c001 — will be REPLACED by live package pkg_l001 (same dedup key)
  // The live version has a lower price — this is the "price updates in place" demo.
  {
    packageId: "pkg_c001",
    sourceMode: "cache",
    deduplicationKey: "giata001_BA2491_BA2492_2026-04-28",
    hotel: {
      giataId: "giata001",
      name: "Hotel Krystal Grand Cancún",
      category: 4,
      mainImage: "https://loremflickr.com/800/500/cancun,beach,resort?lock=11",
      trustYou: { rating: 82, recommendationScore: 88, reviewCount: 1847 },
      amenities: ["Beachfront", "Outdoor pool", "Spa", "All-day dining", "Kids club"],
      location: "Hotel Zone, Cancún",
    },
    room: { roomType: "Superior Oceanview Room", boardType: "All Inclusive" },
    flights: {
      outbound: ba_outbound("2026-04-28"),
      return:   ba_return("2026-05-05"),
    },
    price: { perPerson: 849, total: 1698, currency: "GBP" },
    rateCalendar: makeRateCalendar(849),
  },

  // pkg_c002 — stays as cache (no live replacement)
  {
    packageId: "pkg_c002",
    sourceMode: "cache",
    deduplicationKey: "giata002_BA2491_BA2492_2026-05-05",
    hotel: {
      giataId: "giata002",
      name: "Fiesta Americana Grand Coral Beach",
      category: 5,
      mainImage: "https://loremflickr.com/800/500/cancun,luxury,oceanfront?lock=22",
      trustYou: { rating: 91, recommendationScore: 95, reviewCount: 2341 },
      amenities: ["Private beach", "5 pools", "Luxury spa", "6 restaurants", "Adults-only pool"],
      location: "Punta Cancún, Hotel Zone",
    },
    room: { roomType: "Grand Club Oceanfront Suite", boardType: "Breakfast Included" },
    flights: {
      outbound: ba_outbound("2026-05-05"),
      return:   ba_return("2026-05-12"),
    },
    price: { perPerson: 1199, total: 2398, currency: "GBP" },
    rateCalendar: makeRateCalendar(1199),
  },

  // pkg_c003 — will be REPLACED by live package pkg_l002 (same dedup key)
  {
    packageId: "pkg_c003",
    sourceMode: "cache",
    deduplicationKey: "giata003_VS113_VS114_2026-04-21",
    hotel: {
      giataId: "giata003",
      name: "Moon Palace Golf & Spa Resort",
      category: 5,
      mainImage: "https://loremflickr.com/800/500/cancun,palace,golf,spa?lock=33",
      trustYou: { rating: 89, recommendationScore: 93, reviewCount: 3102 },
      amenities: ["Golf course", "Multiple pools", "Luxury spa", "10 restaurants", "Water park"],
      location: "South Hotel Zone, Cancún",
    },
    room: { roomType: "Deluxe Suite Ocean View", boardType: "All Inclusive" },
    flights: {
      outbound: vs_outbound("2026-04-21"),
      return:   vs_return("2026-04-28"),
    },
    price: { perPerson: 1099, total: 2198, currency: "GBP" },
    rateCalendar: makeRateCalendar(1099),
  },

  // pkg_c004 — stays as cache
  {
    packageId: "pkg_c004",
    sourceMode: "cache",
    deduplicationKey: "giata004_VS113_VS114_2026-05-12",
    hotel: {
      giataId: "giata004",
      name: "Hyatt Ziva Cancún",
      category: 5,
      mainImage: "https://loremflickr.com/800/500/cancun,infinity,pool,oceanview?lock=44",
      trustYou: { rating: 93, recommendationScore: 97, reviewCount: 1654 },
      amenities: ["3 pools", "Private beach", "Swim-up bar", "Rooftop terrace", "Kids club"],
      location: "Punta Cancún, Hotel Zone",
    },
    room: { roomType: "King Club Ocean View", boardType: "All Inclusive" },
    flights: {
      outbound: vs_outbound("2026-05-12"),
      return:   vs_return("2026-05-19"),
    },
    price: { perPerson: 1349, total: 2698, currency: "GBP" },
    rateCalendar: makeRateCalendar(1349),
  },

  // pkg_c005 — stays as cache
  {
    packageId: "pkg_c005",
    sourceMode: "cache",
    deduplicationKey: "giata005_BA2491_BA2492_2026-06-09",
    hotel: {
      giataId: "giata005",
      name: "Live Aqua Beach Resort Cancún",
      category: 5,
      mainImage: "https://loremflickr.com/800/500/cancun,boutique,adults,spa?lock=55",
      trustYou: { rating: 88, recommendationScore: 92, reviewCount: 987 },
      amenities: ["Adults only", "Boutique hotel", "Spa & wellness", "Gourmet dining", "Private beach"],
      location: "Hotel Zone, Cancún",
    },
    room: { roomType: "Junior Suite Ocean View", boardType: "All Inclusive" },
    flights: {
      outbound: ba_outbound("2026-06-09"),
      return:   ba_return("2026-06-16"),
    },
    price: { perPerson: 1499, total: 2998, currency: "GBP" },
    rateCalendar: makeRateCalendar(1499),
  },

  // pkg_c006 — stays as cache
  {
    packageId: "pkg_c006",
    sourceMode: "cache",
    deduplicationKey: "giata006_BA2491_BA2492_2026-04-14",
    hotel: {
      giataId: "giata006",
      name: "Secrets The Vine Cancún",
      category: 5,
      mainImage: "https://loremflickr.com/800/500/cancun,rooftop,pool,swim?lock=66",
      trustYou: { rating: 90, recommendationScore: 94, reviewCount: 1203 },
      amenities: ["Adults only", "Rooftop pool", "4 restaurants", "Spa", "Swim-up rooms"],
      location: "Hotel Zone, Cancún",
    },
    room: { roomType: "Preferred Club Junior Suite", boardType: "All Inclusive" },
    flights: {
      outbound: ba_outbound("2026-04-14"),
      return:   ba_return("2026-04-21"),
    },
    price: { perPerson: 1249, total: 2498, currency: "GBP" },
    rateCalendar: makeRateCalendar(1249),
  },
];
