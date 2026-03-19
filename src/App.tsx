import { useState } from "react";
import DiscoveryPage from "./modules/smartPlanner/pages/DiscoveryPage";
import HotelListPage from "./modules/smartPlanner/pages/HotelListPage";
import HotelDetailPage from "./modules/smartPlanner/pages/HotelDetailPage";
import HolidayListPage from "./modules/smartPlanner/pages/HolidayListPage";
import PackageDetailPage from "./modules/smartPlanner/pages/PackageDetailPage";
import FlightListPage from "./modules/smartPlanner/pages/FlightListPage";
import SmartPlannerPage, {
  type StartingContext,
} from "./modules/smartPlanner/pages/SmartPlannerPage";
import type { UnifiedPackage } from "./types";
import { Toaster } from "sonner";
import { DateRange } from "react-day-picker";
import { format, addDays } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type RoomConfig = {
  id: number;
  adults: number;
  children: number;
};

// Holds the search criteria filled in on the Hotels search form.
// We carry this forward so the HotelListPage starts pre-populated.
type SearchCriteria = {
  location: string;
  dateRange: DateRange | undefined;
  rooms: RoomConfig[];
};

// Holds the search criteria filled in on the Holidays search form.
// Carried forward so HolidayListPage starts pre-populated.
export type HolidaySearchCriteria = {
  from: string;
  to: string;
  // Whether the destination has pre-cached supply (affects calendar + loading UX)
  isCachedDestination: boolean;
  // "specific" = exact date range; "flexible" = one or more whole months (cache only)
  dateMode: "specific" | "flexible";
  dateRange: DateRange | undefined;
  // ISO month strings "YYYY-MM" selected in flexible mode
  selectedMonths: string[];
  nights: number;
  adults: number;
  children: number;
};

// ── FLIGHT SEARCH TYPES ──────────────────────────────────────────────────────

// One leg of a flight search (used for both round trip and multi-city).
// Round trip uses exactly 2 legs. Multi-city uses 2–6 legs.
export type FlightLeg = {
  id: number;
  from: string;
  to: string;
  date: Date | undefined;
};

// Everything the user filled in on the Flights search form.
// Passed to FlightListPage so it can show the right results.
export type FlightSearchCriteria = {
  tripType: "roundtrip" | "multicity";
  legs: FlightLeg[];
  adults: number;
  children: number;
  cabinClass: "economy" | "premium-economy" | "business" | "first";
};

// One flight result card shown on the FlightListPage.
export type FlightOption = {
  id: string;
  airline: string;       // Full name: "British Airways"
  airlineCode: string;   // 2-letter code shown as a badge: "BA"
  departure: string;     // "08:30"
  arrival: string;       // "20:15"
  duration: string;      // "13h 45m"
  stops: "Direct" | "1 stop" | "2 stops";
  stopInfo?: string;     // "via Dubai" — optional extra detail
  price: number;         // per person in USD
  badge?: "Best" | "Cheapest" | "Fastest";
};

// A leg that the user has finished choosing — the search leg + the chosen flight option.
export type SelectedFlightLeg = {
  leg: FlightLeg;
  option: FlightOption;
};

