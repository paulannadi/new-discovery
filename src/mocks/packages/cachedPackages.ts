// ─────────────────────────────────────────────────────────────────────────────
// Cached Packages Mock Data
//
// These represent packages that were pre-built by the TripCache service.
// They arrive almost instantly (200ms simulated delay) and include a
// rateCalendar so users can explore different departure dates in the modal.
//
// Each package now includes:
//   - destinationCode: matches a code in DESTINATIONS — used to filter results
//     by searched destination in useUnifiedSearch
//   - hotel.lat / hotel.lng: the hotel's real-world coordinates within the
//     destination city — used to place individual hotel pins on the map
//
// Deduplication key format: `${giataId}_${outboundFlight}_${returnFlight}_${departureDate}`
// ─────────────────────────────────────────────────────────────────────────────

import { addDays, format } from 'date-fns';
import { UnifiedPackage } from '../../types';

// ── Rate calendar helper ───────────────────────────────────────────────────────
// Generates a price for EVERY day in March–May 2026 so the calendar looks
// like a real price-per-day holiday grid (similar to TUI / jet2holidays).
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

  const entries: { departureDate: string; pricePerPerson: number; available: boolean }[] = [];
  const startDate = new Date(2026, 2, 1);  // March 1
  const totalDays = 92;                    // March + April + May

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(startDate, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const weekendPremium = isWeekend ? Math.round(basePricePerPerson * 0.08) : 0;
    const wave = Math.round(Math.sin(date.getDate() * 0.65) * 35);
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

// ─────────────────────────────────────────────────────────────────────────────
// ── CANCÚN flight helpers (LHR → CUN) ────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

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
  arrivalTime: `${returnDate}T09:00:00Z`,
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

// ─────────────────────────────────────────────────────────────────────────────
// ── DUBAI flight helpers (LHR → DXB) ─────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const ek_dxb_outbound = (departureDate: string) => ({
  carrier: "Emirates",
  flightNumber: "EK003",
  departureAirport: "LHR",
  arrivalAirport: "DXB",
  departureTime: `${departureDate}T14:30:00Z`,
  arrivalTime: `${departureDate}T01:30:00Z`, // next day
  durationMinutes: 420,
});

const ek_dxb_return = (returnDate: string) => ({
  carrier: "Emirates",
  flightNumber: "EK004",
  departureAirport: "DXB",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T08:20:00Z`,
  arrivalTime: `${returnDate}T13:05:00Z`,
  durationMinutes: 465,
});

const ba_dxb_outbound = (departureDate: string) => ({
  carrier: "British Airways",
  flightNumber: "BA107",
  departureAirport: "LHR",
  arrivalAirport: "DXB",
  departureTime: `${departureDate}T08:00:00Z`,
  arrivalTime: `${departureDate}T19:10:00Z`,
  durationMinutes: 430,
});

const ba_dxb_return = (returnDate: string) => ({
  carrier: "British Airways",
  flightNumber: "BA108",
  departureAirport: "DXB",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T22:30:00Z`,
  arrivalTime: `${returnDate}T03:20:00Z`, // next day
  durationMinutes: 470,
});

// ─────────────────────────────────────────────────────────────────────────────
// ── BALI flight helpers (LHR → DPS, via Singapore) ───────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const sq_bali_outbound = (departureDate: string) => ({
  carrier: "Singapore Airlines",
  flightNumber: "SQ322",
  departureAirport: "LHR",
  arrivalAirport: "DPS",
  departureTime: `${departureDate}T21:30:00Z`,
  arrivalTime: `${departureDate}T18:50:00Z`, // +2 days
  durationMinutes: 920,
});

const sq_bali_return = (returnDate: string) => ({
  carrier: "Singapore Airlines",
  flightNumber: "SQ323",
  departureAirport: "DPS",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T10:00:00Z`,
  arrivalTime: `${returnDate}T05:30:00Z`, // +1 day
  durationMinutes: 870,
});

const ek_bali_outbound = (departureDate: string) => ({
  carrier: "Emirates",
  flightNumber: "EK433",
  departureAirport: "LHR",
  arrivalAirport: "DPS",
  departureTime: `${departureDate}T22:00:00Z`,
  arrivalTime: `${departureDate}T22:40:00Z`, // +2 days
  durationMinutes: 950,
});

const ek_bali_return = (returnDate: string) => ({
  carrier: "Emirates",
  flightNumber: "EK434",
  departureAirport: "DPS",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T08:30:00Z`,
  arrivalTime: `${returnDate}T03:10:00Z`, // +1 day
  durationMinutes: 910,
});

// ─────────────────────────────────────────────────────────────────────────────
// ── TENERIFE flight helpers (LHR → TFS) ──────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const tui_tfs_outbound = (departureDate: string) => ({
  carrier: "TUI Airways",
  flightNumber: "TOM131",
  departureAirport: "LHR",
  arrivalAirport: "TFS",
  departureTime: `${departureDate}T06:00:00Z`,
  arrivalTime: `${departureDate}T10:30:00Z`,
  durationMinutes: 270,
});

const tui_tfs_return = (returnDate: string) => ({
  carrier: "TUI Airways",
  flightNumber: "TOM132",
  departureAirport: "TFS",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T11:30:00Z`,
  arrivalTime: `${returnDate}T16:00:00Z`,
  durationMinutes: 270,
});

const ezy_tfs_outbound = (departureDate: string) => ({
  carrier: "easyJet",
  flightNumber: "EZY3231",
  departureAirport: "LHR",
  arrivalAirport: "TFS",
  departureTime: `${departureDate}T07:30:00Z`,
  arrivalTime: `${departureDate}T12:00:00Z`,
  durationMinutes: 270,
});

const ezy_tfs_return = (returnDate: string) => ({
  carrier: "easyJet",
  flightNumber: "EZY3232",
  departureAirport: "TFS",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T13:00:00Z`,
  arrivalTime: `${returnDate}T17:30:00Z`,
  durationMinutes: 270,
});

// ─────────────────────────────────────────────────────────────────────────────
// ── MALLORCA flight helpers (LHR → PMI) ──────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const ezy_pmi_outbound = (departureDate: string) => ({
  carrier: "easyJet",
  flightNumber: "EZY3371",
  departureAirport: "LHR",
  arrivalAirport: "PMI",
  departureTime: `${departureDate}T06:30:00Z`,
  arrivalTime: `${departureDate}T09:00:00Z`,
  durationMinutes: 150,
});

