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

// Quick-fact attribute shown in the Overview tab.
// title = category label (e.g. "Duration"), value = the actual fact (e.g. "12 days").
// iconKey maps to a Lucide icon in the component.
export interface TourAttribute {
  title: string;
  value: string;
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

  // Optional hero video shown on the detail page (Pexels-sourced).
  // Plays when the user taps the play button on the main image.
  videoUrl?: string;

  // Optional pickup points for coach / bus tours. When set, the booking widget
  // on TourDetailPage swaps the "Hotel preference" selector for a "Departure point"
  // selector populated with these options.
  departurePoints?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity Types
//
// An "Activity" is an experience-led starting point for an itinerary —
// e.g. a cruise, a multi-day tour, a walking tour, a bike tour, a river cruise.
// Unlike Tour (which is always a multi-stop guided journey), an Activity can
// be a single experience (a river cruise) or a multi-day immersive trip
// (a bicycle tour). The detail page renders type-specific sections (ports +
// cabins for cruises, day-by-day itinerary for multi-day tours, route + stats
// for walking/bicycle) on top of the shared overview/highlights/included blocks.
// ─────────────────────────────────────────────────────────────────────────────

// The shape of activity the user is looking at — drives icons, badges, and
// which sections appear on the detail page.
export type ActivityType =
  | "cruise-ship"
  | "river-cruise"
  | "multi-day-tour"
  | "walking-tour"
  | "bicycle-tour"
  | "safari"
  | "expedition";

// One port-of-call on a cruise itinerary.
// Displayed in the "Ports" section on the detail page.
export interface ActivityPort {
  name: string;          // e.g. "Bergen, Norway"
  day: number;           // Which day of the cruise this stop is
  arrives?: string;      // Display string, e.g. "08:00"
  departs?: string;      // Display string, e.g. "17:00"
  description?: string;  // Optional 1–2 sentence blurb
}

// A bookable cabin on a cruise/river cruise.
// Displayed in the "Cabins" section on the detail page.
export interface ActivityCabin {
  name: string;             // e.g. "Balcony Stateroom"
  pricePerPerson: number;   // in the activity's currency
  image: string;
  description?: string;     // 1-line cabin features summary
  capacity?: number;        // max guests, e.g. 2
}

// The top-level Activity object — used for ActivityCard, search, and the
// ActivityDetailPage. Optional blocks (cruise / itineraryDays / routeStops /
// difficulty / distanceKm) are only set for relevant activity types.
export interface Activity {
  activityId: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  mainImage: string;
  gallery: string[];
  videoUrl?: string;

  // Free-text location label, e.g. "Norwegian Fjords",
  // "Tuscany, Italy", "Amsterdam to Basel".
  location: string;

  durationDays: number;
  startDate: string;       // Display string, e.g. "Jun 12, 2026"
  endDate: string;         // Display string, e.g. "Jun 19, 2026"

  price: { perPerson: number; total: number; currency: string };
  rating: { score: number; reviewCount: number };

  highlights: string[];
  included: string[];
  excluded: string[];

  // Quick-fact attribute pills shown in the detail Overview section.
  // Reuses the same iconKey union as TourAttribute so the AttributeIcon
  // component can render both tour and activity attributes.
  attributes: TourAttribute[];

  // ── Type-specific blocks ────────────────────────────────────────────────
  // Only one of these will be present, based on `type`. The detail page reads
  // the populated block to decide which sticky-tab sections to render.

  // Present for type === "cruise-ship" or "river-cruise"
  cruise?: {
    ship: string;                   // e.g. "MS Nordstjernen"
    ports: ActivityPort[];
    cabinTypes: ActivityCabin[];
    deckPlanImage?: string;
  };

  // Present for type === "multi-day-tour" / "safari" / "expedition"
  // Reuses the existing TourDay shape so we can share the day-by-day component.
  itineraryDays?: TourDay[];

  // Present for activities with a geographic route (cruises, multi-day tours,
  // walking/bicycle). Reuses TourStop so we can share the Leaflet route map.
  routeStops?: TourStop[];