// Represents one holiday package — a bundled flight + hotel deal.
// Shared between HolidayListPage (card) and HolidayDetailPage (full detail).
export type HolidayPackage = {
  id: number;
  destination: string;
  country: string;
  flag: string;
  image: string;
  hotelName: string;
  hotelStars: number;
  rating: number;
  reviewLabel: string;
  reviewCount: number;
  flightFrom: string;
  flightFromCode: string;
  flightToCode: string;
  flightAirline: string;
  flightStops: string;
  flightDuration: string;
  nights: number;
  boardType: string;
  price: string;
  priceNum: number; // used for sorting
  badge?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// App
//
// This is the top-level component. It manages which screen is visible
// and passes data between screens as props.
//
//   [Discovery] ──Hotels──►  [HotelList] ──select hotel──►  [HotelDetail] ──book──►  [SmartPlanner]
//   [Discovery] ──Tours──────────────────────────────────►  [SmartPlanner]
//   [Discovery] ──Flights────────────────────────────────►  [SmartPlanner]
//   [Discovery] ──Holidays──► [HolidayList] ──select──► [HolidayDetail] ──► [SmartPlanner]
//   [Discovery] ──AI Planner─────────────────────────────►  [SmartPlanner]
//
//   Back stack for holidays: SmartPlanner → HolidayDetail → HolidayList → Discovery
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  // Which screen is currently visible?
  const [currentPage, setCurrentPage] = useState<
    "discovery" | "hotel-list" | "hotel-detail" | "holiday-list" | "package-detail" | "flight-results" | "smart-planner"
  >("discovery");

  // The "how did you get here" context passed into SmartPlanner.
  // It tells SmartPlanner which product(s) to pre-load in the itinerary.
  const [startingContext, setStartingContext] = useState<StartingContext | null>(null);

  // The search criteria from the Hotels tab — carried forward so
  // HotelListPage starts with the destination and dates pre-filled.
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    location: "",
    dateRange: undefined,
    rooms: [{ id: 1, adults: 2, children: 0 }],
  });

  // The hotel the user clicked on HotelListPage — held here so we can
  // pass it into HotelDetailPage for room selection.
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);

  // Where should the "Back" button on HotelDetailPage go?
  // "hotel-list" when arriving via the normal search flow.
  // "discovery" when arriving by clicking a hotel card directly on DiscoveryPage.
  const [hotelDetailBackPage, setHotelDetailBackPage] = useState<"hotel-list" | "discovery">("hotel-list");

  // The search criteria from the Holidays tab — carried forward so
  // HolidayListPage starts with all fields pre-filled.
  const [holidaySearchCriteria, setHolidaySearchCriteria] = useState<HolidaySearchCriteria>({
    from: "",
    to: "",
    isCachedDestination: false,
    dateMode: "specific",
    dateRange: undefined,
    selectedMonths: [],
    nights: 7,
    adults: 2,
    children: 0,
  });

  // The unified package (hotel + flights bundle) the user selected on HolidayListPage —
  // carried into the new PackageDetailPage full-page experience.
  const [selectedUnifiedPackage, setSelectedUnifiedPackage] = useState<UnifiedPackage | null>(null);

  // ── FLIGHT search state ───────────────────────────────────────────────────
  // What the user searched for — passed to FlightListPage as read-only criteria.
  const [flightSearchCriteria, setFlightSearchCriteria] = useState<FlightSearchCriteria | null>(null);
  // Which leg the user is currently picking a flight for (0 = first leg).
  const [currentFlightLegIndex, setCurrentFlightLegIndex] = useState(0);
  // Legs the user has already chosen — builds up as the user selects flights.
  const [selectedFlightLegs, setSelectedFlightLegs] = useState<SelectedFlightLeg[]>([]);

  // ── HOTELS tab: search → HotelListPage ──────────────────────────────────
  // Called when the user submits the Hotel search form on Discovery.
  const handleHotelSearch = (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
    setCurrentPage("hotel-list");
    window.scrollTo(0, 0);
  };

  // ── HotelListPage: click "Select" on a hotel → HotelDetailPage ──────────
  // Save the chosen hotel and navigate to the room selection step.
  // (SmartPlanner is reached only after the user picks rooms on HotelDetailPage.)
  const handleHotelSelect = (hotel: any) => {
    setHotelDetailBackPage("hotel-list");
    setSelectedHotel(hotel);
    setCurrentPage("hotel-detail");
    window.scrollTo(0, 0);
  };

  // ── DiscoveryPage hotel card → HotelDetailPage (skip the list) ───────────
  // Called when the user clicks one of the "Top hotel picks" cards directly.
  // We set default dates (check-in ~1 month away, 7-night stay) so the detail
  // page shows realistic pre-filled dates without requiring a search first.
  const handleHotelDirectSelect = (hotel: any) => {
    const checkIn = addDays(new Date(), 30);
    const checkOut = addDays(checkIn, 7);
    setSearchCriteria({
      location: hotel.location,
      dateRange: { from: checkIn, to: checkOut },
      rooms: [{ id: 1, adults: 2, children: 0 }],
    });
    setHotelDetailBackPage("discovery");
    setSelectedHotel(hotel);
    setCurrentPage("hotel-detail");
    window.scrollTo(0, 0);
  };

  // ── HotelDetailPage: user finishes room selection → SmartPlanner ─────────
  // Now we have the full hotel + room choices. Build the StartingContext
  // and send the user to SmartPlanner.
  const handleHotelDetailBook = (hotel: any) => {
    // Work out how many nights from the date range (default to 7 if not set)
    const nights =
      searchCriteria.dateRange?.from && searchCriteria.dateRange?.to
        ? Math.max(
            1,
            Math.round(
              (searchCriteria.dateRange.to.getTime() -
                searchCriteria.dateRange.from.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : 7;

    setStartingContext({
      type: "hotel",
      hotel: {
        name: hotel.name,
        image: hotel.image,
        stars: hotel.stars,
        rating: hotel.rating,
        reviewCount: hotel.reviewCount,
        location: hotel.location,
        price: hotel.price,
        // Pass the actual dates from the Hotels search form so SmartPlanner
        // can display the real check-in / check-out dates rather than a generic guess.
        checkIn: searchCriteria.dateRange?.from
          ? format(searchCriteria.dateRange.from, "yyyy-MM-dd")
          : undefined,
        checkOut: searchCriteria.dateRange?.to
          ? format(searchCriteria.dateRange.to, "yyyy-MM-dd")
          : undefined,
      },
      nights,
    });
    setCurrentPage("smart-planner");
    window.scrollTo(0, 0);
  };

  // ── TOURS tab: click a tour card → SmartPlanner ──────────────────────────
  // Called when the user clicks any tour card in the Discovery tours sections.
  const handleTourSelect = (tour: any) => {
    setStartingContext({
      type: "tour",
      tour: {
        country: tour.country,
        flag: tour.flag,
        title: tour.title,
        desc: tour.desc,
        duration: tour.duration,
        price: tour.price,
        image: tour.image,
      },
    });
    setCurrentPage("smart-planner");
    window.scrollTo(0, 0);
  };

  // ── FLIGHTS tab: submit search form → FlightListPage ────────────────────
  // Saves the full search criteria (trip type + all legs + passengers) and
  // navigates to the results page. The user will pick one flight per leg.
  const handleFlightSearch = (criteria: FlightSearchCriteria) => {
    setFlightSearchCriteria(criteria);
    setSelectedFlightLegs([]);      // clear any previous selections
    setCurrentFlightLegIndex(0);    // always start with leg 0
    setCurrentPage("flight-results");
    window.scrollTo(0, 0);
  };

  // ── FlightListPage: user selects a flight for one leg ────────────────────
  // If there are more legs to pick, advance to the next one.
  // If this was the last leg, build the StartingContext and go to SmartPlanner.
  const handleFlightLegSelect = (option: FlightOption) => {
    const currentLeg = flightSearchCriteria!.legs[currentFlightLegIndex];
    const newSelected = [...selectedFlightLegs, { leg: currentLeg, option }];
    const totalLegs = flightSearchCriteria!.legs.length;

    if (currentFlightLegIndex < totalLegs - 1) {
      // More legs remain — stay on FlightListPage, show next leg's results.
      setSelectedFlightLegs(newSelected);
      setCurrentFlightLegIndex((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      // All legs chosen — build the context and head to SmartPlanner.
      const first = newSelected[0];
      const last = newSelected[newSelected.length - 1];
      setStartingContext({
        type: "flight",
        flight: {
          from: first.leg.from || "London",
          to: last.leg.to || "Destination",
          stops: first.option.stops,
          duration: first.option.duration,
          airline: first.option.airline,
          price: `$${first.option.price}`,
          // Pass all legs (both round-trip and multi-city) so SmartPlanner
          // can show one FlightCard per leg with the correct date.
          legs: newSelected.map((s) => ({
            from: s.leg.from,
            to: s.leg.to,
            date: s.leg.date ? format(s.leg.date, "d MMM") : "",       // display: "9 Apr"
            dateISO: s.leg.date ? format(s.leg.date, "yyyy-MM-dd") : "", // machine-readable: "2026-04-09"
            airline: s.option.airline,
            duration: s.option.duration,
            stops: s.option.stops,
          })),
        },
      });
      setSelectedFlightLegs([]);
      setCurrentFlightLegIndex(0);
      setCurrentPage("smart-planner");
      window.scrollTo(0, 0);
    }
  };

  // ── HOLIDAYS tab: submit search → HolidayListPage ────────────────────────
  // Saves the search criteria and navigates to the results list.
  const handleHolidaySearch = (criteria: HolidaySearchCriteria) => {
    setHolidaySearchCriteria(criteria);
    setCurrentPage("holiday-list");
    window.scrollTo(0, 0);
  };

  // ── HolidayListPage: refine search in-place ────────────────────────────────
  // Called when the user edits criteria on the list page — stays on the list.
  const handleRefineHolidaySearch = (criteria: HolidaySearchCriteria) => {
    setHolidaySearchCriteria(criteria);
  };

  // ── HolidayListPage: click a UnifiedPackage card → PackageDetailPage ────────
  // Saves the selected package and navigates to the full-page detail experience.
  const handleUnifiedPackageSelect = (pkg: UnifiedPackage) => {
    setSelectedUnifiedPackage(pkg);
    setCurrentPage("package-detail");
    window.scrollTo(0, 0);
  };

  // ── PackageDetailPage: click "Personalise Your Holiday" → SmartPlanner ────
  // Builds the holiday StartingContext from the UnifiedPackage and chosen date.
  const handlePackageDetailBook = (pkg: UnifiedPackage, selectedDate: string) => {
    setStartingContext({
      type: "holiday",
      pkg: {
        destination: pkg.hotel.location,
        hotelName: pkg.hotel.name,
        hotelStars: pkg.hotel.category,
        flightFrom: pkg.flights.outbound.departureAirport,
        flightAirline: pkg.flights.outbound.carrier,
        flightDuration: `${Math.floor(pkg.flights.outbound.durationMinutes / 60)}h ${pkg.flights.outbound.durationMinutes % 60}m`,
        nights: holidaySearchCriteria.nights,
        checkIn: selectedDate,
      },
    });
    setCurrentPage("smart-planner");
    window.scrollTo(0, 0);
  };

  // ── HolidayDetailPage: click "Book this holiday" → SmartPlanner ──────────
  // Builds the holiday StartingContext from the chosen package and room.
  const handleHolidayBook = (pkg: HolidayPackage) => {
    setStartingContext({
      type: "holiday",
      pkg: {
        destination: pkg.destination,
        hotelName: pkg.hotelName,
        hotelStars: pkg.hotelStars,
        flightFrom: pkg.flightFrom,
        flightAirline: pkg.flightAirline,
        flightDuration: pkg.flightDuration,
        // Pass the actual nights from the package card so SmartPlanner
        // shows the right duration (e.g. 10 nights, not a hardcoded 7).
        nights: pkg.nights,
        // Pass the travel date from the Holidays search form if one was entered.
        checkIn: holidaySearchCriteria.dateRange?.from
          ? format(holidaySearchCriteria.dateRange.from, "yyyy-MM-dd")
          : undefined,
      },
    });
    setCurrentPage("smart-planner");
    window.scrollTo(0, 0);
  };

  // ── AI PLANNER tab: submit prompt → SmartPlanner ─────────────────────────
  // Passes the raw prompt into SmartPlanner, which uses keyword matching
  // to pick the destination and renders a pre-generated 3-day itinerary.
  const handleAIPlan = (prompt: string) => {
    setStartingContext({
      type: "ai",
      prompt: prompt || "A relaxing 7-day trip",
    });
    setCurrentPage("smart-planner");
    window.scrollTo(0, 0);
  };

  // ── Back → Discovery ─────────────────────────────────────────────────────
  // Called from the SmartPlanner "Back" button and the HotelList "← New Search".
  const handleBack = () => {
    setCurrentPage("discovery");
    setStartingContext(null);
    window.scrollTo(0, 0);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render — show exactly one screen at a time
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Toaster shows brief success/error notifications in the bottom-right corner */}
      <Toaster position="bottom-right" />

      {/* Screen 1: Discovery page — multi-tab hub where the user starts */}
      {currentPage === "discovery" && (
        <DiscoveryPage
          onHotelSearch={handleHotelSearch}
          onHotelDirectSelect={handleHotelDirectSelect}
          onTourSelect={handleTourSelect}
          onFlightSearch={handleFlightSearch}
          onHolidaySearch={handleHolidaySearch}
          onAIPlan={handleAIPlan}
        />
      )}

      {/* Screen 2: Hotel results list — only reached from the Hotels tab */}
      {currentPage === "hotel-list" && (
        <HotelListPage
          onHotelSelect={handleHotelSelect}
          onBackToSearch={handleBack}
          initialLocation={searchCriteria.location}
          initialDateRange={searchCriteria.dateRange}
          initialRooms={searchCriteria.rooms}
        />
      )}

      {/* Screen 3: Hotel detail — room selection, reached from HotelListPage.
          The user picks a room type, board option, and cancellation policy here,
          then clicks "Book" to proceed to SmartPlanner. */}
      {currentPage === "hotel-detail" && selectedHotel && (
        <HotelDetailPage
          hotel={selectedHotel}
          roomConfiguration={searchCriteria.rooms}
          // Carry the dates from the Hotels search form into the detail page
          // so the check-in/check-out fields are pre-filled automatically.
          initialCheckIn={searchCriteria.dateRange?.from
            ? format(searchCriteria.dateRange.from, "yyyy-MM-dd")
            : undefined}
          initialCheckOut={searchCriteria.dateRange?.to
            ? format(searchCriteria.dateRange.to, "yyyy-MM-dd")
            : undefined}
          onBack={() => {
            setCurrentPage(hotelDetailBackPage);
            window.scrollTo(0, 0);
          }}
          onBook={(hotel) => handleHotelDetailBook(hotel)}
        />
      )}

      {/* Screen 5: Flight results — reached from the Flights tab.
          FlightListPage shows results for one leg at a time. The user picks
          a flight for each leg sequentially until all legs are chosen,
          then navigates automatically to SmartPlanner. */}
      {currentPage === "flight-results" && flightSearchCriteria && (
        <FlightListPage
          searchCriteria={flightSearchCriteria}
          currentLegIndex={currentFlightLegIndex}
          selectedLegs={selectedFlightLegs}
          onFlightLegSelect={handleFlightLegSelect}
          onBack={handleBack}
        />
      )}

      {/* Screen 6: Holiday results list — reached from the Holidays tab */}
      {currentPage === "holiday-list" && (
        <HolidayListPage
          searchCriteria={holidaySearchCriteria}
          onViewDetail={handleUnifiedPackageSelect}
          onBack={handleBack}
          onRefineSearch={handleRefineHolidaySearch}
        />
      )}

      {/* Screen: Package detail — full-page view for a UnifiedPackage (hotel + flights).
          Reached from HolidayListPage when the user clicks a package card.
          Replaces the old HotelDetailModal with a full takeover experience. */}
      {currentPage === "package-detail" && selectedUnifiedPackage && (
        <PackageDetailPage
          pkg={selectedUnifiedPackage}
          searchCriteria={holidaySearchCriteria}
          onBack={() => {
            setCurrentPage("holiday-list");
            window.scrollTo(0, 0);
          }}
          onBook={handlePackageDetailBook}
        />
      )}

      {/* Screen 7: Holiday detail — reached from HolidayListPage */}
      {currentPage === "holiday-detail" && selectedHolidayPackage && (
        <HolidayDetailPage
          pkg={selectedHolidayPackage}
          searchCriteria={holidaySearchCriteria}
          onBook={handleHolidayBook}
          onBack={() => {
            setCurrentPage("holiday-list");
            window.scrollTo(0, 0);
          }}
        />
      )}

      {/* Screen 6: Smart Planner — the itinerary view, reached from any tab */}
      {currentPage === "smart-planner" && startingContext && (
        <SmartPlannerPage
          startingContext={startingContext}
          onBack={() => {
            // If we came from a holiday package, go back to the detail page.
            // For all other entry points, go back to Discovery.
            if (startingContext.type === "holiday" && selectedHolidayPackage) {
              setCurrentPage("holiday-detail");
            } else {
              handleBack();
            }
            window.scrollTo(0, 0);
          }}
        />
      )}
    </>
  );
}