const ezy_pmi_return = (returnDate: string) => ({
  carrier: "easyJet",
  flightNumber: "EZY3372",
  departureAirport: "PMI",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T10:00:00Z`,
  arrivalTime: `${returnDate}T12:30:00Z`,
  durationMinutes: 150,
});

const ls_pmi_outbound = (departureDate: string) => ({
  carrier: "Jet2",
  flightNumber: "LS523",
  departureAirport: "LHR",
  arrivalAirport: "PMI",
  departureTime: `${departureDate}T08:15:00Z`,
  arrivalTime: `${departureDate}T11:10:00Z`,
  durationMinutes: 175,
});

const ls_pmi_return = (returnDate: string) => ({
  carrier: "Jet2",
  flightNumber: "LS524",
  departureAirport: "PMI",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T12:20:00Z`,
  arrivalTime: `${returnDate}T15:15:00Z`,
  durationMinutes: 175,
});

// ─────────────────────────────────────────────────────────────────────────────
// ── MALDIVES flight helpers (LHR → MLE) ──────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const ek_mle_outbound = (departureDate: string) => ({
  carrier: "Emirates",
  flightNumber: "EK661",
  departureAirport: "LHR",
  arrivalAirport: "MLE",
  departureTime: `${departureDate}T21:30:00Z`,
  arrivalTime: `${departureDate}T14:30:00Z`, // +1 day
  durationMinutes: 570,
});

const ek_mle_return = (returnDate: string) => ({
  carrier: "Emirates",
  flightNumber: "EK662",
  departureAirport: "MLE",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T15:45:00Z`,
  arrivalTime: `${returnDate}T22:35:00Z`,
  durationMinutes: 530,
});

// ─────────────────────────────────────────────────────────────────────────────
// ── ORLANDO flight helpers (LHR → MCO) ───────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const vs_mco_outbound = (departureDate: string) => ({
  carrier: "Virgin Atlantic",
  flightNumber: "VS15",
  departureAirport: "LHR",
  arrivalAirport: "MCO",
  departureTime: `${departureDate}T10:00:00Z`,
  arrivalTime: `${departureDate}T14:45:00Z`,
  durationMinutes: 555,
});

const vs_mco_return = (returnDate: string) => ({
  carrier: "Virgin Atlantic",
  flightNumber: "VS16",
  departureAirport: "MCO",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T18:00:00Z`,
  arrivalTime: `${returnDate}T06:30:00Z`, // +1 day
  durationMinutes: 510,
});

const ba_mco_outbound = (departureDate: string) => ({
  carrier: "British Airways",
  flightNumber: "BA2031",
  departureAirport: "LHR",
  arrivalAirport: "MCO",
  departureTime: `${departureDate}T11:30:00Z`,
  arrivalTime: `${departureDate}T16:45:00Z`,
  durationMinutes: 555,
});

const ba_mco_return = (returnDate: string) => ({
  carrier: "British Airways",
  flightNumber: "BA2032",
  departureAirport: "MCO",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T20:30:00Z`,
  arrivalTime: `${returnDate}T08:45:00Z`, // +1 day
  durationMinutes: 495,
});

// ─────────────────────────────────────────────────────────────────────────────
// ── LOS ANGELES flight helpers (LHR → LAX) ───────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const ba_lax_outbound = (departureDate: string) => ({
  carrier: "British Airways",
  flightNumber: "BA269",
  departureAirport: "LHR",
  arrivalAirport: "LAX",
  departureTime: `${departureDate}T11:00:00Z`,
  arrivalTime: `${departureDate}T14:00:00Z`,
  durationMinutes: 660,
});

const ba_lax_return = (returnDate: string) => ({
  carrier: "British Airways",
  flightNumber: "BA270",
  departureAirport: "LAX",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T19:45:00Z`,
  arrivalTime: `${returnDate}T14:55:00Z`, // +1 day
  durationMinutes: 610,
});

const vs_lax_outbound = (departureDate: string) => ({
  carrier: "Virgin Atlantic",
  flightNumber: "VS7",
  departureAirport: "LHR",
  arrivalAirport: "LAX",
  departureTime: `${departureDate}T12:00:00Z`,
  arrivalTime: `${departureDate}T14:50:00Z`,
  durationMinutes: 650,
});

const vs_lax_return = (returnDate: string) => ({
  carrier: "Virgin Atlantic",
  flightNumber: "VS8",
  departureAirport: "LAX",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T18:00:00Z`,
  arrivalTime: `${returnDate}T13:00:00Z`, // +1 day
  durationMinutes: 600,
});

// ─────────────────────────────────────────────────────────────────────────────
// ── LANZAROTE flight helpers (LHR → ACE) ─────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const ezy_ace_outbound = (departureDate: string) => ({
  carrier: "easyJet",
  flightNumber: "EZY4051",
  departureAirport: "LHR",
  arrivalAirport: "ACE",
  departureTime: `${departureDate}T07:00:00Z`,
  arrivalTime: `${departureDate}T11:15:00Z`,
  durationMinutes: 255,
});

const ezy_ace_return = (returnDate: string) => ({
  carrier: "easyJet",
  flightNumber: "EZY4052",
  departureAirport: "ACE",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T12:30:00Z`,
  arrivalTime: `${returnDate}T16:45:00Z`,
  durationMinutes: 255,
});

const tui_ace_outbound = (departureDate: string) => ({
  carrier: "TUI Airways",
  flightNumber: "TOM285",
  departureAirport: "LHR",
  arrivalAirport: "ACE",
  departureTime: `${departureDate}T09:30:00Z`,
  arrivalTime: `${departureDate}T14:00:00Z`,
  durationMinutes: 270,
});

const tui_ace_return = (returnDate: string) => ({
  carrier: "TUI Airways",
  flightNumber: "TOM286",
  departureAirport: "ACE",
  arrivalAirport: "LHR",
  departureTime: `${returnDate}T15:00:00Z`,
  arrivalTime: `${returnDate}T19:30:00Z`,
  durationMinutes: 270,
});

