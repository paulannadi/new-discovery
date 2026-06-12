import { useState } from "react";
import DiscoveryPage, { type TabId } from "./modules/smartPlanner/pages/DiscoveryPage";
import HotelListPage from "./modules/smartPlanner/pages/HotelListPage";
import HotelDetailPage from "./modules/smartPlanner/pages/HotelDetailPage";
import StopoverRoomPage from "./modules/smartPlanner/pages/StopoverRoomPage";
import HolidayListPage from "./modules/smartPlanner/pages/HolidayListPage";
import PackageDetailPage from "./modules/smartPlanner/pages/PackageDetailPage";
import TourDetailPage from "./modules/smartPlanner/pages/TourDetailPage";
import { SWISS_WINTER_TOUR, DISCOVERY_TOUR_MAP } from "./mocks/tours";
import type { Tour } from "./types";
import FlightListPage from "./modules/smartPlanner/pages/FlightListPage";
import { FlightStepper } from "./modules/smartPlanner/components/flightSearch/FlightStepper";
import { type StartingContext } from "./modules/smartPlanner/pages/SmartPlannerPage";
// Wrap Smart Planner with the DISCOVER video-fill loader so every entry to
// the planner gets a 5s branded intro before the itinerary appears.
import SmartPlannerWithIntro from "./modules/smartPlanner/components/SmartPlannerWithIntro";
import type { UnifiedPackage } from "./types";
// Activities — new entry point added alongside Holidays / Hotels / Flights.
import ActivityListPage from "./modules/smartPlanner/pages/ActivityListPage";
import ActivityDetailPage from "./modules/smartPlanner/pages/ActivityDetailPage";
import type { Activity, ActivitySearchCriteria } from "./types";
// AI Itinerary flow — Conversation + Canvas screen reached from the "Plan
// my trip" CTA inside Discovery's AI Experience mode. The previous Agent
// path is documented in AGENT_PATH.md at repo root and no longer reachable.
import AiItineraryPage from "./modules/smartPlanner/pages/AiItineraryPage";
import { Toast } from "./shared/components/ui/toast";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toastify.css";
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
  // Optional pre-selected filters — set when navigating from a "View all X" button
  // on the Discovery page so the list opens with the right filter already applied.
  initialFilters?: {
    tripType?: string;   // e.g. "group-tour"
    style?: string;      // e.g. "Culture & history"
    country?: string;    // e.g. "Thailand"
  };
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
  // Stopover opt-in (round trip only). When `enabled`, the results page mixes
  // stopover offers into the chosen leg ("outbound" or "return"), and picking
  // one routes the user through a stopover-hotel step before SmartPlanner.
  stopover?: {
    enabled: boolean;
    leg: "outbound" | "return";
    nights: number;
  };
};

// One physical flight in a journey (origin→hub or hub→destination). Used to
// describe each half of a stopover offer so the card can show both legs with
// their own times, duration and "lands next day" marker.
export type FlightSegment = {
  depTime: string;          // "21:40"
  arrTime: string;          // "07:55"
  duration: string;         // "7h 15m"
  arrivesNextDay?: boolean; // true → show a "+1" next to the arrival time
  note?: string;            // small label under the line, e.g. "direct" / "overnight"
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
  // Present only on stopover offers — the multi-night stay built into this
  // flight. Drives the stopover treatment on the card and the hotel step after.
  // `out`/`onward`/`hubCode` power the richer two-flight stopover card; they're
  // optional so any simpler stopover usage still type-checks.
  stopover?: {
    city: string;
    nights: number;
    hubCode?: string;        // the stopover airport, e.g. "DXB"
    out?: FlightSegment;     // origin → hub
    onward?: FlightSegment;  // hub → destination
  };
};

