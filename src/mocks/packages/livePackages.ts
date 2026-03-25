// ─────────────────────────────────────────────────────────────────────────────
// Live Packages Mock Data
//
// These represent packages returned by live supplier queries (not cached).
// They arrive in two batches during the simulated SSE stream.
//
// DEDUPLICATION DEMO:
//   pkg_l001 shares deduplicationKey with CACHED pkg_c001 (same hotel + flight)
//   → it will REPLACE pkg_c001 in place when live results arrive at t=3.5s.
//   → The price is lower (£819 vs £849) — the card visibly "updates".
//
//   pkg_l002 shares deduplicationKey with CACHED pkg_c003 (Moon Palace + VS)
//   → it will REPLACE pkg_c003 in place at t=3.5s.
//   → The price is lower (£1,049 vs £1,099).
//
// NEW RESULTS (unique keys, appended at the end):
//   pkg_l003, pkg_l004, pkg_l005 are hotels not in the cache — new options.
//
// NON-CACHED DESTINATION PATH:
//   NON_CACHED_PACKAGES are returned for non-cached destinations (e.g. Phuket)
//   where there is no cache at all. The user gets a direct result without the
//   live loading animation.
// ─────────────────────────────────────────────────────────────────────────────

import { UnifiedPackage } from '../../types';