// ─────────────────────────────────────────────────────────────────────────────
// ── Package data ───────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export const CACHED_PACKAGES: UnifiedPackage[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // CANCÚN — Hotel Zone, Mexico
  // ══════════════════════════════════════════════════════════════════════════

  // pkg_c001 — will be REPLACED by live package pkg_l001 (same dedup key)
  {
    packageId: "pkg_c001",
    destinationCode: "CANCUN",
    sourceMode: "cache",
    deduplicationKey: "giata001_BA2491_BA2492_2026-04-28",
    hotel: {
      giataId: "giata001",
      name: "Hotel Krystal Grand Cancún",
      category: 4,
      mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      trustYou: { rating: 82, recommendationScore: 88, reviewCount: 1847 },
      amenities: ["Beachfront", "Outdoor pool", "Spa", "All-day dining", "Kids club"],
      location: "Hotel Zone, Cancún",
      lat: 21.138, lng: -86.832,
    },
    room: { roomType: "Superior Oceanview Room", boardType: "All Inclusive" },
    flights: {
      outbound: ba_outbound("2026-04-28"),
      return:   ba_return("2026-05-05"),
    },
    price: { perPerson: 849, total: 1698, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(849),
  },

  // pkg_c002 — stays as cache
  {
    packageId: "pkg_c002",
    destinationCode: "CANCUN",
    sourceMode: "cache",
    deduplicationKey: "giata002_BA2491_BA2492_2026-05-05",
    hotel: {
      giataId: "giata002",
      name: "Fiesta Americana Grand Coral Beach",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      trustYou: { rating: 91, recommendationScore: 95, reviewCount: 2341 },
      amenities: ["Private beach", "5 pools", "Luxury spa", "6 restaurants", "Adults-only pool"],
      location: "Punta Cancún, Hotel Zone",
      lat: 21.145, lng: -86.843,
    },
    room: { roomType: "Grand Club Oceanfront Suite", boardType: "Breakfast Included" },
    flights: {
      outbound: ba_outbound("2026-05-05"),
      return:   ba_return("2026-05-12"),
    },
    price: { perPerson: 1199, total: 2398, currency: "GBP" },
    tripType: "individual-tour",
    rateCalendar: makeRateCalendar(1199),
  },

  // pkg_c003 — will be REPLACED by live package pkg_l002 (same dedup key)
  {
    packageId: "pkg_c003",
    destinationCode: "CANCUN",
    sourceMode: "cache",
    deduplicationKey: "giata003_VS113_VS114_2026-04-21",
    hotel: {
      giataId: "giata003",
      name: "Moon Palace Golf & Spa Resort",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      trustYou: { rating: 89, recommendationScore: 93, reviewCount: 3102 },
      amenities: ["Golf course", "Multiple pools", "Luxury spa", "10 restaurants", "Water park"],
      location: "South Hotel Zone, Cancún",
      lat: 21.075, lng: -86.806,
    },
    room: { roomType: "Deluxe Suite Ocean View", boardType: "All Inclusive" },
    flights: {
      outbound: vs_outbound("2026-04-21"),
      return:   vs_return("2026-04-28"),
    },
    price: { perPerson: 1099, total: 2198, currency: "GBP" },
    tripType: "round-trip",
    rateCalendar: makeRateCalendar(1099),
  },

  // pkg_c004 — stays as cache
  {
    packageId: "pkg_c004",
    destinationCode: "CANCUN",
    sourceMode: "cache",
    deduplicationKey: "giata004_VS113_VS114_2026-05-12",
    hotel: {
      giataId: "giata004",
      name: "Hyatt Ziva Cancún",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      trustYou: { rating: 93, recommendationScore: 97, reviewCount: 1654 },
      amenities: ["3 pools", "Private beach", "Swim-up bar", "Rooftop terrace", "Kids club"],
      location: "Punta Cancún, Hotel Zone",
      lat: 21.148, lng: -86.847,
    },
    room: { roomType: "King Club Ocean View", boardType: "All Inclusive" },
    flights: {
      outbound: vs_outbound("2026-05-12"),
      return:   vs_return("2026-05-19"),
    },
    price: { perPerson: 1349, total: 2698, currency: "GBP" },
    tripType: "group-tour",
    rateCalendar: makeRateCalendar(1349),
  },

  // pkg_c005 — stays as cache
  {
    packageId: "pkg_c005",
    destinationCode: "CANCUN",
    sourceMode: "cache",
    deduplicationKey: "giata005_BA2491_BA2492_2026-06-09",
    hotel: {
      giataId: "giata005",
      name: "Live Aqua Beach Resort Cancún",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      trustYou: { rating: 88, recommendationScore: 92, reviewCount: 987 },
      amenities: ["Adults only", "Boutique hotel", "Spa & wellness", "Gourmet dining", "Private beach"],
      location: "Hotel Zone, Cancún",
      lat: 21.130, lng: -86.824,
    },
    room: { roomType: "Junior Suite Ocean View", boardType: "All Inclusive" },
    flights: {
      outbound: ba_outbound("2026-06-09"),
      return:   ba_return("2026-06-16"),
    },
    price: { perPerson: 1499, total: 2998, currency: "GBP" },
    tripType: "last-minute",
    rateCalendar: makeRateCalendar(1499),
  },

  // pkg_c006 — stays as cache
  {
    packageId: "pkg_c006",
    destinationCode: "CANCUN",
    sourceMode: "cache",
    deduplicationKey: "giata006_BA2491_BA2492_2026-04-14",
    hotel: {
      giataId: "giata006",
      name: "Secrets The Vine Cancún",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      trustYou: { rating: 90, recommendationScore: 94, reviewCount: 1203 },
      amenities: ["Adults only", "Rooftop pool", "4 restaurants", "Spa", "Swim-up rooms"],
      location: "Hotel Zone, Cancún",
      lat: 21.122, lng: -86.818,
    },
    room: { roomType: "Preferred Club Junior Suite", boardType: "All Inclusive" },
    flights: {
      outbound: ba_outbound("2026-04-14"),
      return:   ba_return("2026-04-21"),
    },
    price: { perPerson: 1249, total: 2498, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(1249),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DUBAI — United Arab Emirates
  // ══════════════════════════════════════════════════════════════════════════

  {
    packageId: "pkg_d001",
    destinationCode: "DUBAI",
    sourceMode: "cache",
    deduplicationKey: "giata007_EK003_EK004_2026-04-15",
    hotel: {
      giataId: "giata007",
      name: "Atlantis The Palm",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
      trustYou: { rating: 90, recommendationScore: 94, reviewCount: 4201 },
      amenities: ["Aquaventure Waterpark", "Private beach", "17 restaurants", "Dolphin Bay", "Aquarium"],
      location: "Palm Jumeirah, Dubai",
      lat: 25.130, lng: 55.117,
    },
    room: { roomType: "King Room Ocean View", boardType: "Breakfast Included" },
    flights: {
      outbound: ek_dxb_outbound("2026-04-15"),
      return:   ek_dxb_return("2026-04-22"),
    },
    price: { perPerson: 1449, total: 2898, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(1449),
  },

  {
    packageId: "pkg_d002",
    destinationCode: "DUBAI",
    sourceMode: "cache",
    deduplicationKey: "giata008_BA107_BA108_2026-04-22",
    hotel: {
      giataId: "giata008",
      name: "Burj Al Arab Jumeirah",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1590073844006-33379778ae09?w=800&q=80",
      trustYou: { rating: 97, recommendationScore: 99, reviewCount: 2108 },
      amenities: ["Private beach", "9 restaurants", "Butler service", "Infinity pool", "Helipad"],
      location: "Jumeirah Beach, Dubai",
      lat: 25.141, lng: 55.185,
    },
    room: { roomType: "One Bedroom Deluxe Suite", boardType: "Breakfast Included" },
    flights: {
      outbound: ba_dxb_outbound("2026-04-22"),
      return:   ba_dxb_return("2026-04-29"),
    },
    price: { perPerson: 3199, total: 6398, currency: "GBP" },
    tripType: "individual-tour",
    rateCalendar: makeRateCalendar(3199),
  },

  {
    packageId: "pkg_d003",
    destinationCode: "DUBAI",
    sourceMode: "cache",
    deduplicationKey: "giata009_EK003_EK004_2026-05-06",
    hotel: {
      giataId: "giata009",
      name: "Address Downtown Dubai",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1545579133-99bb5ad189be?w=800&q=80",
      trustYou: { rating: 93, recommendationScore: 96, reviewCount: 3412 },
      amenities: ["Burj Khalifa views", "Infinity pool", "Luxury spa", "6 restaurants", "Dubai Mall access"],
      location: "Downtown Dubai",
      lat: 25.194, lng: 55.279,
    },
    room: { roomType: "Suite Burj Khalifa View", boardType: "Room Only" },
    flights: {
      outbound: ek_dxb_outbound("2026-05-06"),
      return:   ek_dxb_return("2026-05-13"),
    },
    price: { perPerson: 1799, total: 3598, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(1799),
  },

  {
    packageId: "pkg_d004",
    destinationCode: "DUBAI",
    sourceMode: "cache",
    deduplicationKey: "giata010_BA107_BA108_2026-05-13",
    hotel: {
      giataId: "giata010",
      name: "Jumeirah Beach Hotel",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      trustYou: { rating: 88, recommendationScore: 92, reviewCount: 5134 },
      amenities: ["Private beach", "Wild Wadi Waterpark", "21 restaurants", "Outdoor pool", "Watersports"],
      location: "Jumeirah Beach Road, Dubai",
      lat: 25.147, lng: 55.192,
    },
    room: { roomType: "Superior Ocean Room", boardType: "Half Board" },
    flights: {
      outbound: ba_dxb_outbound("2026-05-13"),
      return:   ba_dxb_return("2026-05-20"),
    },
    price: { perPerson: 1299, total: 2598, currency: "GBP" },
    tripType: "round-trip",
    rateCalendar: makeRateCalendar(1299),
  },

  {
    packageId: "pkg_d005",
    destinationCode: "DUBAI",
    sourceMode: "cache",
    deduplicationKey: "giata011_EK003_EK004_2026-04-08",
    hotel: {
      giataId: "giata011",
      name: "Caesars Resort Dubai",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1582610116397-edb72270f707?w=800&q=80",
      trustYou: { rating: 85, recommendationScore: 89, reviewCount: 1876 },
      amenities: ["Bluewaters Island", "7 pools", "Spa", "5 restaurants", "Direct beach"],
      location: "Bluewaters Island, Dubai",
      lat: 25.088, lng: 55.124,
    },
    room: { roomType: "Palace Junior Suite", boardType: "All Inclusive" },
    flights: {
      outbound: ek_dxb_outbound("2026-04-08"),
      return:   ek_dxb_return("2026-04-15"),
    },
    price: { perPerson: 1149, total: 2298, currency: "GBP" },
    tripType: "last-minute",
    rateCalendar: makeRateCalendar(1149),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BALI — Indonesia
  // ══════════════════════════════════════════════════════════════════════════

  {
    packageId: "pkg_b001",
    destinationCode: "BALI",
    sourceMode: "cache",
    deduplicationKey: "giata012_SQ322_SQ323_2026-04-10",
    hotel: {
      giataId: "giata012",
      name: "Four Seasons Resort Bali at Sayan",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
      trustYou: { rating: 96, recommendationScore: 98, reviewCount: 1122 },
      amenities: ["Ubud jungle setting", "River pool", "Yoga pavilion", "Butler service", "Ayurvedic spa"],
      location: "Sayan, Ubud, Bali",
      lat: -8.518, lng: 115.256,
    },
    room: { roomType: "One-Bedroom Villa", boardType: "Breakfast Included" },
    flights: {
      outbound: sq_bali_outbound("2026-04-10"),
      return:   sq_bali_return("2026-04-24"),
    },
    price: { perPerson: 2899, total: 5798, currency: "GBP" },
    tripType: "individual-tour",
    rateCalendar: makeRateCalendar(2899),
  },

  {
    packageId: "pkg_b002",
    destinationCode: "BALI",
    sourceMode: "cache",
    deduplicationKey: "giata013_EK433_EK434_2026-04-17",
    hotel: {
      giataId: "giata013",
      name: "The Legian Seminyak",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1559628233-100c798642d1?w=800&q=80",
      trustYou: { rating: 91, recommendationScore: 95, reviewCount: 1634 },
      amenities: ["Beachfront", "Infinity pool", "Spa", "3 restaurants", "Sundeck"],
      location: "Seminyak Beach, Bali",
      lat: -8.693, lng: 115.160,
    },
    room: { roomType: "One Bedroom Suite", boardType: "Breakfast Included" },
    flights: {
      outbound: ek_bali_outbound("2026-04-17"),
      return:   ek_bali_return("2026-05-01"),
    },
    price: { perPerson: 2199, total: 4398, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(2199),
  },

  {
    packageId: "pkg_b003",
    destinationCode: "BALI",
    sourceMode: "cache",
    deduplicationKey: "giata014_SQ322_SQ323_2026-05-01",
    hotel: {
      giataId: "giata014",
      name: "COMO Shambhala Estate",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80",
      trustYou: { rating: 94, recommendationScore: 97, reviewCount: 876 },
      amenities: ["Wellness retreat", "Organic cuisine", "Yoga & meditation", "Natural pools", "Jungle trails"],
      location: "Payangan, Ubud, Bali",
      lat: -8.471, lng: 115.246,
    },
    room: { roomType: "Estate Room", boardType: "Half Board" },
    flights: {
      outbound: sq_bali_outbound("2026-05-01"),
      return:   sq_bali_return("2026-05-15"),
    },
    price: { perPerson: 3499, total: 6998, currency: "GBP" },
    tripType: "round-trip",
    rateCalendar: makeRateCalendar(3499),
  },

  {
    packageId: "pkg_b004",
    destinationCode: "BALI",
    sourceMode: "cache",
    deduplicationKey: "giata015_EK433_EK434_2026-04-24",
    hotel: {
      giataId: "giata015",
      name: "Mulia Resort Nusa Dua",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800&q=80",
      trustYou: { rating: 92, recommendationScore: 95, reviewCount: 2341 },
      amenities: ["1.5km private beach", "6 pools", "Luxury spa", "8 restaurants", "Waterpark"],
      location: "Nusa Dua, Bali",
      lat: -8.796, lng: 115.228,
    },
    room: { roomType: "Ocean Suite", boardType: "All Inclusive" },
    flights: {
      outbound: ek_bali_outbound("2026-04-24"),
      return:   ek_bali_return("2026-05-08"),
    },
    price: { perPerson: 1899, total: 3798, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(1899),
  },

  {
    packageId: "pkg_b005",
    destinationCode: "BALI",
    sourceMode: "cache",
    deduplicationKey: "giata016_SQ322_SQ323_2026-03-27",
    hotel: {
      giataId: "giata016",
      name: "Alila Villas Uluwatu",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1508009603885-50cf7c079365?w=800&q=80",
      trustYou: { rating: 95, recommendationScore: 98, reviewCount: 987 },
      amenities: ["Clifftop infinity pool", "Private pool villas", "Spa", "Organic gardens", "Surf access"],
      location: "Uluwatu, South Bali",
      lat: -8.826, lng: 115.086,
    },
    room: { roomType: "Villa with Private Pool", boardType: "Breakfast Included" },
    flights: {
      outbound: sq_bali_outbound("2026-03-27"),
      return:   sq_bali_return("2026-04-10"),
    },
    price: { perPerson: 2599, total: 5198, currency: "GBP" },
    tripType: "group-tour",
    rateCalendar: makeRateCalendar(2599),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TENERIFE — Canary Islands, Spain
  // ══════════════════════════════════════════════════════════════════════════

  {
    packageId: "pkg_t001",
    destinationCode: "TENERIFE",
    sourceMode: "cache",
    deduplicationKey: "giata017_TOM131_TOM132_2026-04-11",
    hotel: {
      giataId: "giata017",
      name: "Gran Meliá Palacio de Isora",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      trustYou: { rating: 92, recommendationScore: 95, reviewCount: 3102 },
      amenities: ["Europe's longest freshwater pool", "Private lido", "7 restaurants", "Spa", "Kids club"],
      location: "Alcalá, Costa Adeje, Tenerife",
      lat: 28.108, lng: -16.780,
    },
    room: { roomType: "Junior Suite Sea View", boardType: "Half Board" },
    flights: {
      outbound: tui_tfs_outbound("2026-04-11"),
      return:   tui_tfs_return("2026-04-18"),
    },
    price: { perPerson: 899, total: 1798, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(899),
  },

  {
    packageId: "pkg_t002",
    destinationCode: "TENERIFE",
    sourceMode: "cache",
    deduplicationKey: "giata018_EZY3231_EZY3232_2026-04-18",
    hotel: {
      giataId: "giata018",
      name: "Hard Rock Hotel Tenerife",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      trustYou: { rating: 89, recommendationScore: 93, reviewCount: 4521 },
      amenities: ["Rock Spa", "3 pools", "5 restaurants", "Music studio", "Adults pool"],
      location: "Playa Paraíso, Costa Adeje, Tenerife",
      lat: 28.121, lng: -16.764,
    },
    room: { roomType: "Platinum King Room Sea View", boardType: "All Inclusive" },
    flights: {
      outbound: ezy_tfs_outbound("2026-04-18"),
      return:   ezy_tfs_return("2026-04-25"),
    },
    price: { perPerson: 1149, total: 2298, currency: "GBP" },
    tripType: "round-trip",
    rateCalendar: makeRateCalendar(1149),
  },

  {
    packageId: "pkg_t003",
    destinationCode: "TENERIFE",
    sourceMode: "cache",
    deduplicationKey: "giata019_TOM131_TOM132_2026-05-09",
    hotel: {
      giataId: "giata019",
      name: "Bahía del Duque Resort",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1540541338537-0c3e8a6a3e05?w=800&q=80",
      trustYou: { rating: 94, recommendationScore: 97, reviewCount: 1876 },
      amenities: ["Private beach club", "6 pools", "Thalasso spa", "11 restaurants", "Tennis"],
      location: "Costa Adeje, Tenerife",
      lat: 28.095, lng: -16.749,
    },
    room: { roomType: "Garden Villa Suite", boardType: "Breakfast Included" },
    flights: {
      outbound: tui_tfs_outbound("2026-05-09"),
      return:   tui_tfs_return("2026-05-16"),
    },
    price: { perPerson: 1299, total: 2598, currency: "GBP" },
    tripType: "individual-tour",
    rateCalendar: makeRateCalendar(1299),
  },

  {
    packageId: "pkg_t004",
    destinationCode: "TENERIFE",
    sourceMode: "cache",
    deduplicationKey: "giata020_EZY3231_EZY3232_2026-04-04",
    hotel: {
      giataId: "giata020",
      name: "Iberostar Selection Sábila",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      trustYou: { rating: 87, recommendationScore: 91, reviewCount: 2654 },
      amenities: ["Adults only", "Infinity pool", "Spa", "4 restaurants", "Sunset views"],
      location: "Fanabé, Costa Adeje, Tenerife",
      lat: 28.086, lng: -16.742,
    },
    room: { roomType: "Premium Double Sea View", boardType: "All Inclusive" },
    flights: {
      outbound: ezy_tfs_outbound("2026-04-04"),
      return:   ezy_tfs_return("2026-04-11"),
    },
    price: { perPerson: 799, total: 1598, currency: "GBP" },
    tripType: "last-minute",
    rateCalendar: makeRateCalendar(799),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MALLORCA — Balearic Islands, Spain
  // ══════════════════════════════════════════════════════════════════════════

  {
    packageId: "pkg_m001",
    destinationCode: "MALLORCA",
    sourceMode: "cache",
    deduplicationKey: "giata021_EZY3371_EZY3372_2026-04-25",
    hotel: {
      giataId: "giata021",
      name: "Park Hyatt Mallorca",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      trustYou: { rating: 93, recommendationScore: 96, reviewCount: 1122 },
      amenities: ["Private cove", "5 pools", "Spa & wellbeing", "5 restaurants", "Tennis"],
      location: "Canyamel, North-East Mallorca",
      lat: 39.741, lng: 3.437,
    },
    room: { roomType: "King Deluxe Room Garden View", boardType: "Breakfast Included" },
    flights: {
      outbound: ezy_pmi_outbound("2026-04-25"),
      return:   ezy_pmi_return("2026-05-02"),
    },
    price: { perPerson: 1199, total: 2398, currency: "GBP" },
    tripType: "individual-tour",
    rateCalendar: makeRateCalendar(1199),
  },

  {
    packageId: "pkg_m002",
    destinationCode: "MALLORCA",
    sourceMode: "cache",
    deduplicationKey: "giata022_LS523_LS524_2026-05-02",
    hotel: {
      giataId: "giata022",
      name: "Jumeirah Port Soller Hotel & Spa",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1582610116397-edb72270f707?w=800&q=80",
      trustYou: { rating: 95, recommendationScore: 97, reviewCount: 876 },
      amenities: ["Cliffside infinity pools", "Talise Spa", "3 restaurants", "Private pier", "Mediterranean views"],
      location: "Port de Sóller, Mallorca",
      lat: 39.795, lng: 2.686,
    },
    room: { roomType: "Deluxe Sea View Room", boardType: "Breakfast Included" },
    flights: {
      outbound: ls_pmi_outbound("2026-05-02"),
      return:   ls_pmi_return("2026-05-09"),
    },
    price: { perPerson: 1549, total: 3098, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(1549),
  },

  {
    packageId: "pkg_m003",
    destinationCode: "MALLORCA",
    sourceMode: "cache",
    deduplicationKey: "giata023_EZY3371_EZY3372_2026-04-18",
    hotel: {
      giataId: "giata023",
      name: "Melbeach Hotel & Spa",
      category: 4,
      mainImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      trustYou: { rating: 88, recommendationScore: 92, reviewCount: 1341 },
      amenities: ["Adults only", "Sea views", "Infinity pool", "Spa", "Gourmet restaurant"],
      location: "Cala Millor, Mallorca",
      lat: 39.594, lng: 3.384,
    },
    room: { roomType: "Superior Double Sea View", boardType: "All Inclusive" },
    flights: {
      outbound: ezy_pmi_outbound("2026-04-18"),
      return:   ezy_pmi_return("2026-04-25"),
    },
    price: { perPerson: 849, total: 1698, currency: "GBP" },
    tripType: "round-trip",
    rateCalendar: makeRateCalendar(849),
  },

  {
    packageId: "pkg_m004",
    destinationCode: "MALLORCA",
    sourceMode: "cache",
    deduplicationKey: "giata024_LS523_LS524_2026-05-16",
    hotel: {
      giataId: "giata024",
      name: "Bless Hotel Ibiza (Mallorca Sister)",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      trustYou: { rating: 90, recommendationScore: 93, reviewCount: 987 },
      amenities: ["Rooftop pool bar", "Beach club", "Spa", "3 restaurants", "Fitness centre"],
      location: "Palma de Mallorca",
      lat: 39.566, lng: 2.643,
    },
    room: { roomType: "Deluxe Junior Suite Pool View", boardType: "Room Only" },
    flights: {
      outbound: ls_pmi_outbound("2026-05-16"),
      return:   ls_pmi_return("2026-05-23"),
    },
    price: { perPerson: 699, total: 1398, currency: "GBP" },
    tripType: "last-minute",
    rateCalendar: makeRateCalendar(699),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MALDIVES
  // ══════════════════════════════════════════════════════════════════════════

  {
    packageId: "pkg_mv001",
    destinationCode: "MALDIVES",
    sourceMode: "cache",
    deduplicationKey: "giata025_EK661_EK662_2026-04-04",
    hotel: {
      giataId: "giata025",
      name: "Soneva Jani",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
      trustYou: { rating: 98, recommendationScore: 99, reviewCount: 654 },
      amenities: ["Overwater villas", "Retractable rooftop", "Private pool", "Observatory", "Water slide"],
      location: "Noonu Atoll, Maldives",
      lat: 5.621, lng: 73.421,
    },
    room: { roomType: "Water Retreat 1 Bedroom", boardType: "All Inclusive" },
    flights: {
      outbound: ek_mle_outbound("2026-04-04"),
      return:   ek_mle_return("2026-04-11"),
    },
    price: { perPerson: 5499, total: 10998, currency: "GBP" },
    tripType: "individual-tour",
    rateCalendar: makeRateCalendar(5499),
  },

  {
    packageId: "pkg_mv002",
    destinationCode: "MALDIVES",
    sourceMode: "cache",
    deduplicationKey: "giata026_EK661_EK662_2026-04-18",
    hotel: {
      giataId: "giata026",
      name: "Six Senses Laamu",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&q=80",
      trustYou: { rating: 97, recommendationScore: 99, reviewCount: 543 },
      amenities: ["Overwater spa", "Private pool", "PADI dive centre", "Yoga pavilion", "Organic gardens"],
      location: "Laamu Atoll, Maldives",
      lat: 1.829, lng: 73.560,
    },
    room: { roomType: "Water Villa with Pool", boardType: "Breakfast Included" },
    flights: {
      outbound: ek_mle_outbound("2026-04-18"),
      return:   ek_mle_return("2026-04-25"),
    },
    price: { perPerson: 4199, total: 8398, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(4199),
  },

  {
    packageId: "pkg_mv003",
    destinationCode: "MALDIVES",
    sourceMode: "cache",
    deduplicationKey: "giata027_EK661_EK662_2026-05-02",
    hotel: {
      giataId: "giata027",
      name: "Gili Lankanfushi",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80",
      trustYou: { rating: 96, recommendationScore: 98, reviewCount: 723 },
      amenities: ["Private island", "No-shoes policy", "Glass-floor villa", "Snorkelling", "Resident butler"],
      location: "North Malé Atoll, Maldives",
      lat: 4.203, lng: 73.514,
    },
    room: { roomType: "Crusoe Residence Over Water", boardType: "All Inclusive" },
    flights: {
      outbound: ek_mle_outbound("2026-05-02"),
      return:   ek_mle_return("2026-05-09"),
    },
    price: { perPerson: 3899, total: 7798, currency: "GBP" },
    tripType: "round-trip",
    rateCalendar: makeRateCalendar(3899),
  },

  {
    packageId: "pkg_mv004",
    destinationCode: "MALDIVES",
    sourceMode: "cache",
    deduplicationKey: "giata028_EK661_EK662_2026-03-21",
    hotel: {
      giataId: "giata028",
      name: "Anantara Veli Maldives Resort",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1540202404-8d0de77c3573?w=800&q=80",
      trustYou: { rating: 93, recommendationScore: 96, reviewCount: 1342 },
      amenities: ["Overwater bungalows", "Adults only", "Spa", "3 restaurants", "Dive school"],
      location: "South Malé Atoll, Maldives",
      lat: 3.759, lng: 73.394,
    },
    room: { roomType: "Over Water Bungalow", boardType: "Half Board" },
    flights: {
      outbound: ek_mle_outbound("2026-03-21"),
      return:   ek_mle_return("2026-03-28"),
    },
    price: { perPerson: 2799, total: 5598, currency: "GBP" },
    tripType: "last-minute",
    rateCalendar: makeRateCalendar(2799),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ORLANDO — Florida, USA
  // ══════════════════════════════════════════════════════════════════════════

  {
    packageId: "pkg_or001",
    destinationCode: "ORLANDO",
    sourceMode: "cache",
    deduplicationKey: "giata029_VS15_VS16_2026-04-11",
    hotel: {
      giataId: "giata029",
      name: "Disney's Grand Floridian Resort & Spa",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
      trustYou: { rating: 92, recommendationScore: 96, reviewCount: 8754 },
      amenities: ["Magic Kingdom views", "Monorail access", "Victoria & Albert's", "Pools", "Spa"],
      location: "Walt Disney World, Orlando",
      lat: 28.411, lng: -81.587,
    },
    room: { roomType: "Deluxe Room Garden View", boardType: "Room Only" },
    flights: {
      outbound: vs_mco_outbound("2026-04-11"),
      return:   vs_mco_return("2026-04-18"),
    },
    price: { perPerson: 1899, total: 3798, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(1899),
  },

  {
    packageId: "pkg_or002",
    destinationCode: "ORLANDO",
    sourceMode: "cache",
    deduplicationKey: "giata030_BA2031_BA2032_2026-04-18",
    hotel: {
      giataId: "giata030",
      name: "Loews Portofino Bay Hotel",
      category: 4,
      mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      trustYou: { rating: 88, recommendationScore: 92, reviewCount: 5231 },
      amenities: ["Universal Express Pass", "3 pools", "Italian village setting", "5 restaurants", "Spa"],
      location: "Universal Orlando, Orlando",
      lat: 28.474, lng: -81.468,
    },
    room: { roomType: "Standard King Room", boardType: "Breakfast Included" },
    flights: {
      outbound: ba_mco_outbound("2026-04-18"),
      return:   ba_mco_return("2026-04-25"),
    },
    price: { perPerson: 1399, total: 2798, currency: "GBP" },
    tripType: "group-tour",
    rateCalendar: makeRateCalendar(1399),
  },

  {
    packageId: "pkg_or003",
    destinationCode: "ORLANDO",
    sourceMode: "cache",
    deduplicationKey: "giata031_VS15_VS16_2026-05-09",
    hotel: {
      giataId: "giata031",
      name: "Waldorf Astoria Orlando",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      trustYou: { rating: 94, recommendationScore: 97, reviewCount: 2341 },
      amenities: ["Rees Jones golf course", "Waldorf Astoria Spa", "4 pools", "6 restaurants", "Disney shuttle"],
      location: "Bonnet Creek, Orlando",
      lat: 28.367, lng: -81.530,
    },
    room: { roomType: "Deluxe Resort View Room", boardType: "Room Only" },
    flights: {
      outbound: vs_mco_outbound("2026-05-09"),
      return:   vs_mco_return("2026-05-16"),
    },
    price: { perPerson: 1649, total: 3298, currency: "GBP" },
    tripType: "individual-tour",
    rateCalendar: makeRateCalendar(1649),
  },

  {
    packageId: "pkg_or004",
    destinationCode: "ORLANDO",
    sourceMode: "cache",
    deduplicationKey: "giata032_BA2031_BA2032_2026-04-04",
    hotel: {
      giataId: "giata032",
      name: "Rosen Shingle Creek",
      category: 4,
      mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      trustYou: { rating: 86, recommendationScore: 90, reviewCount: 3421 },
      amenities: ["Championship golf", "6 pools", "Spa", "7 restaurants", "On-site waterway"],
      location: "International Drive, Orlando",
      lat: 28.448, lng: -81.479,
    },
    room: { roomType: "Superior King Room", boardType: "Room Only" },
    flights: {
      outbound: ba_mco_outbound("2026-04-04"),
      return:   ba_mco_return("2026-04-11"),
    },
    price: { perPerson: 1099, total: 2198, currency: "GBP" },
    tripType: "last-minute",
    rateCalendar: makeRateCalendar(1099),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LOS ANGELES — California, USA
  // ══════════════════════════════════════════════════════════════════════════

  {
    packageId: "pkg_la001",
    destinationCode: "LOSANGELES",
    sourceMode: "cache",
    deduplicationKey: "giata033_BA269_BA270_2026-04-14",
    hotel: {
      giataId: "giata033",
      name: "Shutters on the Beach",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      trustYou: { rating: 94, recommendationScore: 97, reviewCount: 1876 },
      amenities: ["Direct beach access", "Cassis restaurant", "Spa", "Outdoor pool", "Boardwalk views"],
      location: "Santa Monica Beach, Los Angeles",
      lat: 34.008, lng: -118.500,
    },
    room: { roomType: "Ocean View King Room", boardType: "Room Only" },
    flights: {
      outbound: ba_lax_outbound("2026-04-14"),
      return:   ba_lax_return("2026-04-21"),
    },
    price: { perPerson: 2199, total: 4398, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(2199),
  },

  {
    packageId: "pkg_la002",
    destinationCode: "LOSANGELES",
    sourceMode: "cache",
    deduplicationKey: "giata034_VS7_VS8_2026-04-21",
    hotel: {
      giataId: "giata034",
      name: "The Beverly Hills Hotel",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      trustYou: { rating: 96, recommendationScore: 98, reviewCount: 1243 },
      amenities: ["Iconic pink facade", "Polo Lounge", "Private bungalows", "Pool & spa", "Celebrity history"],
      location: "Beverly Hills, Los Angeles",
      lat: 34.082, lng: -118.416,
    },
    room: { roomType: "Bungalow Suite", boardType: "Breakfast Included" },
    flights: {
      outbound: vs_lax_outbound("2026-04-21"),
      return:   vs_lax_return("2026-04-28"),
    },
    price: { perPerson: 3299, total: 6598, currency: "GBP" },
    tripType: "individual-tour",
    rateCalendar: makeRateCalendar(3299),
  },

  {
    packageId: "pkg_la003",
    destinationCode: "LOSANGELES",
    sourceMode: "cache",
    deduplicationKey: "giata035_BA269_BA270_2026-05-05",
    hotel: {
      giataId: "giata035",
      name: "Chateau Marmont",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
      trustYou: { rating: 88, recommendationScore: 91, reviewCount: 876 },
      amenities: ["Private bungalows", "Garden pool", "Bar Marmont", "Hollywood history", "Discreet service"],
      location: "Sunset Strip, West Hollywood",
      lat: 34.098, lng: -118.374,
    },
    room: { roomType: "Deluxe City View Room", boardType: "Room Only" },
    flights: {
      outbound: ba_lax_outbound("2026-05-05"),
      return:   ba_lax_return("2026-05-12"),
    },
    price: { perPerson: 1799, total: 3598, currency: "GBP" },
    tripType: "round-trip",
    rateCalendar: makeRateCalendar(1799),
  },

  {
    packageId: "pkg_la004",
    destinationCode: "LOSANGELES",
    sourceMode: "cache",
    deduplicationKey: "giata036_VS7_VS8_2026-05-12",
    hotel: {
      giataId: "giata036",
      name: "The Standard, Downtown LA",
      category: 4,
      mainImage: "https://images.unsplash.com/photo-1567958451986-2de427a4a0be?w=800&q=80",
      trustYou: { rating: 82, recommendationScore: 86, reviewCount: 2341 },
      amenities: ["Rooftop pool bar", "City views", "Gym", "2 restaurants", "Late checkout"],
      location: "Downtown Los Angeles",
      lat: 34.045, lng: -118.255,
    },
    room: { roomType: "King Room High Floor", boardType: "Room Only" },
    flights: {
      outbound: vs_lax_outbound("2026-05-12"),
      return:   vs_lax_return("2026-05-19"),
    },
    price: { perPerson: 1299, total: 2598, currency: "GBP" },
    tripType: "last-minute",
    rateCalendar: makeRateCalendar(1299),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LANZAROTE — Canary Islands, Spain
  // ══════════════════════════════════════════════════════════════════════════

  {
    packageId: "pkg_lz001",
    destinationCode: "LANZAROTE",
    sourceMode: "cache",
    deduplicationKey: "giata037_EZY4051_EZY4052_2026-04-11",
    hotel: {
      giataId: "giata037",
      name: "Princesa Yaiza Suite Hotel Resort",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800&q=80",
      trustYou: { rating: 90, recommendationScore: 94, reviewCount: 3102 },
      amenities: ["6 pools", "Kids waterpark", "Thalasso centre", "9 restaurants", "Direct beach"],
      location: "Playa Blanca, Lanzarote",
      lat: 28.866, lng: -13.832,
    },
    room: { roomType: "Junior Suite Garden View", boardType: "Half Board" },
    flights: {
      outbound: ezy_ace_outbound("2026-04-11"),
      return:   ezy_ace_return("2026-04-18"),
    },
    price: { perPerson: 799, total: 1598, currency: "GBP" },
    tripType: "hotel-flight",
    rateCalendar: makeRateCalendar(799),
  },

  {
    packageId: "pkg_lz002",
    destinationCode: "LANZAROTE",
    sourceMode: "cache",
    deduplicationKey: "giata038_TOM285_TOM286_2026-04-25",
    hotel: {
      giataId: "giata038",
      name: "Hesperia Lanzarote",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1540541338537-0c3e8a6a3e05?w=800&q=80",
      trustYou: { rating: 87, recommendationScore: 91, reviewCount: 2134 },
      amenities: ["Volcanic landscape views", "Infinity pool", "Spa", "4 restaurants", "Adults only"],
      location: "Puerto Calero, Lanzarote",
      lat: 28.921, lng: -13.660,
    },
    room: { roomType: "Suite Sea View", boardType: "All Inclusive" },
    flights: {
      outbound: tui_ace_outbound("2026-04-25"),
      return:   tui_ace_return("2026-05-02"),
    },
    price: { perPerson: 999, total: 1998, currency: "GBP" },
    tripType: "round-trip",
    rateCalendar: makeRateCalendar(999),
  },

  {
    packageId: "pkg_lz003",
    destinationCode: "LANZAROTE",
    sourceMode: "cache",
    deduplicationKey: "giata039_EZY4051_EZY4052_2026-05-09",
    hotel: {
      giataId: "giata039",
      name: "Gran Meliá Palacio de Isora Lanzarote",
      category: 4,
      mainImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      trustYou: { rating: 85, recommendationScore: 89, reviewCount: 1543 },
      amenities: ["Beachfront", "3 pools", "Spa", "3 restaurants", "Watersports"],
      location: "Costa Teguise, Lanzarote",
      lat: 29.061, lng: -13.524,
    },
    room: { roomType: "Classic Double Sea View", boardType: "All Inclusive" },
    flights: {
      outbound: ezy_ace_outbound("2026-05-09"),
      return:   ezy_ace_return("2026-05-16"),
    },
    price: { perPerson: 699, total: 1398, currency: "GBP" },
    tripType: "group-tour",
    rateCalendar: makeRateCalendar(699),
  },

  {
    packageId: "pkg_lz004",
    destinationCode: "LANZAROTE",
    sourceMode: "cache",
    deduplicationKey: "giata040_TOM285_TOM286_2026-04-04",
    hotel: {
      giataId: "giata040",
      name: "Sandos Papagayo Beach Resort",
      category: 4,
      mainImage: "https://images.unsplash.com/photo-1582610116397-edb72270f707?w=800&q=80",
      trustYou: { rating: 83, recommendationScore: 87, reviewCount: 4321 },
      amenities: ["Natural reserve beach", "4 pools", "Mini club", "5 restaurants", "Eco-friendly"],
      location: "Playa Blanca, Lanzarote",
      lat: 28.857, lng: -13.816,
    },
    room: { roomType: "Deluxe Double Pool View", boardType: "All Inclusive" },
    flights: {
      outbound: tui_ace_outbound("2026-04-04"),
      return:   tui_ace_return("2026-04-11"),
    },
    price: { perPerson: 649, total: 1298, currency: "GBP" },
    tripType: "last-minute",
    rateCalendar: makeRateCalendar(649),
  },
];