// A leg that the user has finished choosing — the search leg + the chosen flight option.
export type SelectedFlightLeg = {
  leg: FlightLeg;
  option: FlightOption;
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
    | "discovery"
    | "hotel-list"
    | "hotel-detail"
    | "holiday-list"
    | "package-detail"
    | "tour-detail"
    | "flight-results"
    | "stopover-hotel"
    | "stopover-room"
    | "smart-planner"
    // ── Activities flow ──
    | "activity-list"
    | "activity-detail"
    // ── AI Itinerary flow (3-screen prototype) ──
    | "ai-itinerary"
  >("discovery");

  // ── AI Itinerary entry state ─────────────────────────────────────────────
  // When the user enters the AI Itinerary flow from Discovery, we carry the
  // typed prompt (if any) and the chosen audience (traveller/agent) across
  // so the new page can start in the right state.
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>("");

  // AI Experience hero toggle — lifted out of DiscoveryPage so it survives
  // the Discovery → AI Itinerary → Back round trip. `handleAiPlannerStart`
  // flips this on so the back link from the conversation lands on the AI
  // version of the hero, not the default search card.
  const [aiExperienceMode, setAiExperienceMode] = useState(false);

  // Which Discovery tab to land on when we return to it. Each search handler
  // sets this to its own tab, so e.g. backing out of the flights list reopens
  // Discovery on the Flights tab. Starts on the original default, "holidays".
  const [discoveryTab, setDiscoveryTab] = useState<TabId>("holidays");

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

  // The tour the user selected — carried into TourDetailPage.
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  // Where the back button on TourDetailPage should return to.
  const [tourDetailBackPage, setTourDetailBackPage] = useState<"discovery" | "holiday-list">("holiday-list");

  // ── ACTIVITIES state ──────────────────────────────────────────────────────
  // Search criteria from the Activities tab — passed to ActivityListPage so
  // it can pre-filter the result list (e.g. by activity type).
  const [activitySearchCriteria, setActivitySearchCriteria] =
    useState<ActivitySearchCriteria>({
      destination: "",
      activityTypes: [],
      travellers: 2,
    });
  // The activity the user clicked on the list — held here so we can pass it
  // into ActivityDetailPage without re-fetching from the mock dataset.
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  // Where the back button on ActivityDetailPage should return to. We support
  // entering the detail page directly from Discovery in case we later add a
  // category-card shortcut.
  const [activityDetailBackPage, setActivityDetailBackPage] =
    useState<"discovery" | "activity-list">("activity-list");

  // ── FLIGHT search state ───────────────────────────────────────────────────
  // What the user searched for — passed to FlightListPage as read-only criteria.
  const [flightSearchCriteria, setFlightSearchCriteria] = useState<FlightSearchCriteria | null>(null);
  // Which leg the user is currently picking a flight for (0 = first leg).
  const [currentFlightLegIndex, setCurrentFlightLegIndex] = useState(0);
  // Legs the user has already chosen — builds up as the user selects flights.
  const [selectedFlightLegs, setSelectedFlightLegs] = useState<SelectedFlightLeg[]>([]);
  // The stopover the user picked (city + nights), held while they choose a
  // stopover hotel on the next step. Null on a plain flight search.
  const [stopoverSelection, setStopoverSelection] = useState<{ city: string; nights: number } | null>(null);
  // The stopover hotel the user picked — held while they choose a room for it on
  // the new stopover-room step, then folded into the SmartPlanner context.
  const [stopoverHotel, setStopoverHotel] = useState<any | null>(null);

  // ── HOTELS tab: search → HotelListPage ──────────────────────────────────
  // Called when the user submits the Hotel search form on Discovery.
  const handleHotelSearch = (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
    setDiscoveryTab("hotels"); // return here → Hotels tab
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
  const handleHotelDetailBook = (hotel: any, roomSelections?: any) => {
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

    // Pull the first selected room's name + cancellation policy through so the
    // AccommodationCard on SmartPlanner shows the user's actual choice rather
    // than the generic "1 Standard Room / Breakfast included" placeholder.
    const firstSelection: any = roomSelections
      ? Object.values(roomSelections).find((v) => v)
      : undefined;
    const roomType = firstSelection?.room?.name;
    const boardType = firstSelection?.cancelOption || firstSelection?.extraOption;

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
        roomType,
        boardType,
      },
      nights,
    });
    setCurrentPage("smart-planner");
    window.scrollTo(0, 0);
  };

  // ── TOURS tab: click a tour card → TourDetailPage ───────────────────────
  // Look up the full Tour object from the discovery card's id.
  // If there's no match (shouldn't happen), fall back to the Swiss tour.
  const handleTourSelect = (tour: any) => {
    const fullTour = DISCOVERY_TOUR_MAP[tour.id as number] ?? SWISS_WINTER_TOUR;
    setSelectedTour(fullTour);
    setTourDetailBackPage("discovery");
    setCurrentPage("tour-detail");
    window.scrollTo(0, 0);
  };

  // ── FLIGHTS tab: submit search form → FlightListPage ────────────────────
  // Saves the full search criteria (trip type + all legs + passengers) and
  // navigates to the results page. The user will pick one flight per leg.
  const handleFlightSearch = (criteria: FlightSearchCriteria) => {
    setFlightSearchCriteria(criteria);
    setSelectedFlightLegs([]);      // clear any previous selections
    setCurrentFlightLegIndex(0);    // always start with leg 0
    setDiscoveryTab("flights");     // "Back to discovery" → Flights tab
    setCurrentPage("flight-results");
    window.scrollTo(0, 0);
  };

  // ── FlightListPage: user selects a flight for one leg ────────────────────
  // If there are more legs to pick, advance to the next one.
  // If this was the last leg, build the StartingContext and go to SmartPlanner.
  // Shared helper — build the "flight" StartingContext from the chosen legs and
  // head to SmartPlanner. `stopoverHotel` is passed only on the stopover path,
  // and adds the chosen stay (city + nights + hotel) to the flight context so
  // seedTimeline can drop it into the itinerary.
  const goToPlannerWithFlights = (
    selected: SelectedFlightLeg[],
    stopoverHotel?: any,
    // The room(s) chosen on the stopover-room step (keyed by room config id).
    // We pull the first selection's room name + board through so the stopover
    // accommodation card shows the actual room rather than a placeholder.
    stopoverRoomSelections?: any,
  ) => {
    // Mirror handleHotelDetailBook: take the first chosen room's name + board.
    const firstRoom: any = stopoverRoomSelections
      ? Object.values(stopoverRoomSelections).find((v) => v)
      : undefined;
    const stopoverRoomType = firstRoom?.room?.name;
    const stopoverBoardType = firstRoom?.cancelOption || firstRoom?.extraOption;
    const first = selected[0];
    const last = selected[selected.length - 1];
    setStartingContext({
      type: "flight",
      flight: {
        from: first.leg.from || "London",
        // On the stopover path the destination is the outbound leg's arrival
        // (the real holiday city); otherwise keep the prior behaviour.
        to: (stopoverHotel ? first.leg.to : last.leg.to) || "Destination",
        stops: first.option.stops,
        duration: first.option.duration,
        airline: first.option.airline,
        price: `$${first.option.price}`,
        // Pass all legs (both round-trip and multi-city) so SmartPlanner
        // can show one FlightCard per leg with the correct date.
        legs: selected.map((s) => ({
          from: s.leg.from,
          to: s.leg.to,
          date: s.leg.date ? format(s.leg.date, "d MMM") : "",       // display: "9 Apr"
          dateISO: s.leg.date ? format(s.leg.date, "yyyy-MM-dd") : "", // machine-readable: "2026-04-09"
          airline: s.option.airline,
          duration: s.option.duration,
          stops: s.option.stops,
        })),
        // Stopover stay — only set when the user picked a hotel for it.
        ...(stopoverHotel && stopoverSelection
          ? {
              stopover: {
                city: stopoverSelection.city,
                nights: stopoverSelection.nights,
                hotel: {
                  name: stopoverHotel.name,
                  image: stopoverHotel.image,
                  stars: stopoverHotel.stars,
                  rating: stopoverHotel.rating,
                  reviewCount: stopoverHotel.reviewCount,
                  // The HotelListPage mock hotels carry fixed locations, so
                  // pin the stopover stay to the actual stopover city instead.
                  location: stopoverSelection.city,
                  price: stopoverHotel.price,
                  // The room the user chose on the stopover-room step.
                  roomType: stopoverRoomType,
                  boardType: stopoverBoardType,
                },
              },
            }
          : {}),
      },
    });
    setSelectedFlightLegs([]);
    setCurrentFlightLegIndex(0);
    setStopoverSelection(null);
    setStopoverHotel(null);
    setCurrentPage("smart-planner");
    window.scrollTo(0, 0);
  };

  const handleFlightLegSelect = (option: FlightOption) => {
    const currentLeg = flightSearchCriteria!.legs[currentFlightLegIndex];
    const newSelected = [...selectedFlightLegs, { leg: currentLeg, option }];
    const totalLegs = flightSearchCriteria!.legs.length;

    if (currentFlightLegIndex < totalLegs - 1) {
      // More legs remain — stay on FlightListPage, show next leg's results.
      setSelectedFlightLegs(newSelected);
      setCurrentFlightLegIndex((prev) => prev + 1);
      window.scrollTo(0, 0);
      return;
    }

    // Last leg chosen. If a stopover offer was picked on any leg, route through
    // the stopover-hotel step first; the SmartPlanner context is built once a
    // hotel is chosen there. Otherwise go straight to SmartPlanner.
    const stopoverPick = newSelected.find((s) => s.option.stopover)?.option.stopover ?? null;
    if (stopoverPick) {
      setSelectedFlightLegs(newSelected);
      setStopoverSelection(stopoverPick);
      setCurrentPage("stopover-hotel");
      window.scrollTo(0, 0);
      return;
    }

    goToPlannerWithFlights(newSelected);
  };

  // ── Stepper: click a completed step to jump back to that flight leg ───────
  // We drop that leg's selection and everything chosen after it, so the user
  // re-picks forward from there. Clearing the stopover selection too means a
  // re-pick can change (or remove) the stopover. Works from either the flight
  // results page or the stopover-hotel page (we always land back on results).
  const handleFlightStepSelect = (legIndex: number) => {
    setSelectedFlightLegs((prev) => prev.slice(0, legIndex));
    setCurrentFlightLegIndex(legIndex);
    setStopoverSelection(null);
    setStopoverHotel(null);
    setCurrentPage("flight-results");
    window.scrollTo(0, 0);
  };

  // ── Stopover-hotel step: user picked a hotel → stopover-room step ─────────
  // Hold the chosen hotel, then move to the new room-selection step. The
  // SmartPlanner context is only built once a room is picked there.
  const handleStopoverHotelSelect = (hotel: any) => {
    setStopoverHotel(hotel);
    setCurrentPage("stopover-room");
    window.scrollTo(0, 0);
  };

  // ── Stopover-room step: user picked a room → SmartPlanner ─────────────────
  // Now we have the flights, the hotel, and the room — build the full context.
  const handleStopoverRoomSelect = (roomSelections: any) => {
    goToPlannerWithFlights(selectedFlightLegs, stopoverHotel, roomSelections);
  };

  // ── HOLIDAYS tab: submit search → HolidayListPage ────────────────────────
  // Saves the search criteria and navigates to the results list.
  const handleHolidaySearch = (criteria: HolidaySearchCriteria) => {
    setHolidaySearchCriteria(criteria);
    setDiscoveryTab("holidays"); // return here → Holidays tab
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

  // ── HolidayListPage: click a TourCard → TourDetailPage ────────────────────
  const handleTourCardSelect = (tour: Tour) => {
    setSelectedTour(tour);
    setTourDetailBackPage("holiday-list");
    setCurrentPage("tour-detail");
    window.scrollTo(0, 0);
  };

  // ── ACTIVITIES tab: submit search → ActivityListPage ──────────────────────
  const handleActivitySearch = (criteria: ActivitySearchCriteria) => {
    setActivitySearchCriteria(criteria);
    setDiscoveryTab("activities"); // return here → Activities tab
    setCurrentPage("activity-list");
    window.scrollTo(0, 0);
  };

  // ── ActivityListPage: refine the search in-place ──────────────────────────
  const handleRefineActivitySearch = (criteria: ActivitySearchCriteria) => {
    setActivitySearchCriteria(criteria);
  };

  // ── ActivityListPage: click an ActivityCard → ActivityDetailPage ──────────
  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setActivityDetailBackPage("activity-list");
    setCurrentPage("activity-detail");
    window.scrollTo(0, 0);
  };

  // ── DiscoveryPage one-day/event card → ActivityDetailPage (skip the list) ─
  // Sets the back button to return to discovery rather than the list.
  const handleActivityDirectSelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setActivityDetailBackPage("discovery");
    setCurrentPage("activity-detail");
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

  // ── AI Itinerary entry — from Discovery's "Plan my trip" CTA ─────────────
  // Carries the brief composed in the moodboard composer (may be empty)
  // into AiItineraryPage as the first user message in the conversation.
  const handleAiPlannerStart = (prompt: string) => {
    setAiInitialPrompt(prompt);
    // Ensure that hitting Back from the conversation returns the user to the
    // AI version of the Discovery hero — never the default search card.
    setAiExperienceMode(true);
    setCurrentPage("ai-itinerary");
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
      {/* Toast container — top-right, matches real TripBuilder notifications */}
      <Toast />

      {/* Screen 1: Discovery page — multi-tab hub where the user starts */}
      {currentPage === "discovery" && (
        <DiscoveryPage
          onHotelSearch={handleHotelSearch}
          onHotelDirectSelect={handleHotelDirectSelect}
          onTourSelect={handleTourSelect}
          onFlightSearch={handleFlightSearch}
          onHolidaySearch={handleHolidaySearch}
          onActivitySearch={handleActivitySearch}
          onActivityDirectSelect={handleActivityDirectSelect}
          onAiPlannerStart={handleAiPlannerStart}
          aiExperienceMode={aiExperienceMode}
          onAiExperienceModeChange={setAiExperienceMode}
          initialActiveTab={discoveryTab}
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
          onBook={(hotel, roomSelections) => handleHotelDetailBook(hotel, roomSelections)}
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
          // Edit Search modal commits via this — reset selection and leg
          // index so the user starts the new search from leg 1.
          onSearchCriteriaChange={(next) => {
            setFlightSearchCriteria(next);
            setSelectedFlightLegs([]);
            setCurrentFlightLegIndex(0);
          }}
          onStepSelect={handleFlightStepSelect}
          onBack={handleBack}
        />
      )}

      {/* Stopover hotel step — reached after the user picks a stopover flight
          and finishes choosing their legs. We REUSE the existing HotelListPage
          (same hotel cards), scoped to the stopover city. Picking a hotel here
          builds the flight+stopover context and lands on SmartPlanner. */}
      {currentPage === "stopover-hotel" && stopoverSelection && (
        <HotelListPage
          onHotelSelect={handleStopoverHotelSelect}
          // "Back to discovery" exits the whole stopover flow. Stepping back to
          // the flight legs is handled by the FlightStepper in the header below.
          onBackToSearch={handleBack}
          initialLocation={stopoverSelection.city}
          stopoverNights={stopoverSelection.nights}
          // Stopover step: no search fields (city + dates are fixed by the
          // flight), and the flight stepper sits in the header instead. Both
          // flights are done by now, so the hotel card is the current step:
          // currentLegIndex = legs.length marks every flight "done", and
          // stopoverStatus="current" lights up the hotel card.
          hideSearch
          headerSlot={
            flightSearchCriteria ? (
              <FlightStepper
                legs={flightSearchCriteria.legs}
                currentLegIndex={flightSearchCriteria.legs.length}
                tripType={flightSearchCriteria.tripType}
                stopover={flightSearchCriteria.stopover}
                // The hub city for the hotel step ("… stay in {city}").
                stopoverCity={stopoverSelection.city}
                stopoverStatus="current"
                onStepSelect={handleFlightStepSelect}
              />
            ) : null
          }
        />
      )}

      {/* Stopover room step — reached after the user picks a stopover hotel.
          The traveller selects a room in that hotel (primary), with a richer
          hotel showcase below (secondary). Picking a room builds the full
          flight+stopover context and lands on SmartPlanner. */}
      {currentPage === "stopover-room" && stopoverSelection && stopoverHotel && (
        <StopoverRoomPage
          hotel={stopoverHotel}
          city={stopoverSelection.city}
          nights={stopoverSelection.nights}
          // The room is for the flight's passengers — one room with those guests.
          roomConfiguration={
            flightSearchCriteria
              ? [{ id: 1, adults: flightSearchCriteria.adults, children: flightSearchCriteria.children }]
              : undefined
          }
          // "Back to discovery" exits the whole stopover flow. Stepping back to
          // the hotel step is handled by the stepper's onStopoverStepSelect below.
          onBack={handleBack}
          onSelectRooms={handleStopoverRoomSelect}
          // Stepper: flights + hotel are done, the room card is now current.
          headerSlot={
            flightSearchCriteria ? (
              <FlightStepper
                legs={flightSearchCriteria.legs}
                currentLegIndex={flightSearchCriteria.legs.length}
                tripType={flightSearchCriteria.tripType}
                stopover={flightSearchCriteria.stopover}
                // City for the (done) hotel step; hotel name for the room step
                // ("… stay in {city}" → "Room selection in {hotel}").
                stopoverCity={stopoverSelection.city}
                stopoverHotelName={stopoverHotel.name}
                stopoverStatus="done"
                roomStatus="current"
                onStepSelect={handleFlightStepSelect}
                // Clicking the done "Stopover hotel" step returns to the hotel
                // list — same back-to-a-step behaviour as the flight cards.
                onStopoverStepSelect={() => {
                  setCurrentPage("stopover-hotel");
                  window.scrollTo(0, 0);
                }}
              />
            ) : null
          }
        />
      )}

      {/* Screen 6: Holiday results list — reached from the Holidays tab */}
      {currentPage === "holiday-list" && (
        <HolidayListPage
          searchCriteria={holidaySearchCriteria}
          onViewDetail={handleUnifiedPackageSelect}
          onViewTour={handleTourCardSelect}
          onBack={handleBack}
          onRefineSearch={handleRefineHolidaySearch}
        />
      )}

      {/* Screen: Tour detail — reached from either Discovery or HolidayListPage. */}
      {currentPage === "tour-detail" && (
        <TourDetailPage
          tour={selectedTour ?? SWISS_WINTER_TOUR}
          backLabel={tourDetailBackPage === "discovery" ? "Back to tours" : "Back to all tours"}
          onBack={() => {
            setCurrentPage(tourDetailBackPage);
            window.scrollTo(0, 0);
          }}
          onBook={(tour, _travelDate, _adults, hotelPreference) => {
            // Pass the full route through so SmartPlanner can render every
            // stop (hotel + per-stop activities) and inter-stop transfer the
            // detail page promised, not just a single tour card.
            // tour.startDate is a display string ("Mar 31, 2026") — convert
            // to ISO for date math in seedTimeline.
            const startISO = (() => {
              const d = new Date(tour.startDate);
              return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
            })();
            // Coach / bus tours: the TourDetailPage repurposes the "hotel
            // preference" dropdown as a "departure point" picker when
            // `departurePoints` is set, so the value coming back here is the
            // pickup town. Forward it so seedTimeline can render bus transfer
            // cards instead of flights.
            const isCoachTour = (tour.departurePoints?.length ?? 0) > 0;
            setStartingContext({
              type: "tour",
              tour: {
                country: tour.stops[0]?.destinationName ?? "",
                flag: "🇨🇭",
                title: tour.title,
                desc: tour.subtitle,
                duration: `${tour.duration} days`,
                price: `${tour.price.currency} ${tour.price.perPerson.toLocaleString()}`,
                image: tour.mainImage,
                stops: tour.stops,
                transfers: tour.transfers,
                startDateISO: startISO,
                departurePoint: isCoachTour ? hotelPreference : undefined,
              },
            });
            setCurrentPage("smart-planner");
            window.scrollTo(0, 0);
          }}
        />
      )}

      {/* Screen: Activity results list — reached from the Activities tab */}
      {currentPage === "activity-list" && (
        <ActivityListPage
          searchCriteria={activitySearchCriteria}
          onViewDetail={handleActivitySelect}
          onBack={handleBack}
          onRefineSearch={handleRefineActivitySearch}
        />
      )}

      {/* Screen: Activity detail — single-page sticky-tabs layout.
          Sections vary by activity type (cruise → ports + cabins,
          tour/safari → itinerary, walking/bicycle → route map + stats). */}
      {currentPage === "activity-detail" && selectedActivity && (
        <ActivityDetailPage
          activity={selectedActivity}
          backLabel={
            activityDetailBackPage === "discovery"
              ? "Back to discovery"
              : "Back to all activities"
          }
          onBack={() => {
            setCurrentPage(activityDetailBackPage);
            window.scrollTo(0, 0);
          }}
          onBook={(activity, travelDate, _travellers, _preference) => {
            // Seed SmartPlanner with the chosen activity. travelDate is a
            // display string ("Jun 12, 2026") — getTripStartDate parses it
            // via the JS Date constructor, with a graceful fallback.
            setStartingContext({
              type: "activity",
              activity,
              travelDate,
            });
            setCurrentPage("smart-planner");
            window.scrollTo(0, 0);
          }}
        />
      )}

      {/* Screen: Package detail — full-page view for a UnifiedPackage (hotel + flights).
          Reached from HolidayListPage when the user clicks a package card. */}
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

      {/* Screen: AI Itinerary — split-view Conversation + Canvas. Reached
          from Discovery's "Plan my trip" CTA inside the AI Experience hero
          mode. See AGENT_PATH.md for the previous agent flow we dropped. */}
      {currentPage === "ai-itinerary" && (
        <AiItineraryPage
          initialPrompt={aiInitialPrompt}
          onBack={handleBack}
        />
      )}

      {/* Screen 6: Smart Planner — the itinerary view, reached from any tab.
          Rendered inside SmartPlannerWithIntro so we get the DISCOVER
          video-fill loader for the first 5 seconds on every entry. */}
      {currentPage === "smart-planner" && startingContext && (
        <SmartPlannerWithIntro
          startingContext={startingContext}
          onBack={() => {
            // If we came from a holiday package, go back to the package detail page.
            // For all other entry points, go back to Discovery.
            if (startingContext.type === "holiday" && selectedUnifiedPackage) {
              setCurrentPage("package-detail");
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