  // Present for type === "walking-tour" / "bicycle-tour"
  difficulty?: "Easy" | "Moderate" | "Challenging";
  distanceKm?: number;
}

// Holds the search criteria filled in on the Activities search form.
// Carried forward so ActivityListPage starts pre-populated.
export interface ActivitySearchCriteria {
  // Free-text destination / region (e.g. "Norway", "Anywhere").
  destination: string;
  // Multi-select of activity types to include. Empty array = all types.
  activityTypes: ActivityType[];
  // Date range (optional — undefined means "Any time").
  // Using a Date tuple instead of react-day-picker's DateRange so this file
  // stays free of UI library imports.
  dateFrom?: string;       // ISO "YYYY-MM-DD"
  dateTo?: string;         // ISO "YYYY-MM-DD"
  travellers: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cruise Types
//
// A Cruise is a ship-based voyage with a fixed itinerary of ports. Unlike
// Activity (which covers many experience types), Cruise is a dedicated
// first-class entity with its own search, list, and detail pages.
// ─────────────────────────────────────────────────────────────────────────────

// The cruise line operating the ship
export type CruiseLine =
  | "MSC Cruises"
  | "Royal Caribbean"
  | "Disney Cruise Line"
  | "Norwegian Cruise Line"
  | "Celebrity Cruises"
  | "Costa Cruises"
  | "TUI Cruises";

// Regions for browsing/filtering
export type CruiseRegion =
  | "Caribbean"
  | "Mediterranean"
  | "Northern Europe"
  | "Alaska"
  | "Asia"
  | "South Pacific"
  | "Transatlantic";

// One port stop on the itinerary
export interface CruisePort {
  name: string;           // e.g. "Barcelona, Spain"
  day: number;            // Day number in the cruise (1-based)
  arrives?: string;       // "08:00" — undefined for embarkation port
  departs?: string;       // "17:00" — undefined for disembarkation port
  isSeaDay?: boolean;     // true for "At Sea" days
  description?: string;   // 1-2 sentence port blurb
  lat?: number;           // For map pin placement
  lng?: number;
}

// A bookable cabin category
export interface CruiseCabin {
  id: string;
  name: string;             // e.g. "Balcony Stateroom"
  category: "Interior" | "Ocean View" | "Balcony" | "Suite";
  pricePerPerson: number;
  image: string;
  description?: string;     // 1-line feature summary
  capacity: number;         // max guests
  sqMeters?: number;        // cabin size
}

// One available departure date with pricing
export interface CruiseDeparture {
  date: string;             // ISO "YYYY-MM-DD"
  pricePerPerson: number;   // Cheapest cabin for this date
  available: boolean;
}

// The top-level Cruise object
export interface Cruise {
  cruiseId: string;
  cruiseLine: CruiseLine;
  shipName: string;
  title: string;              // e.g. "Western Mediterranean Explorer"
  subtitle: string;           // 1-2 sentence description
  region: CruiseRegion;
  route: string;              // e.g. "Barcelona → Marseille → Rome → Naples → Barcelona"

  mainImage: string;
  gallery: string[];
  shipImage?: string;         // Photo of the ship itself

  durationNights: number;
  departurePort: string;      // e.g. "Barcelona, Spain"

  // Next available departure (for card display)
  nextDeparture: string;      // Display string e.g. "Jul 12, 2026"
  departures: CruiseDeparture[];  // All available dates

  price: {
    fromPerPerson: number;    // Cheapest starting price
    currency: string;
  };

  rating: { score: number; reviewCount: number };

  // Itinerary
  ports: CruisePort[];

  // Cabin options
  cabinTypes: CruiseCabin[];

  // Content sections
  highlights: string[];
  included: string[];
  excluded: string[];

  // Ship amenities shown as pills
  shipAmenities: string[];

  // For map display — use first/last port coordinates or route center
  lat?: number;
  lng?: number;
}

// Search criteria from the Cruises tab search form
export interface CruiseSearchCriteria {
  region: CruiseRegion | "";
  cruiseLine: CruiseLine | "";
  departureMonth: string;       // "YYYY-MM" or "" for any
  durationRange: "any" | "short" | "week" | "long";  // any / 2-5 / 6-9 / 10+
  passengers: number;
}
