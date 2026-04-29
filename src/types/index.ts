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
// This is the core data model for the HolidayListPage and PackageDetailPage.
export interface UnifiedPackage {
  packageId: string;
  // Where this result came from — drives the modal UX (calendar vs details)
  sourceMode: 'cache' | 'live';
  // Used for deduplication when merging cached + live results.
  // Format: `${giataId}_${outboundFlight}_${returnFlight}_${departureDate}`
  deduplicationKey: string;

  // Which destination this package belongs to — matches a code in DESTINATIONS.
  // Used by useUnifiedSearch to filter results to the searched destination.
  destinationCode?: string;

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
    // Coordinates for placing this specific hotel as a pin on the map.
    // Should be set to the hotel's real-world location within the destination.
    lat?: number;
    lng?: number;
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

// ─────────────────────────────────────────────────────────────────────────────
// Tour Types
//
// A Tour is a multi-stop, guided journey (group or individual).
// Unlike a UnifiedPackage (one hotel + flights), a tour has multiple
// destination stops connected by transfers, with accommodation and
// activities at each stop.
// ─────────────────────────────────────────────────────────────────────────────

// A single activity at a destination stop (e.g. "Excursion to Zermatt")
export interface TourActivity {
  date: string;          // Display date, e.g. "Fri, Apr 04"
  name: string;          // e.g. "Excursion to Zermatt Incl."
  description: string;   // Short description shown below the name
  image?: string;        // Optional photo
}

// The hotel staying at a given stop
export interface TourAccommodation {
  hotelName: string;
  stars: number;
  image?: string;
  checkIn: string;       // Display string, e.g. "Apr 03"
  checkOut: string;      // Display string, e.g. "Apr 05"
  checkInISO: string;    // ISO date "YYYY-MM-DD" for machine use
  checkOutISO: string;
  roomType: string;      // e.g. "Double Room"
  boardType: string;     // e.g. "Buffet breakfast"
}

// One destination stop in the tour itinerary
export interface TourStop {
  destinationName: string;   // e.g. "Lucerne"
  dateRange: string;         // Display string, e.g. "Mar 31 – Apr 01"
  nights: number;
  description: string;       // 1–2 sentence destination blurb
  accommodation: TourAccommodation;
  activities: TourActivity[];
  // Coordinates so we can place this stop on the LeafletMap
  lat?: number;
  lng?: number;
}

// A transfer segment between two stops (e.g. a scenic train journey)
export interface TourTransfer {
  from: string;          // e.g. "Lucerne"
  to: string;            // e.g. "Interlaken"
  date: string;          // Display string, e.g. "Apr 01, Tour & Transfer"
  mode: string;          // e.g. "Tour & Transfer"
  description?: string;  // e.g. "2h Panoramic journey on the Luzern-Interlaken Express"
  image?: string;
}

// One day entry in the day-by-day itinerary shown on TourDetailPage.
export interface TourDayItem {
  type: "highlight" | "hotel" | "transport";
  label: string;        // Bold title, e.g. "Scenic train to Interlaken"
  description?: string; // Optional detail line shown in grey
}

export interface TourDay {
  dayNumber: number;
  title: string;        // e.g. "Arrival in Lucerne"
  location?: string;    // e.g. "Ubud" — shown right-aligned in the day header
  items: TourDayItem[];
  image?: string;       // Optional day photo
}

// Quick-fact attribute chip shown below the hero.
// iconKey maps to a Lucide icon in the component.
export interface TourAttribute {
  label: string;
  iconKey: "users" | "languages" | "activity" | "calendar-check";
}

// The top-level Tour object — used for both TourCard (list) and TourDetailPage
export interface Tour {
  tourId: string;
  title: string;
  subtitle: string;
  tripType: "group-tour" | "individual-tour";
  duration: number;
  highlights: string[];    // Used on TourCard chips + Highlights info tab
  mainImage: string;
  price: {
    perPerson: number;
    total: number;
    currency: string;
    paidBefore: number;
    paidAtDestination: number;
  };
  startDate: string;       // Display string, e.g. "Mar 31, 2026"
  endDate: string;
  adults: number;

  // ── Detail page fields ─────────────────────────────────────────────────
  locationsLabel: string;  // e.g. "Lucerne · Interlaken · Brig · Chur"
  gallery: string[];       // Photos for the gallery section
  attributes: TourAttribute[];  // Quick facts (group tour, language, level, age)
  days: TourDay[];         // Full day-by-day itinerary
  included: string[];      // "Included" tab content
  excluded: string[];      // "Excluded" tab content

  // ── TourCard fields ────────────────────────────────────────────────────
  stops: TourStop[];       // Drives the route breadcrumb on TourCard
  transfers: TourTransfer[];

  // Which destination codes this tour is relevant for.
  // Used to filter tours in HolidayListPage when the user searches a specific destination.
  // If empty or undefined, the tour is shown for all destinations.
  destinationCodes?: string[];
}
