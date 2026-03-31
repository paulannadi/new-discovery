// ─────────────────────────────────────────────────────────────────────────────
// Live Packages Mock Data
//
// These represent packages returned by live supplier queries (not cached).
// They arrive in two batches during the simulated SSE stream.
//
// DEDUPLICATION DEMO (per destination):
//   Some packages share a deduplicationKey with a cached package (same hotel
//   + flight combo) — they REPLACE the cached card in place when live results
//   arrive at t=3.5s, with a slightly lower price ("price updated" animation).
//
// NON-CACHED DESTINATIONS:
//   NON_CACHED_PACKAGES_BY_DESTINATION is a map from destination code to
//   packages. For non-cached destinations there is no cache phase — the hook
//   returns results from this map after the loading skeleton.
// ─────────────────────────────────────────────────────────────────────────────

import { UnifiedPackage } from '../../types';

export const LIVE_PACKAGES: UnifiedPackage[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // CANCÚN — live results
  // ══════════════════════════════════════════════════════════════════════════

  // pkg_l001 — REPLACES cached pkg_c001 (same dedup key, better price £819 vs £849)
  {
    packageId: "pkg_l001",
    destinationCode: "CANCUN",
    sourceMode: "live",
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
      outbound: {
        carrier: "British Airways", flightNumber: "BA2491",
        departureAirport: "LHR", arrivalAirport: "CUN",
        departureTime: "2026-04-28T11:00:00Z", arrivalTime: "2026-04-28T21:30:00Z",
        durationMinutes: 630,
      },
      return: {
        carrier: "British Airways", flightNumber: "BA2492",
        departureAirport: "CUN", arrivalAirport: "LHR",
        departureTime: "2026-05-05T17:00:00Z", arrivalTime: "2026-05-06T09:00:00Z",
        durationMinutes: 600,
      },
    },
    price: { perPerson: 819, total: 1638, currency: "GBP" },
    tripType: "hotel-flight",
  },

  // pkg_l002 — REPLACES cached pkg_c003 (Moon Palace, £1,049 vs £1,099)
  {
    packageId: "pkg_l002",
    destinationCode: "CANCUN",
    sourceMode: "live",
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
      outbound: {
        carrier: "Virgin Atlantic", flightNumber: "VS113",
        departureAirport: "LHR", arrivalAirport: "CUN",
        departureTime: "2026-04-21T09:30:00Z", arrivalTime: "2026-04-21T19:45:00Z",
        durationMinutes: 615,
      },
      return: {
        carrier: "Virgin Atlantic", flightNumber: "VS114",
        departureAirport: "CUN", arrivalAirport: "LHR",
        departureTime: "2026-04-28T16:00:00Z", arrivalTime: "2026-04-29T07:30:00Z",
        durationMinutes: 570,
      },
    },
    price: { perPerson: 1049, total: 2098, currency: "GBP" },
    tripType: "round-trip",
  },

  // pkg_l003 — NEW hotel (not in cache), first batch
  {
    packageId: "pkg_l003",
    destinationCode: "CANCUN",
    sourceMode: "live",
    deduplicationKey: "giata041_IB7120_IB7121_2026-04-28",
    hotel: {
      giataId: "giata041",
      name: "Grand Park Royal Cancún Beach",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=800&q=80",
      trustYou: { rating: 85, recommendationScore: 90, reviewCount: 1423 },
      amenities: ["Beach club", "2 pools", "Scuba diving", "Multiple restaurants", "Sports facilities"],
      location: "Hotel Zone, Cancún",
      lat: 21.112, lng: -86.810,
    },
    room: { roomType: "Standard Club King", boardType: "All Inclusive" },
    flights: {
      outbound: {
        carrier: "Iberia", flightNumber: "IB7120",
        departureAirport: "LHR", arrivalAirport: "CUN",
        departureTime: "2026-04-28T13:45:00Z", arrivalTime: "2026-04-28T23:15:00Z",
        durationMinutes: 570,
      },
      return: {
        carrier: "Iberia", flightNumber: "IB7121",
        departureAirport: "CUN", arrivalAirport: "LHR",
        departureTime: "2026-05-05T14:30:00Z", arrivalTime: "2026-05-06T06:45:00Z",
        durationMinutes: 555,
      },
    },
    price: { perPerson: 799, total: 1598, currency: "GBP" },
    tripType: "group-tour",
  },

  // pkg_l004 — NEW hotel, second batch
  {
    packageId: "pkg_l004",
    destinationCode: "CANCUN",
    sourceMode: "live",
    deduplicationKey: "giata042_AA47_AA48_2026-05-05",
    hotel: {
      giataId: "giata042",
      name: "Sunset Marina Resort & Yacht Club",
      category: 4,
      mainImage: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=80",
      trustYou: { rating: 80, recommendationScore: 85, reviewCount: 734 },
      amenities: ["Marina views", "Pool", "Water sports", "3 restaurants", "Snorkelling"],
      location: "Laguna Nichupté, Cancún",
      lat: 21.096, lng: -86.783,
    },
    room: { roomType: "Superior King Room", boardType: "Breakfast Included" },
    flights: {
      outbound: {
        carrier: "American Airlines", flightNumber: "AA47",
        departureAirport: "LHR", arrivalAirport: "CUN",
        departureTime: "2026-05-05T10:15:00Z", arrivalTime: "2026-05-05T20:30:00Z",
        durationMinutes: 615,
      },
      return: {
        carrier: "American Airlines", flightNumber: "AA48",
        departureAirport: "CUN", arrivalAirport: "LHR",
        departureTime: "2026-05-12T12:00:00Z", arrivalTime: "2026-05-13T06:15:00Z",
        durationMinutes: 615,
      },
    },
    price: { perPerson: 1149, total: 2298, currency: "GBP" },
    tripType: "individual-tour",
  },

  // pkg_l005 — NEW hotel, second batch (budget option)
  {
    packageId: "pkg_l005",
    destinationCode: "CANCUN",
    sourceMode: "live",
    deduplicationKey: "giata043_UA892_UA893_2026-04-21",
    hotel: {
      giataId: "giata043",
      name: "Oasis Cancún Lite",
      category: 3,
      mainImage: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      trustYou: { rating: 72, recommendationScore: 78, reviewCount: 2891 },
      amenities: ["Pool", "Beach access", "Buffet restaurant", "Entertainment"],
      location: "Hotel Zone, Cancún",
      lat: 21.155, lng: -86.848,
    },
    room: { roomType: "Standard Room Garden View", boardType: "All Inclusive" },
    flights: {
      outbound: {
        carrier: "United Airlines", flightNumber: "UA892",
        departureAirport: "LHR", arrivalAirport: "CUN",
        departureTime: "2026-04-21T08:00:00Z", arrivalTime: "2026-04-21T18:30:00Z",
        durationMinutes: 630,
      },
      return: {
        carrier: "United Airlines", flightNumber: "UA893",
        departureAirport: "CUN", arrivalAirport: "LHR",
        departureTime: "2026-04-28T19:00:00Z", arrivalTime: "2026-04-29T11:15:00Z",
        durationMinutes: 615,
      },
    },
    price: { perPerson: 749, total: 1498, currency: "GBP" },
    tripType: "last-minute",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DUBAI — live results
  // ══════════════════════════════════════════════════════════════════════════

  // Replaces pkg_d001 (Atlantis, EK003/EK004, better price)
  {
    packageId: "pkg_dl001",
    destinationCode: "DUBAI",
    sourceMode: "live",
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
      outbound: {
        carrier: "Emirates", flightNumber: "EK003",
        departureAirport: "LHR", arrivalAirport: "DXB",
        departureTime: "2026-04-15T14:30:00Z", arrivalTime: "2026-04-16T01:30:00Z",
        durationMinutes: 420,
      },
      return: {
        carrier: "Emirates", flightNumber: "EK004",
        departureAirport: "DXB", arrivalAirport: "LHR",
        departureTime: "2026-04-22T08:20:00Z", arrivalTime: "2026-04-22T13:05:00Z",
        durationMinutes: 465,
      },
    },
    price: { perPerson: 1389, total: 2778, currency: "GBP" },
    tripType: "hotel-flight",
  },

  // NEW — DUBAI Marriott Harbour
  {
    packageId: "pkg_dl002",
    destinationCode: "DUBAI",
    sourceMode: "live",
    deduplicationKey: "giata044_EK003_EK004_2026-05-20",
    hotel: {
      giataId: "giata044",
      name: "Marriott Hotel Al Jaddaf",
      category: 4,
      mainImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      trustYou: { rating: 84, recommendationScore: 88, reviewCount: 2134 },
      amenities: ["Dubai Creek views", "Rooftop pool", "Gym & spa", "3 restaurants", "Dubai Frame nearby"],
      location: "Al Jaddaf, Dubai",
      lat: 25.219, lng: 55.328,
    },
    room: { roomType: "Deluxe City View King", boardType: "Breakfast Included" },
    flights: {
      outbound: {
        carrier: "Emirates", flightNumber: "EK003",
        departureAirport: "LHR", arrivalAirport: "DXB",
        departureTime: "2026-05-20T14:30:00Z", arrivalTime: "2026-05-21T01:30:00Z",
        durationMinutes: 420,
      },
      return: {
        carrier: "Emirates", flightNumber: "EK004",
        departureAirport: "DXB", arrivalAirport: "LHR",
        departureTime: "2026-05-27T08:20:00Z", arrivalTime: "2026-05-27T13:05:00Z",
        durationMinutes: 465,
      },
    },
    price: { perPerson: 899, total: 1798, currency: "GBP" },
    tripType: "last-minute",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BALI — live results
  // ══════════════════════════════════════════════════════════════════════════

  // Replaces pkg_b001 (Four Seasons Sayan, better price)
  {
    packageId: "pkg_bl001",
    destinationCode: "BALI",
    sourceMode: "live",
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
      outbound: {
        carrier: "Singapore Airlines", flightNumber: "SQ322",
        departureAirport: "LHR", arrivalAirport: "DPS",
        departureTime: "2026-04-10T21:30:00Z", arrivalTime: "2026-04-12T18:50:00Z",
        durationMinutes: 920,
      },
      return: {
        carrier: "Singapore Airlines", flightNumber: "SQ323",
        departureAirport: "DPS", arrivalAirport: "LHR",
        departureTime: "2026-04-24T10:00:00Z", arrivalTime: "2026-04-25T05:30:00Z",
        durationMinutes: 870,
      },
    },
    price: { perPerson: 2749, total: 5498, currency: "GBP" },
    tripType: "individual-tour",
  },

  // NEW — Bali budget villa option
  {
    packageId: "pkg_bl002",
    destinationCode: "BALI",
    sourceMode: "live",
    deduplicationKey: "giata045_EK433_EK434_2026-05-08",
    hotel: {
      giataId: "giata045",
      name: "Katamama Hotel",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80",
      trustYou: { rating: 93, recommendationScore: 96, reviewCount: 654 },
      amenities: ["Batik art suites", "Potoo restaurant", "Rooftop pool", "Spa", "Seminyak location"],
      location: "Seminyak, Bali",
      lat: -8.680, lng: 115.161,
    },
    room: { roomType: "Terrace Suite", boardType: "Breakfast Included" },
    flights: {
      outbound: {
        carrier: "Emirates", flightNumber: "EK433",
        departureAirport: "LHR", arrivalAirport: "DPS",
        departureTime: "2026-05-08T22:00:00Z", arrivalTime: "2026-05-10T22:40:00Z",
        durationMinutes: 950,
      },
      return: {
        carrier: "Emirates", flightNumber: "EK434",
        departureAirport: "DPS", arrivalAirport: "LHR",
        departureTime: "2026-05-22T08:30:00Z", arrivalTime: "2026-05-23T03:10:00Z",
        durationMinutes: 910,
      },
    },
    price: { perPerson: 1699, total: 3398, currency: "GBP" },
    tripType: "hotel-flight",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TENERIFE — live results
  // ══════════════════════════════════════════════════════════════════════════

  // Replaces pkg_t001 (Gran Meliá Palacio de Isora, better price)
  {
    packageId: "pkg_tl001",
    destinationCode: "TENERIFE",
    sourceMode: "live",
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
      outbound: {
        carrier: "TUI Airways", flightNumber: "TOM131",
        departureAirport: "LHR", arrivalAirport: "TFS",
        departureTime: "2026-04-11T06:00:00Z", arrivalTime: "2026-04-11T10:30:00Z",
        durationMinutes: 270,
      },
      return: {
        carrier: "TUI Airways", flightNumber: "TOM132",
        departureAirport: "TFS", arrivalAirport: "LHR",
        departureTime: "2026-04-18T11:30:00Z", arrivalTime: "2026-04-18T16:00:00Z",
        durationMinutes: 270,
      },
    },
    price: { perPerson: 849, total: 1698, currency: "GBP" },
    tripType: "hotel-flight",
  },

  // NEW — Tenerife boutique hotel
  {
    packageId: "pkg_tl002",
    destinationCode: "TENERIFE",
    sourceMode: "live",
    deduplicationKey: "giata046_EZY3231_EZY3232_2026-05-23",
    hotel: {
      giataId: "giata046",
      name: "Hotel Jardines de Nivaria",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      trustYou: { rating: 93, recommendationScore: 96, reviewCount: 765 },
      amenities: ["Adults only", "Private gardens", "Infinity pool", "Gourmet restaurant", "Spa"],
      location: "Costa Adeje, Tenerife",
      lat: 28.078, lng: -16.731,
    },
    room: { roomType: "Deluxe Junior Suite Garden", boardType: "Breakfast Included" },
    flights: {
      outbound: {
        carrier: "easyJet", flightNumber: "EZY3231",
        departureAirport: "LHR", arrivalAirport: "TFS",
        departureTime: "2026-05-23T07:30:00Z", arrivalTime: "2026-05-23T12:00:00Z",
        durationMinutes: 270,
      },
      return: {
        carrier: "easyJet", flightNumber: "EZY3232",
        departureAirport: "TFS", arrivalAirport: "LHR",
        departureTime: "2026-05-30T13:00:00Z", arrivalTime: "2026-05-30T17:30:00Z",
        durationMinutes: 270,
      },
    },
    price: { perPerson: 1049, total: 2098, currency: "GBP" },
    tripType: "last-minute",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MALLORCA — live results
  // ══════════════════════════════════════════════════════════════════════════

  // Replaces pkg_m001 (Park Hyatt Mallorca, better price)
  {
    packageId: "pkg_ml001",
    destinationCode: "MALLORCA",
    sourceMode: "live",
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
      outbound: {
        carrier: "easyJet", flightNumber: "EZY3371",
        departureAirport: "LHR", arrivalAirport: "PMI",
        departureTime: "2026-04-25T06:30:00Z", arrivalTime: "2026-04-25T09:00:00Z",
        durationMinutes: 150,
      },
      return: {
        carrier: "easyJet", flightNumber: "EZY3372",
        departureAirport: "PMI", arrivalAirport: "LHR",
        departureTime: "2026-05-02T10:00:00Z", arrivalTime: "2026-05-02T12:30:00Z",
        durationMinutes: 150,
      },
    },
    price: { perPerson: 1099, total: 2198, currency: "GBP" },
    tripType: "individual-tour",
  },

  // NEW — Mallorca rural finca
  {
    packageId: "pkg_ml002",
    destinationCode: "MALLORCA",
    sourceMode: "live",
    deduplicationKey: "giata047_LS523_LS524_2026-05-23",
    hotel: {
      giataId: "giata047",
      name: "Belmond La Residencia",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      trustYou: { rating: 94, recommendationScore: 97, reviewCount: 876 },
      amenities: ["16th-century finca", "2 pools", "Spa", "El Olivo restaurant", "Mountain views"],
      location: "Deià, Mallorca",
      lat: 39.748, lng: 2.645,
    },
    room: { roomType: "Junior Suite Mountain View", boardType: "Breakfast Included" },
    flights: {
      outbound: {
        carrier: "Jet2", flightNumber: "LS523",
        departureAirport: "LHR", arrivalAirport: "PMI",
        departureTime: "2026-05-23T08:15:00Z", arrivalTime: "2026-05-23T11:10:00Z",
        durationMinutes: 175,
      },
      return: {
        carrier: "Jet2", flightNumber: "LS524",
        departureAirport: "PMI", arrivalAirport: "LHR",
        departureTime: "2026-05-30T12:20:00Z", arrivalTime: "2026-05-30T15:15:00Z",
        durationMinutes: 175,
      },
    },
    price: { perPerson: 1349, total: 2698, currency: "GBP" },
    tripType: "round-trip",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MALDIVES — live results
  // ══════════════════════════════════════════════════════════════════════════

  // Replaces pkg_mv001 (Soneva Jani, better price)
  {
    packageId: "pkg_mvl001",
    destinationCode: "MALDIVES",
    sourceMode: "live",
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
      outbound: {
        carrier: "Emirates", flightNumber: "EK661",
        departureAirport: "LHR", arrivalAirport: "MLE",
        departureTime: "2026-04-04T21:30:00Z", arrivalTime: "2026-04-05T14:30:00Z",
        durationMinutes: 570,
      },
      return: {
        carrier: "Emirates", flightNumber: "EK662",
        departureAirport: "MLE", arrivalAirport: "LHR",
        departureTime: "2026-04-11T15:45:00Z", arrivalTime: "2026-04-11T22:35:00Z",
        durationMinutes: 530,
      },
    },
    price: { perPerson: 5199, total: 10398, currency: "GBP" },
    tripType: "individual-tour",
  },

  // NEW — Maldives mid-range option
  {
    packageId: "pkg_mvl002",
    destinationCode: "MALDIVES",
    sourceMode: "live",
    deduplicationKey: "giata048_EK661_EK662_2026-05-16",
    hotel: {
      giataId: "giata048",
      name: "Kandima Maldives",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&q=80",
      trustYou: { rating: 89, recommendationScore: 93, reviewCount: 1543 },
      amenities: ["2.4km island", "10 restaurants", "Aqua studio", "Dive centre", "Waterpark"],
      location: "Dhaalu Atoll, Maldives",
      lat: 2.601, lng: 72.879,
    },
    room: { roomType: "Aqua Villa with Pool", boardType: "All Inclusive" },
    flights: {
      outbound: {
        carrier: "Emirates", flightNumber: "EK661",
        departureAirport: "LHR", arrivalAirport: "MLE",
        departureTime: "2026-05-16T21:30:00Z", arrivalTime: "2026-05-17T14:30:00Z",
        durationMinutes: 570,
      },
      return: {
        carrier: "Emirates", flightNumber: "EK662",
        departureAirport: "MLE", arrivalAirport: "LHR",
        departureTime: "2026-05-23T15:45:00Z", arrivalTime: "2026-05-23T22:35:00Z",
        durationMinutes: 530,
      },
    },
    price: { perPerson: 2499, total: 4998, currency: "GBP" },
    tripType: "hotel-flight",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ORLANDO — live results
  // ══════════════════════════════════════════════════════════════════════════

  // Replaces pkg_or001 (Disney Grand Floridian, better price)
  {
    packageId: "pkg_orl001",
    destinationCode: "ORLANDO",
    sourceMode: "live",
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
      outbound: {
        carrier: "Virgin Atlantic", flightNumber: "VS15",
        departureAirport: "LHR", arrivalAirport: "MCO",
        departureTime: "2026-04-11T10:00:00Z", arrivalTime: "2026-04-11T14:45:00Z",
        durationMinutes: 555,
      },
      return: {
        carrier: "Virgin Atlantic", flightNumber: "VS16",
        departureAirport: "MCO", arrivalAirport: "LHR",
        departureTime: "2026-04-18T18:00:00Z", arrivalTime: "2026-04-19T06:30:00Z",
        durationMinutes: 510,
      },
    },
    price: { perPerson: 1799, total: 3598, currency: "GBP" },
    tripType: "hotel-flight",
  },

  // NEW — Orlando budget family option
  {
    packageId: "pkg_orl002",
    destinationCode: "ORLANDO",
    sourceMode: "live",
    deduplicationKey: "giata049_BA2031_BA2032_2026-05-23",
    hotel: {
      giataId: "giata049",
      name: "Universal's Cabana Bay Beach Resort",
      category: 3,
      mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      trustYou: { rating: 84, recommendationScore: 88, reviewCount: 6231 },
      amenities: ["Retro beach theme", "2 pools", "Lazy river", "Early park admission", "Bowling alley"],
      location: "Universal Orlando, Orlando",
      lat: 28.478, lng: -81.474,
    },
    room: { roomType: "Standard Room", boardType: "Room Only" },
    flights: {
      outbound: {
        carrier: "British Airways", flightNumber: "BA2031",
        departureAirport: "LHR", arrivalAirport: "MCO",
        departureTime: "2026-05-23T11:30:00Z", arrivalTime: "2026-05-23T16:45:00Z",
        durationMinutes: 555,
      },
      return: {
        carrier: "British Airways", flightNumber: "BA2032",
        departureAirport: "MCO", arrivalAirport: "LHR",
        departureTime: "2026-05-30T20:30:00Z", arrivalTime: "2026-05-31T08:45:00Z",
        durationMinutes: 495,
      },
    },
    price: { perPerson: 899, total: 1798, currency: "GBP" },
    tripType: "last-minute",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LOS ANGELES — live results
  // ══════════════════════════════════════════════════════════════════════════

  // Replaces pkg_la001 (Shutters on the Beach, better price)
  {
    packageId: "pkg_lal001",
    destinationCode: "LOSANGELES",
    sourceMode: "live",
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
      outbound: {
        carrier: "British Airways", flightNumber: "BA269",
        departureAirport: "LHR", arrivalAirport: "LAX",
        departureTime: "2026-04-14T11:00:00Z", arrivalTime: "2026-04-14T14:00:00Z",
        durationMinutes: 660,
      },
      return: {
        carrier: "British Airways", flightNumber: "BA270",
        departureAirport: "LAX", arrivalAirport: "LHR",
        departureTime: "2026-04-21T19:45:00Z", arrivalTime: "2026-04-22T14:55:00Z",
        durationMinutes: 610,
      },
    },
    price: { perPerson: 2099, total: 4198, currency: "GBP" },
    tripType: "hotel-flight",
  },

  // NEW — LA boutique option
  {
    packageId: "pkg_lal002",
    destinationCode: "LOSANGELES",
    sourceMode: "live",
    deduplicationKey: "giata050_VS7_VS8_2026-05-19",
    hotel: {
      giataId: "giata050",
      name: "Hotel Bel-Air",
      category: 5,
      mainImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
      trustYou: { rating: 96, recommendationScore: 98, reviewCount: 987 },
      amenities: ["12 acres of gardens", "Heated pool", "Wolfgang Puck restaurant", "Spa", "Private canyon"],
      location: "Bel-Air, Los Angeles",
      lat: 34.082, lng: -118.447,
    },
    room: { roomType: "Canyon Suite", boardType: "Breakfast Included" },
    flights: {
      outbound: {
        carrier: "Virgin Atlantic", flightNumber: "VS7",
        departureAirport: "LHR", arrivalAirport: "LAX",
        departureTime: "2026-05-19T12:00:00Z", arrivalTime: "2026-05-19T14:50:00Z",
        durationMinutes: 650,
      },
      return: {
        carrier: "Virgin Atlantic", flightNumber: "VS8",
        departureAirport: "LAX", arrivalAirport: "LHR",
        departureTime: "2026-05-26T18:00:00Z", arrivalTime: "2026-05-27T13:00:00Z",
        durationMinutes: 600,
      },
    },
    price: { perPerson: 3499, total: 6998, currency: "GBP" },
    tripType: "individual-tour",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LANZAROTE — live results
  // ══════════════════════════════════════════════════════════════════════════

  // Replaces pkg_lz001 (Princesa Yaiza, better price)
  {
    packageId: "pkg_lzl001",
    destinationCode: "LANZAROTE",
    sourceMode: "live",
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
      outbound: {
        carrier: "easyJet", flightNumber: "EZY4051",
        departureAirport: "LHR", arrivalAirport: "ACE",
        departureTime: "2026-04-11T07:00:00Z", arrivalTime: "2026-04-11T11:15:00Z",
        durationMinutes: 255,
      },
      return: {
        carrier: "easyJet", flightNumber: "EZY4052",
        departureAirport: "ACE", arrivalAirport: "LHR",
        departureTime: "2026-04-18T12:30:00Z", arrivalTime: "2026-04-18T16:45:00Z",
        durationMinutes: 255,
      },
    },
    price: { perPerson: 749, total: 1498, currency: "GBP" },
    tripType: "hotel-flight",
  },

  // NEW — Lanzarote boutique volcanic option
  {
    packageId: "pkg_lzl002",
    destinationCode: "LANZAROTE",
    sourceMode: "live",
    deduplicationKey: "giata051_TOM285_TOM286_2026-05-16",
    hotel: {
      giataId: "giata051",
      name: "Finca de Arrieta",
      category: 4,
      mainImage: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
      trustYou: { rating: 88, recommendationScore: 92, reviewCount: 654 },
      amenities: ["Volcanic pools", "Eco-friendly", "Organic breakfast", "Private beach access", "Star gazing"],
      location: "Arrieta, North Lanzarote",
      lat: 29.165, lng: -13.466,
    },
    room: { roomType: "Eco Bungalow", boardType: "Breakfast Included" },
    flights: {
      outbound: {
        carrier: "TUI Airways", flightNumber: "TOM285",
        departureAirport: "LHR", arrivalAirport: "ACE",
        departureTime: "2026-05-16T09:30:00Z", arrivalTime: "2026-05-16T14:00:00Z",
        durationMinutes: 270,
      },
      return: {
        carrier: "TUI Airways", flightNumber: "TOM286",
        departureAirport: "ACE", arrivalAirport: "LHR",
        departureTime: "2026-05-23T15:00:00Z", arrivalTime: "2026-05-23T19:30:00Z",
        durationMinutes: 270,
      },
    },
    price: { perPerson: 579, total: 1158, currency: "GBP" },
    tripType: "last-minute",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Non-cached destination packages
//
// Keyed by destination code — useUnifiedSearch looks up the right packages
// for whichever non-cached destination the user searched.
// No cache phase, no live loading animation — direct results after skeleton.
// ─────────────────────────────────────────────────────────────────────────────

export const NON_CACHED_PACKAGES_BY_DESTINATION: Record<string, UnifiedPackage[]> = {

  PHUKET: [
    {
      packageId: "pkg_nc_ph001",
      destinationCode: "PHUKET",
      sourceMode: "live",
      deduplicationKey: "giata080_EK384_EK385_2026-04-28",
      hotel: {
        giataId: "giata080",
        name: "Trisara Resort Phuket",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80",
        trustYou: { rating: 94, recommendationScore: 97, reviewCount: 521 },
        amenities: ["Private beach", "Pool villa", "Michelin-star dining", "Spa", "Snorkelling"],
        location: "Nai Thon Bay, Phuket",
        lat: 8.113, lng: 98.293,
      },
      room: { roomType: "Ocean Front Pool Villa", boardType: "Breakfast Included" },
      flights: {
        outbound: {
          carrier: "Emirates", flightNumber: "EK384",
          departureAirport: "LHR", arrivalAirport: "HKT",
          departureTime: "2026-04-28T21:30:00Z", arrivalTime: "2026-04-29T18:00:00Z",
          durationMinutes: 870,
        },
        return: {
          carrier: "Emirates", flightNumber: "EK385",
          departureAirport: "HKT", arrivalAirport: "LHR",
          departureTime: "2026-05-05T20:00:00Z", arrivalTime: "2026-05-06T07:30:00Z",
          durationMinutes: 810,
        },
      },
      price: { perPerson: 1349, total: 2698, currency: "GBP" },
      tripType: "individual-tour",
    },
    {
      packageId: "pkg_nc_ph002",
      destinationCode: "PHUKET",
      sourceMode: "live",
      deduplicationKey: "giata081_TG916_TG917_2026-05-05",
      hotel: {
        giataId: "giata081",
        name: "Amanpuri Resort",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80",
        trustYou: { rating: 96, recommendationScore: 98, reviewCount: 312 },
        amenities: ["Private beach", "Infinity pool", "Aman Spa", "Thai pavilions", "Water sports"],
        location: "Pansea Beach, Phuket",
        lat: 7.989, lng: 98.274,
      },
      room: { roomType: "Thai Pavilion", boardType: "Room Only" },
      flights: {
        outbound: {
          carrier: "Thai Airways", flightNumber: "TG916",
          departureAirport: "LHR", arrivalAirport: "HKT",
          departureTime: "2026-05-05T23:50:00Z", arrivalTime: "2026-05-06T19:30:00Z",
          durationMinutes: 820,
        },
        return: {
          carrier: "Thai Airways", flightNumber: "TG917",
          departureAirport: "HKT", arrivalAirport: "LHR",
          departureTime: "2026-05-12T21:15:00Z", arrivalTime: "2026-05-13T06:00:00Z",
          durationMinutes: 765,
        },
      },
      price: { perPerson: 1899, total: 3798, currency: "GBP" },
      tripType: "group-tour",
    },
    {
      packageId: "pkg_nc_ph003",
      destinationCode: "PHUKET",
      sourceMode: "live",
      deduplicationKey: "giata082_QR836_QR837_2026-04-14",
      hotel: {
        giataId: "giata082",
        name: "Kata Rocks Resort",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80",
        trustYou: { rating: 91, recommendationScore: 95, reviewCount: 876 },
        amenities: ["Infinity pool", "Andaman Sea views", "Spa", "Yacht charter", "Fitness centre"],
        location: "Kata Beach, Phuket",
        lat: 7.819, lng: 98.300,
      },
      room: { roomType: "Sky Villa with Pool", boardType: "Breakfast Included" },
      flights: {
        outbound: {
          carrier: "Qatar Airways", flightNumber: "QR836",
          departureAirport: "LHR", arrivalAirport: "HKT",
          departureTime: "2026-04-14T22:00:00Z", arrivalTime: "2026-04-15T19:15:00Z",
          durationMinutes: 855,
        },
        return: {
          carrier: "Qatar Airways", flightNumber: "QR837",
          departureAirport: "HKT", arrivalAirport: "LHR",
          departureTime: "2026-04-21T22:30:00Z", arrivalTime: "2026-04-22T08:45:00Z",
          durationMinutes: 795,
        },
      },
      price: { perPerson: 1099, total: 2198, currency: "GBP" },
      tripType: "round-trip",
    },
  ],

  MARRAKECH: [
    {
      packageId: "pkg_nc_mk001",
      destinationCode: "MARRAKECH",
      sourceMode: "live",
      deduplicationKey: "giata083_AT800_AT801_2026-04-10",
      hotel: {
        giataId: "giata083",
        name: "La Mamounia",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
        trustYou: { rating: 97, recommendationScore: 99, reviewCount: 1432 },
        amenities: ["Legendary palace hotel", "Hammam spa", "3 pools", "7 restaurants", "Gardens"],
        location: "Medina, Marrakech",
        lat: 31.622, lng: -7.994,
      },
      room: { roomType: "Deluxe Room Garden View", boardType: "Breakfast Included" },
      flights: {
        outbound: {
          carrier: "Royal Air Maroc", flightNumber: "AT800",
          departureAirport: "LHR", arrivalAirport: "RAK",
          departureTime: "2026-04-10T09:00:00Z", arrivalTime: "2026-04-10T12:30:00Z",
          durationMinutes: 210,
        },
        return: {
          carrier: "Royal Air Maroc", flightNumber: "AT801",
          departureAirport: "RAK", arrivalAirport: "LHR",
          departureTime: "2026-04-17T14:00:00Z", arrivalTime: "2026-04-17T17:30:00Z",
          durationMinutes: 210,
        },
      },
      price: { perPerson: 1199, total: 2398, currency: "GBP" },
      tripType: "individual-tour",
    },
    {
      packageId: "pkg_nc_mk002",
      destinationCode: "MARRAKECH",
      sourceMode: "live",
      deduplicationKey: "giata084_FR7640_FR7641_2026-04-24",
      hotel: {
        giataId: "giata084",
        name: "Royal Mansour Marrakech",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
        trustYou: { rating: 98, recommendationScore: 99, reviewCount: 876 },
        amenities: ["Private riads", "Royal spa", "3 restaurants", "Private plunge pools", "Medina access"],
        location: "Medina Quarter, Marrakech",
        lat: 31.628, lng: -7.989,
      },
      room: { roomType: "One-Bedroom Riad", boardType: "Room Only" },
      flights: {
        outbound: {
          carrier: "Ryanair", flightNumber: "FR7640",
          departureAirport: "LHR", arrivalAirport: "RAK",
          departureTime: "2026-04-24T07:20:00Z", arrivalTime: "2026-04-24T11:00:00Z",
          durationMinutes: 220,
        },
        return: {
          carrier: "Ryanair", flightNumber: "FR7641",
          departureAirport: "RAK", arrivalAirport: "LHR",
          departureTime: "2026-05-01T12:00:00Z", arrivalTime: "2026-05-01T15:45:00Z",
          durationMinutes: 225,
        },
      },
      price: { perPerson: 2499, total: 4998, currency: "GBP" },
      tripType: "hotel-flight",
    },
    {
      packageId: "pkg_nc_mk003",
      destinationCode: "MARRAKECH",
      sourceMode: "live",
      deduplicationKey: "giata085_AT800_AT801_2026-05-08",
      hotel: {
        giataId: "giata085",
        name: "Riad Farnatchi",
        category: 4,
        mainImage: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80",
        trustYou: { rating: 90, recommendationScore: 94, reviewCount: 543 },
        amenities: ["Boutique riad", "Plunge pool", "Rooftop terrace", "Home cooking", "Medina location"],
        location: "Medina, Marrakech",
        lat: 31.631, lng: -7.987,
      },
      room: { roomType: "Superior Suite Courtyard", boardType: "Breakfast Included" },
      flights: {
        outbound: {
          carrier: "Royal Air Maroc", flightNumber: "AT800",
          departureAirport: "LHR", arrivalAirport: "RAK",
          departureTime: "2026-05-08T09:00:00Z", arrivalTime: "2026-05-08T12:30:00Z",
          durationMinutes: 210,
        },
        return: {
          carrier: "Royal Air Maroc", flightNumber: "AT801",
          departureAirport: "RAK", arrivalAirport: "LHR",
          departureTime: "2026-05-15T14:00:00Z", arrivalTime: "2026-05-15T17:30:00Z",
          durationMinutes: 210,
        },
      },
      price: { perPerson: 749, total: 1498, currency: "GBP" },
      tripType: "last-minute",
    },
  ],

  ANTALYA: [
    {
      packageId: "pkg_nc_an001",
      destinationCode: "ANTALYA",
      sourceMode: "live",
      deduplicationKey: "giata086_TK1964_TK1965_2026-04-18",
      hotel: {
        giataId: "giata086",
        name: "Rixos Premium Belek",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
        trustYou: { rating: 93, recommendationScore: 96, reviewCount: 5432 },
        amenities: ["Private beach", "26 pools", "8 restaurants", "Ultra all-inclusive", "Kids club"],
        location: "Belek, Antalya",
        lat: 36.863, lng: 31.063,
      },
      room: { roomType: "Standard Room Sea View", boardType: "All Inclusive" },
      flights: {
        outbound: {
          carrier: "Turkish Airlines", flightNumber: "TK1964",
          departureAirport: "LHR", arrivalAirport: "AYT",
          departureTime: "2026-04-18T07:30:00Z", arrivalTime: "2026-04-18T13:00:00Z",
          durationMinutes: 210,
        },
        return: {
          carrier: "Turkish Airlines", flightNumber: "TK1965",
          departureAirport: "AYT", arrivalAirport: "LHR",
          departureTime: "2026-04-25T14:00:00Z", arrivalTime: "2026-04-25T16:30:00Z",
          durationMinutes: 210,
        },
      },
      price: { perPerson: 999, total: 1998, currency: "GBP" },
      tripType: "hotel-flight",
    },
    {
      packageId: "pkg_nc_an002",
      destinationCode: "ANTALYA",
      sourceMode: "live",
      deduplicationKey: "giata087_EZY6001_EZY6002_2026-05-02",
      hotel: {
        giataId: "giata087",
        name: "Maxx Royal Belek Golf Resort",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
        trustYou: { rating: 96, recommendationScore: 98, reviewCount: 2134 },
        amenities: ["Golf courses", "Private beach", "7 pools", "10 restaurants", "Luxury spa"],
        location: "Belek, Antalya",
        lat: 36.867, lng: 31.076,
      },
      room: { roomType: "Junior Suite Garden View", boardType: "All Inclusive" },
      flights: {
        outbound: {
          carrier: "easyJet", flightNumber: "EZY6001",
          departureAirport: "LHR", arrivalAirport: "AYT",
          departureTime: "2026-05-02T06:00:00Z", arrivalTime: "2026-05-02T11:30:00Z",
          durationMinutes: 210,
        },
        return: {
          carrier: "easyJet", flightNumber: "EZY6002",
          departureAirport: "AYT", arrivalAirport: "LHR",
          departureTime: "2026-05-09T12:00:00Z", arrivalTime: "2026-05-09T14:30:00Z",
          durationMinutes: 210,
        },
      },
      price: { perPerson: 1599, total: 3198, currency: "GBP" },
      tripType: "round-trip",
    },
  ],

  SANTORINI: [
    {
      packageId: "pkg_nc_sa001",
      destinationCode: "SANTORINI",
      sourceMode: "live",
      deduplicationKey: "giata088_A3601_A3602_2026-04-20",
      hotel: {
        giataId: "giata088",
        name: "Katikies Hotel",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80",
        trustYou: { rating: 96, recommendationScore: 98, reviewCount: 987 },
        amenities: ["Caldera views", "3 infinity pools", "Gourmet restaurant", "Sunset terrace", "Cave suites"],
        location: "Oia, Santorini",
        lat: 36.462, lng: 25.375,
      },
      room: { roomType: "Cave Suite Caldera View", boardType: "Breakfast Included" },
      flights: {
        outbound: {
          carrier: "Aegean Airlines", flightNumber: "A3601",
          departureAirport: "LHR", arrivalAirport: "JTR",
          departureTime: "2026-04-20T08:30:00Z", arrivalTime: "2026-04-20T15:00:00Z",
          durationMinutes: 270,
        },
        return: {
          carrier: "Aegean Airlines", flightNumber: "A3602",
          departureAirport: "JTR", arrivalAirport: "LHR",
          departureTime: "2026-04-27T16:00:00Z", arrivalTime: "2026-04-27T19:30:00Z",
          durationMinutes: 270,
        },
      },
      price: { perPerson: 1699, total: 3398, currency: "GBP" },
      tripType: "individual-tour",
    },
    {
      packageId: "pkg_nc_sa002",
      destinationCode: "SANTORINI",
      sourceMode: "live",
      deduplicationKey: "giata089_EZY8001_EZY8002_2026-05-07",
      hotel: {
        giataId: "giata089",
        name: "Canaves Oia Suites",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80",
        trustYou: { rating: 97, recommendationScore: 99, reviewCount: 654 },
        amenities: ["Cave architecture", "Caldera pool", "Sunset lounge", "Private terraces", "Spa"],
        location: "Oia, Santorini",
        lat: 36.461, lng: 25.374,
      },
      room: { roomType: "Suite with Private Pool", boardType: "Breakfast Included" },
      flights: {
        outbound: {
          carrier: "easyJet", flightNumber: "EZY8001",
          departureAirport: "LHR", arrivalAirport: "JTR",
          departureTime: "2026-05-07T07:15:00Z", arrivalTime: "2026-05-07T13:45:00Z",
          durationMinutes: 270,
        },
        return: {
          carrier: "easyJet", flightNumber: "EZY8002",
          departureAirport: "JTR", arrivalAirport: "LHR",
          departureTime: "2026-05-14T14:15:00Z", arrivalTime: "2026-05-14T17:45:00Z",
          durationMinutes: 270,
        },
      },
      price: { perPerson: 2299, total: 4598, currency: "GBP" },
      tripType: "hotel-flight",
    },
  ],

  HURGHADA: [
    {
      packageId: "pkg_nc_hu001",
      destinationCode: "HURGHADA",
      sourceMode: "live",
      deduplicationKey: "giata090_MS719_MS720_2026-04-12",
      hotel: {
        giataId: "giata090",
        name: "Steigenberger Al Dau Beach Hotel",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&q=80",
        trustYou: { rating: 87, recommendationScore: 91, reviewCount: 3421 },
        amenities: ["Private beach", "3 pools", "Dive centre", "4 restaurants", "Water sports"],
        location: "Hurghada Marina, Hurghada",
        lat: 27.231, lng: 33.828,
      },
      room: { roomType: "Superior Double Sea View", boardType: "All Inclusive" },
      flights: {
        outbound: {
          carrier: "EgyptAir", flightNumber: "MS719",
          departureAirport: "LHR", arrivalAirport: "HRG",
          departureTime: "2026-04-12T08:00:00Z", arrivalTime: "2026-04-12T14:30:00Z",
          durationMinutes: 270,
        },
        return: {
          carrier: "EgyptAir", flightNumber: "MS720",
          departureAirport: "HRG", arrivalAirport: "LHR",
          departureTime: "2026-04-19T15:30:00Z", arrivalTime: "2026-04-19T19:30:00Z",
          durationMinutes: 240,
        },
      },
      price: { perPerson: 699, total: 1398, currency: "GBP" },
      tripType: "hotel-flight",
    },
    {
      packageId: "pkg_nc_hu002",
      destinationCode: "HURGHADA",
      sourceMode: "live",
      deduplicationKey: "giata091_TOM711_TOM712_2026-05-03",
      hotel: {
        giataId: "giata091",
        name: "Oberoi Sahl Hasheesh",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&q=80",
        trustYou: { rating: 94, recommendationScore: 97, reviewCount: 987 },
        amenities: ["Private peninsula", "Red Sea snorkelling", "Infinity pools", "Gourmet dining", "Spa"],
        location: "Sahl Hasheesh, Hurghada",
        lat: 27.155, lng: 33.845,
      },
      room: { roomType: "Lagoon Villa", boardType: "Breakfast Included" },
      flights: {
        outbound: {
          carrier: "TUI Airways", flightNumber: "TOM711",
          departureAirport: "LHR", arrivalAirport: "HRG",
          departureTime: "2026-05-03T09:00:00Z", arrivalTime: "2026-05-03T15:30:00Z",
          durationMinutes: 270,
        },
        return: {
          carrier: "TUI Airways", flightNumber: "TOM712",
          departureAirport: "HRG", arrivalAirport: "LHR",
          departureTime: "2026-05-10T16:30:00Z", arrivalTime: "2026-05-10T20:00:00Z",
          durationMinutes: 210,
        },
      },
      price: { perPerson: 1249, total: 2498, currency: "GBP" },
      tripType: "round-trip",
    },
  ],

  DUBROVNIK: [
    {
      packageId: "pkg_nc_du001",
      destinationCode: "DUBROVNIK",
      sourceMode: "live",
      deduplicationKey: "giata092_BA2633_BA2634_2026-04-17",
      hotel: {
        giataId: "giata092",
        name: "Villa Dubrovnik",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80",
        trustYou: { rating: 95, recommendationScore: 97, reviewCount: 876 },
        amenities: ["Private beach", "Adriatic views", "Sea-level pool", "Gourmet restaurant", "Boat service"],
        location: "Old Town, Dubrovnik",
        lat: 42.640, lng: 18.108,
      },
      room: { roomType: "Deluxe Room Sea View", boardType: "Breakfast Included" },
      flights: {
        outbound: {
          carrier: "British Airways", flightNumber: "BA2633",
          departureAirport: "LHR", arrivalAirport: "DBV",
          departureTime: "2026-04-17T07:00:00Z", arrivalTime: "2026-04-17T11:00:00Z",
          durationMinutes: 180,
        },
        return: {
          carrier: "British Airways", flightNumber: "BA2634",
          departureAirport: "DBV", arrivalAirport: "LHR",
          departureTime: "2026-04-24T12:00:00Z", arrivalTime: "2026-04-24T14:00:00Z",
          durationMinutes: 180,
        },
      },
      price: { perPerson: 1099, total: 2198, currency: "GBP" },
      tripType: "individual-tour",
    },
    {
      packageId: "pkg_nc_du002",
      destinationCode: "DUBROVNIK",
      sourceMode: "live",
      deduplicationKey: "giata093_EZY8801_EZY8802_2026-05-08",
      hotel: {
        giataId: "giata093",
        name: "Rixos Premium Dubrovnik",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
        trustYou: { rating: 89, recommendationScore: 93, reviewCount: 1234 },
        amenities: ["Clifftop location", "Infinity pool", "Private beach", "Ultra all-inclusive", "Spa"],
        location: "Srebreno, Dubrovnik",
        lat: 42.618, lng: 18.079,
      },
      room: { roomType: "Standard Room Sea View", boardType: "All Inclusive" },
      flights: {
        outbound: {
          carrier: "easyJet", flightNumber: "EZY8801",
          departureAirport: "LHR", arrivalAirport: "DBV",
          departureTime: "2026-05-08T06:30:00Z", arrivalTime: "2026-05-08T10:30:00Z",
          durationMinutes: 180,
        },
        return: {
          carrier: "easyJet", flightNumber: "EZY8802",
          departureAirport: "DBV", arrivalAirport: "LHR",
          departureTime: "2026-05-15T11:30:00Z", arrivalTime: "2026-05-15T13:30:00Z",
          durationMinutes: 180,
        },
      },
      price: { perPerson: 1349, total: 2698, currency: "GBP" },
      tripType: "hotel-flight",
    },
  ],

  COSTARICA: [
    {
      packageId: "pkg_nc_cr001",
      destinationCode: "COSTARICA",
      sourceMode: "live",
      deduplicationKey: "giata094_AA947_AA948_2026-04-18",
      hotel: {
        giataId: "giata094",
        name: "Nayara Springs",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800&q=80",
        trustYou: { rating: 98, recommendationScore: 99, reviewCount: 654 },
        amenities: ["Arenal volcano views", "Private plunge pools", "Rainforest", "Gourmet dining", "Spa"],
        location: "Arenal Volcano, La Fortuna",
        lat: 10.472, lng: -84.699,
      },
      room: { roomType: "Spring Villa", boardType: "All Inclusive" },
      flights: {
        outbound: {
          carrier: "American Airlines", flightNumber: "AA947",
          departureAirport: "LHR", arrivalAirport: "SJO",
          departureTime: "2026-04-18T10:15:00Z", arrivalTime: "2026-04-18T18:45:00Z",
          durationMinutes: 630,
        },
        return: {
          carrier: "American Airlines", flightNumber: "AA948",
          departureAirport: "SJO", arrivalAirport: "LHR",
          departureTime: "2026-04-25T20:00:00Z", arrivalTime: "2026-04-26T12:30:00Z",
          durationMinutes: 630,
        },
      },
      price: { perPerson: 2899, total: 5798, currency: "GBP" },
      tripType: "round-trip",
    },
  ],

  JAMAICA: [
    {
      packageId: "pkg_nc_ja001",
      destinationCode: "JAMAICA",
      sourceMode: "live",
      deduplicationKey: "giata095_VS63_VS64_2026-04-22",
      hotel: {
        giataId: "giata095",
        name: "GoldenEye Hotel",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80",
        trustYou: { rating: 95, recommendationScore: 97, reviewCount: 432 },
        amenities: ["Ian Fleming's estate", "Private cove", "Lagoon pool", "Reggae bar", "Snorkelling"],
        location: "Oracabessa Bay, Jamaica",
        lat: 18.399, lng: -76.953,
      },
      room: { roomType: "Lagoon Villa", boardType: "All Inclusive" },
      flights: {
        outbound: {
          carrier: "Virgin Atlantic", flightNumber: "VS63",
          departureAirport: "LHR", arrivalAirport: "MBJ",
          departureTime: "2026-04-22T11:00:00Z", arrivalTime: "2026-04-22T16:30:00Z",
          durationMinutes: 570,
        },
        return: {
          carrier: "Virgin Atlantic", flightNumber: "VS64",
          departureAirport: "MBJ", arrivalAirport: "LHR",
          departureTime: "2026-04-29T18:00:00Z", arrivalTime: "2026-04-30T07:30:00Z",
          durationMinutes: 540,
        },
      },
      price: { perPerson: 1799, total: 3598, currency: "GBP" },
      tripType: "hotel-flight",
    },
  ],

  HOCHIMINH: [
    {
      packageId: "pkg_nc_hcm001",
      destinationCode: "HOCHIMINH",
      sourceMode: "live",
      deduplicationKey: "giata096_VN56_VN57_2026-04-15",
      hotel: {
        giataId: "giata096",
        name: "Park Hyatt Saigon",
        category: 5,
        mainImage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
        trustYou: { rating: 94, recommendationScore: 97, reviewCount: 2341 },
        amenities: ["Colonial architecture", "Rooftop pool", "Opera house views", "3 restaurants", "Spa"],
        location: "District 1, Ho Chi Minh City",
        lat: 10.777, lng: 106.703,
      },
      room: { roomType: "Park Room", boardType: "Breakfast Included" },
      flights: {
        outbound: {
          carrier: "Vietnam Airlines", flightNumber: "VN56",
          departureAirport: "LHR", arrivalAirport: "SGN",
          departureTime: "2026-04-15T23:00:00Z", arrivalTime: "2026-04-16T16:30:00Z",
          durationMinutes: 750,
        },
        return: {
          carrier: "Vietnam Airlines", flightNumber: "VN57",
          departureAirport: "SGN", arrivalAirport: "LHR",
          departureTime: "2026-04-22T00:30:00Z", arrivalTime: "2026-04-22T08:00:00Z",
          durationMinutes: 750,
        },
      },
      price: { perPerson: 1099, total: 2198, currency: "GBP" },
      tripType: "individual-tour",
    },
  ],
};

// Backward-compatible alias for any code that still imports NON_CACHED_PACKAGES
// (kept for safety during transition — useUnifiedSearch now uses the map above)
export const NON_CACHED_PACKAGES = NON_CACHED_PACKAGES_BY_DESTINATION.PHUKET;