export const LIVE_PACKAGES: UnifiedPackage[] = [

  // ── Batch 1 (arrives at t=3.5s): first 3 packages ────────────────────────

  // pkg_l001 — REPLACES cached pkg_c001 (same dedup key, better price)
  {
    packageId: "pkg_l001",
    sourceMode: "live",
    deduplicationKey: "giata001_BA2491_BA2492_2026-04-28", // same as pkg_c001
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
      outbound: {
        carrier: "British Airways",
        flightNumber: "BA2491",
        departureAirport: "LHR",
        arrivalAirport: "CUN",
        departureTime: "2026-04-28T11:00:00Z",
        arrivalTime: "2026-04-28T21:30:00Z",
        durationMinutes: 630,
      },
      return: {
        carrier: "British Airways",
        flightNumber: "BA2492",
        departureAirport: "CUN",
        arrivalAirport: "LHR",
        departureTime: "2026-05-05T17:00:00Z",
        arrivalTime: "2026-05-06T09:00:00Z",
        durationMinutes: 600,
      },
    },
    // Live price is £30 cheaper — watch the card update when this arrives
    price: { perPerson: 819, total: 1638, currency: "GBP" },
    tripType: "hotel-flight",
    // No rateCalendar — live packages always use the Package Details panel
  },

  // pkg_l002 — REPLACES cached pkg_c003 (Moon Palace + VS, better price)
  {
    packageId: "pkg_l002",
    sourceMode: "live",
    deduplicationKey: "giata003_VS113_VS114_2026-04-21", // same as pkg_c003
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
      outbound: {
        carrier: "Virgin Atlantic",
        flightNumber: "VS113",
        departureAirport: "LHR",
        arrivalAirport: "CUN",
        departureTime: "2026-04-21T09:30:00Z",
        arrivalTime: "2026-04-21T19:45:00Z",
        durationMinutes: 615,
      },
      return: {
        carrier: "Virgin Atlantic",
        flightNumber: "VS114",
        departureAirport: "CUN",
        arrivalAirport: "LHR",
        departureTime: "2026-04-28T16:00:00Z",
        arrivalTime: "2026-04-29T07:30:00Z",
        durationMinutes: 570,
      },
    },
    price: { perPerson: 1049, total: 2098, currency: "GBP" },
    tripType: "round-trip",
  },

  // pkg_l003 — NEW hotel (not in cache), appended to list
  {
    packageId: "pkg_l003",
    sourceMode: "live",
    deduplicationKey: "giata008_IB7120_IB7121_2026-04-28",
    hotel: {
      giataId: "giata008",
      name: "Grand Park Royal Cancún Beach",
      category: 5,
      mainImage: "https://loremflickr.com/800/500/cancun,beach,club,hotel?lock=77",
      trustYou: { rating: 85, recommendationScore: 90, reviewCount: 1423 },
      amenities: ["Beach club", "2 pools", "Scuba diving", "Multiple restaurants", "Sports facilities"],
      location: "Hotel Zone, Cancún",
    },
    room: { roomType: "Standard Club King", boardType: "All Inclusive" },
    flights: {
      outbound: {
        carrier: "Iberia",
        flightNumber: "IB7120",
        departureAirport: "LHR",
        arrivalAirport: "CUN",
        departureTime: "2026-04-28T13:45:00Z",
        arrivalTime: "2026-04-28T23:15:00Z",
        durationMinutes: 570,
      },
      return: {
        carrier: "Iberia",
        flightNumber: "IB7121",
        departureAirport: "CUN",
        arrivalAirport: "LHR",
        departureTime: "2026-05-05T14:30:00Z",
        arrivalTime: "2026-05-06T06:45:00Z",
        durationMinutes: 555,
      },
    },
    price: { perPerson: 799, total: 1598, currency: "GBP" },
    tripType: "group-tour",
  },

  // ── Batch 2 (arrives at t=5s): remaining packages ────────────────────────

  // pkg_l004 — NEW hotel, second batch
  {
    packageId: "pkg_l004",
    sourceMode: "live",
    deduplicationKey: "giata009_AA47_AA48_2026-05-05",
    hotel: {
      giataId: "giata009",
      name: "Sunset Marina Resort & Yacht Club",
      category: 4,
      mainImage: "https://loremflickr.com/800/500/cancun,marina,lagoon,yacht?lock=88",
      trustYou: { rating: 80, recommendationScore: 85, reviewCount: 734 },
      amenities: ["Marina views", "Pool", "Water sports", "3 restaurants", "Snorkelling"],
      location: "Laguna Nichupté, Cancún",
    },
    room: { roomType: "Superior King Room", boardType: "Breakfast Included" },
    flights: {
      outbound: {
        carrier: "American Airlines",
        flightNumber: "AA47",
        departureAirport: "LHR",
        arrivalAirport: "CUN",
        departureTime: "2026-05-05T10:15:00Z",
        arrivalTime: "2026-05-05T20:30:00Z",
        durationMinutes: 615,
      },
      return: {
        carrier: "American Airlines",
        flightNumber: "AA48",
        departureAirport: "CUN",
        arrivalAirport: "LHR",
        departureTime: "2026-05-12T12:00:00Z",
        arrivalTime: "2026-05-13T06:15:00Z",
        durationMinutes: 615,
      },
    },
    price: { perPerson: 1149, total: 2298, currency: "GBP" },
    tripType: "individual-tour",
  },

  // pkg_l005 — NEW hotel, second batch (budget option)
  {
    packageId: "pkg_l005",
    sourceMode: "live",
    deduplicationKey: "giata010_UA892_UA893_2026-04-21",
    hotel: {
      giataId: "giata010",
      name: "Oasis Cancún Lite",
      category: 3,
      mainImage: "https://loremflickr.com/800/500/cancun,hotel,pool,beach?lock=99",
      trustYou: { rating: 72, recommendationScore: 78, reviewCount: 2891 },
      amenities: ["Pool", "Beach access", "Buffet restaurant", "Entertainment"],
      location: "Hotel Zone, Cancún",
    },
    room: { roomType: "Standard Room Garden View", boardType: "All Inclusive" },
    flights: {
      outbound: {
        carrier: "United Airlines",
        flightNumber: "UA892",
        departureAirport: "LHR",
        arrivalAirport: "CUN",
        departureTime: "2026-04-21T08:00:00Z",
        arrivalTime: "2026-04-21T18:30:00Z",
        durationMinutes: 630,
      },
      return: {
        carrier: "United Airlines",
        flightNumber: "UA893",
        departureAirport: "CUN",
        arrivalAirport: "LHR",
        departureTime: "2026-04-28T19:00:00Z",
        arrivalTime: "2026-04-29T11:15:00Z",
        durationMinutes: 615,
      },
    },
    price: { perPerson: 749, total: 1498, currency: "GBP" },
    tripType: "last-minute",
  },
];

