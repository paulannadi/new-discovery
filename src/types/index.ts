// ─────────────────────────────────────────────────────────────────────────────
// Unified Package Types
//
// These types describe a package (hotel + flights) as it comes from the
// unified supply layer — either from the pre-built cache (sourceMode: 'cache')
// or from a live supplier query (sourceMode: 'live').
//
// NOTE: There is already a `FlightLeg` type in App.tsx used for the flight
// search form. This is a DIFFERENT type — `PackageFlightLeg` — that describes
// one leg of a package's pre-booked flights (carrier, times, airports).
// ─────────────────────────────────────────────────────────────────────────────

// One leg of a flight that's bundled inside a package.
// Different from the FlightLeg type in App.tsx (which is a search form leg).
export interface PackageFlightLeg {
  carrier: string;          // Airline name, e.g. "British Airways"
  flightNumber: string;     // e.g. "BA2491"
  departureAirport: string; // IATA code, e.g. "LHR"
  arrivalAirport: string;   // IATA code, e.g. "CUN"
  departureTime: string;    // ISO 8601, e.g. "2026-04-28T11:00:00Z"
  arrivalTime: string;      // ISO 8601
  durationMinutes: number;  // Total flight time
}

// One entry in a hotel's rate calendar (cache-only).
// Shows what dates are available and at what price.
export interface RateCalendarEntry {
  departureDate: string;     // "YYYY-MM-DD"
  pricePerPerson: number;    // in the package's currency
  available: boolean;
}

// A single holiday package result — combining hotel, room, flights, and price.
// This is the core data model for the HolidayListPage and HotelDetailModal.
export interface UnifiedPackage {
  packageId: string;
  // Where this result came from — drives the modal UX (calendar vs details)
  sourceMode: 'cache' | 'live';
  // Used for deduplication when merging cached + live results.
  // Format: `${giataId}_${outboundFlight}_${returnFlight}_${departureDate}`
  deduplicationKey: string;

  hotel: {
    giataId: string;
    name: string;
    category: number;       // Star rating (1–5)
    mainImage: string;
    trustYou: {
      rating: number;             // e.g. 87 (out of 100)
      recommendationScore: number; // e.g. 93
      reviewCount: number;
    };
    amenities: string[];
    location: string;       // e.g. "Hotel Zone, Cancún"
  };

  room: {
    roomType: string;   // e.g. "Oceanfront Junior Suite"
    boardType: string;  // e.g. "All Inclusive"
  };

  flights: {
    outbound: PackageFlightLeg;
    return: PackageFlightLeg;
  };

  price: {
    perPerson: number;
    total: number;
    currency: string; // "GBP", "USD", etc.
  };

  // Rate calendar — only present for cache-sourced packages.
  // Shows which departure dates are bookable and at what price.
  rateCalendar?: RateCalendarEntry[];

  // The category of holiday this package represents.
  // Used to show a badge on PackageCard and to filter the holiday list.
  // Optional so existing packages without a tag still work fine.
  tripType?: "hotel-flight" | "group-tour" | "individual-tour" | "round-trip" | "last-minute";
}