// ── Non-cached destination results ────────────────────────────────────────────
// Returned when isCachedDestination === false (e.g. searching Phuket).
// No cache phase, no live loading animation — just a direct result set.
// These are Phuket packages to match the expected non-cached demo search.
export const NON_CACHED_PACKAGES: UnifiedPackage[] = [
  {
    packageId: "pkg_nc001",
    sourceMode: "live",
    deduplicationKey: "giata020_EK384_EK385_2026-04-28",
    hotel: {
      giataId: "giata020",
      name: "Trisara Resort Phuket",
      category: 5,
      mainImage: "https://loremflickr.com/800/500/phuket,beach,villa,pool?lock=111",
      trustYou: { rating: 94, recommendationScore: 97, reviewCount: 521 },
      amenities: ["Private beach", "Pool villa", "Michelin-star dining", "Spa", "Snorkelling"],
      location: "Nai Thon Bay, Phuket",
    },
    room: { roomType: "Ocean Front Pool Villa", boardType: "Breakfast Included" },
    flights: {
      outbound: {
        carrier: "Emirates",
        flightNumber: "EK384",
        departureAirport: "LHR",
        arrivalAirport: "HKT",
        departureTime: "2026-04-28T21:30:00Z",
        arrivalTime: "2026-04-29T18:00:00Z",
        durationMinutes: 870,
      },
      return: {
        carrier: "Emirates",
        flightNumber: "EK385",
        departureAirport: "HKT",
        arrivalAirport: "LHR",
        departureTime: "2026-05-05T20:00:00Z",
        arrivalTime: "2026-05-06T07:30:00Z",
        durationMinutes: 810,
      },
    },
    price: { perPerson: 1349, total: 2698, currency: "GBP" },
    tripType: "individual-tour",
  },
  {
    packageId: "pkg_nc002",
    sourceMode: "live",
    deduplicationKey: "giata021_TG916_TG917_2026-05-05",
    hotel: {
      giataId: "giata021",
      name: "Amanpuri Resort",
      category: 5,
      mainImage: "https://loremflickr.com/800/500/phuket,luxury,infinity,pool?lock=222",
      trustYou: { rating: 96, recommendationScore: 98, reviewCount: 312 },
      amenities: ["Private beach", "Infinity pool", "Aman Spa", "Thai pavilions", "Water sports"],
      location: "Pansea Beach, Phuket",
    },
    room: { roomType: "Thai Pavilion", boardType: "Room Only" },
    flights: {
      outbound: {
        carrier: "Thai Airways",
        flightNumber: "TG916",
        departureAirport: "LHR",
        arrivalAirport: "HKT",
        departureTime: "2026-05-05T23:50:00Z",
        arrivalTime: "2026-05-06T19:30:00Z",
        durationMinutes: 820,
      },
      return: {
        carrier: "Thai Airways",
        flightNumber: "TG917",
        departureAirport: "HKT",
        arrivalAirport: "LHR",
        departureTime: "2026-05-12T21:15:00Z",
        arrivalTime: "2026-05-13T06:00:00Z",
        durationMinutes: 765,
      },
    },
    price: { perPerson: 1899, total: 3798, currency: "GBP" },
    tripType: "group-tour",
  },
  {
    packageId: "pkg_nc003",
    sourceMode: "live",
    deduplicationKey: "giata022_QR836_QR837_2026-04-14",
    hotel: {
      giataId: "giata022",
      name: "Kata Rocks Resort",
      category: 5,
      mainImage: "https://loremflickr.com/800/500/phuket,andaman,sea,cliff?lock=333",
      trustYou: { rating: 91, recommendationScore: 95, reviewCount: 876 },
      amenities: ["Infinity pool", "Andaman Sea views", "Spa", "Yacht charter", "Fitness centre"],
      location: "Kata Beach, Phuket",
    },
    room: { roomType: "Sky Villa with Pool", boardType: "Breakfast Included" },
    flights: {
      outbound: {
        carrier: "Qatar Airways",
        flightNumber: "QR836",
        departureAirport: "LHR",
        arrivalAirport: "HKT",
        departureTime: "2026-04-14T22:00:00Z",
        arrivalTime: "2026-04-15T19:15:00Z",
        durationMinutes: 855,
      },
      return: {
        carrier: "Qatar Airways",
        flightNumber: "QR837",
        departureAirport: "HKT",
        arrivalAirport: "LHR",
        departureTime: "2026-04-21T22:30:00Z",
        arrivalTime: "2026-04-22T08:45:00Z",
        durationMinutes: 795,
      },
    },
    price: { perPerson: 1099, total: 2198, currency: "GBP" },
    tripType: "round-trip",
  },
];
