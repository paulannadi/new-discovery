import React, { useState, useRef, useEffect } from "react";
import PackageSearchForm from "../components/PackageSearchForm";
import heroBg from "../../../../assets/hero-background-45ee0a.png";
import tourCard1 from "../../../../assets/tour-card-1-4c2e30.png";
import tourCard2 from "../../../../assets/tour-card-2-462e55.png";
import tourCard3 from "../../../../assets/tour-card-3-716657.png";
import tourCard4 from "../../../../assets/tour-card-4-5e611c.png";
import tourCard5 from "../../../../assets/tour-card-5-5e611c.png";
import tourCard6 from "../../../../assets/tour-card-6-397980.png";
import {
  Building2,
  Plane,
  Sun,
  Sparkles,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Search,
  Plus,
  Minus,
  ChevronDown,
  ArrowRight,
  X,
  TreePalm,
  Flag,
  Heart,
  Clock,
  Wifi,
  PawPrint,
  Waves,
  Eye,
  Coffee,
  Dumbbell,
  Building,
  GitBranch,
  Moon,
  RotateCcw,
  Zap,
  User,
} from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { format, addDays } from "date-fns";
import "react-day-picker/dist/style.css";
import type { FlightSearchCriteria, FlightLeg, HolidaySearchCriteria } from "../../../App";

// --- Types ---

type TabId = "hotels" | "flights" | "holidays" | "ai";

type RoomConfig = {
  id: number;
  adults: number;
  children: number;
};

type SearchCriteria = {
  location: string;
  dateRange: DateRange | undefined;
  rooms: RoomConfig[];
};

// HolidaySearchCriteria is imported from App.tsx — the canonical definition
// lives there so it can be shared with HolidayListPage and PackageSearchForm.

type DiscoveryPageProps = {
  // Called when the user submits the Hotels search form → leads to HotelListPage
  onHotelSearch: (criteria: SearchCriteria) => void;
  // Called when the user clicks a hotel card in the "Top hotel picks" section →
  // skips the list and goes directly to HotelDetailPage with default dates
  onHotelDirectSelect: (hotel: any) => void;
  // Called when the user clicks a tour card → leads to SmartPlanner with tour pre-loaded
  onTourSelect: (tour: TourCardData) => void;
  // Called when the user submits the Flights search form → leads to FlightListPage
  onFlightSearch: (criteria: FlightSearchCriteria) => void;
  // Called when the user submits the Holidays search form → leads to HolidayListPage
  onHolidaySearch: (criteria: HolidaySearchCriteria) => void;
  // Called when the user submits the AI Planner prompt
  onAIPlan: (prompt: string) => void;
};

// --- Tab Definitions ---
// Only 'hotels' is connected to a real search flow; the others are visual for now.
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  // Holidays is now first — Tours and Holidays have merged into one experience
  { id: "holidays", label: "Holidays", icon: <Sun size={32} /> },
  { id: "hotels", label: "Hotels", icon: <Building2 size={32} /> },
  { id: "flights", label: "Flights", icon: <Plane size={32} /> },
  { id: "ai", label: "AI Planner", icon: <Sparkles size={32} /> },
];

// --- Section data ---

// Tours by travel style (Section 1)

const TOUR_STYLE_FILTERS = [
  "Culture & history",
  "Sun & beach",
  "Safari",
  "Sustainable travel",
  "Spa & wellness",
];

// Same cards shown regardless of which style filter is active (would be server-filtered in production).
const TOUR_CARDS = [
  { id: 1, country: "Thailand", flag: "th", title: "Classic Thailand Explorer", desc: "Perfect introduction to Thailand with Bangkok temples, cultural experiences, and island hopping.", duration: "8 days", price: "from $1,650", image: tourCard1 },
  { id: 2, country: "Indonesia", flag: "id", title: "Cultural Bali Discovery", desc: "Immerse yourself in Balinese culture with traditional villages, temples, and artisan workshops.", duration: "8 days", price: "from $1,980", image: tourCard2 },
  { id: 3, country: "Peru", flag: "pe", title: "Classic Peru Adventure", desc: "The ultimate Peru experience with Machu Picchu, Sacred Valley, and Lima exploration.", duration: "8 days", price: "from $1,980", image: tourCard3 },
  { id: 4, country: "Thailand", flag: "th", title: "Island Paradise", desc: "Focus on Thailand's stunning islands with beach time, snorkeling, and tropical adventures.", duration: "8 days", price: "from $3,910", image: tourCard4 },
  { id: 5, country: "Peru", flag: "pe", title: "Inca Trail Adventure", desc: "For the adventurous traveler: trek the classic Inca Trail to Machu Picchu.", duration: "8 days", price: "from $1,980", image: tourCard5 },
  { id: 6, country: "Peru", flag: "pe", title: "Amazon & Andes", desc: "Experience Peru's diverse landscapes from Amazon rainforest to high-altitude lakes.", duration: "8 days", price: "from $1,980", image: tourCard6 },
];

// Tours by destination (Section 2)
const DESTINATION_FILTERS = ["Thailand", "Indonesia", "Peru", "Japan", "Morocco"];

// Three sample cards per destination — same local images reused with different metadata
const TOURS_BY_COUNTRY: Record<string, typeof TOUR_CARDS> = {
  Thailand: [
    { id: 7, country: "Thailand", flag: "th", title: "Bangkok & Beyond", desc: "Discover the energy of Bangkok alongside peaceful temples and floating markets.", duration: "10 days", price: "from $2,100", image: tourCard3 },
    { id: 8, country: "Thailand", flag: "th", title: "Northern Thailand Highlights", desc: "Chiang Mai hill tribes, elephant sanctuaries, and lush mountain scenery.", duration: "7 days", price: "from $1,450", image: tourCard5 },
    { id: 9, country: "Thailand", flag: "th", title: "Phuket & the Islands", desc: "Sun, sea, and stunning scenery across Thailand's most beautiful southern islands.", duration: "9 days", price: "from $2,780", image: tourCard6 },
  ],
  Indonesia: [
    { id: 10, country: "Indonesia", flag: "id", title: "Bali Bliss", desc: "Sacred temples, rice terraces, and sunset beach bars in Bali's most beloved spots.", duration: "9 days", price: "from $1,750", image: tourCard2 },
    { id: 11, country: "Indonesia", flag: "id", title: "Java & Bali Explorer", desc: "Ancient kingdoms, active volcanoes, and vibrant art scenes across two islands.", duration: "12 days", price: "from $2,350", image: tourCard1 },
    { id: 12, country: "Indonesia", flag: "id", title: "Lombok & the Gilis", desc: "Pristine beaches, world-class diving, and the quiet beauty of the Gili Islands.", duration: "8 days", price: "from $1,620", image: tourCard4 },
  ],
  Peru: [
    { id: 13, country: "Peru", flag: "pe", title: "Classic Peru Adventure", desc: "The ultimate Peru experience with Machu Picchu, Sacred Valley, and Lima exploration.", duration: "8 days", price: "from $1,980", image: tourCard3 },
    { id: 14, country: "Peru", flag: "pe", title: "Inca Trail Adventure", desc: "Trek the classic Inca Trail to Machu Picchu.", duration: "8 days", price: "from $1,980", image: tourCard5 },
    { id: 15, country: "Peru", flag: "pe", title: "Amazon & Andes", desc: "From Amazon rainforest to high-altitude Andean lakes.", duration: "8 days", price: "from $1,980", image: tourCard6 },
  ],
  Japan: [
    { id: 16, country: "Japan", flag: "jp", title: "Japan Highlights", desc: "Tokyo skyscrapers, Kyoto temples, and Osaka street food in one unforgettable journey.", duration: "11 days", price: "from $2,890", image: tourCard1 },
    { id: 17, country: "Japan", flag: "jp", title: "Kyoto & Beyond", desc: "Deep dive into Japan's ancient capital with day trips to Nara and Hiroshima.", duration: "8 days", price: "from $2,200", image: tourCard2 },
    { id: 18, country: "Japan", flag: "jp", title: "Japan Rail Adventure", desc: "Ride the Shinkansen from Tokyo to Kyoto to the peaceful island of Miyajima.", duration: "14 days", price: "from $3,400", image: tourCard3 },
  ],
  Morocco: [
    { id: 19, country: "Morocco", flag: "ma", title: "Imperial Cities of Morocco", desc: "Fes, Marrakech, Meknes, and Rabat — the four royal cities in one loop.", duration: "9 days", price: "from $1,540", image: tourCard4 },
    { id: 20, country: "Morocco", flag: "ma", title: "Sahara & Kasbahs", desc: "Camel rides at sunset, ancient mud-brick kasbahs, and a sky full of desert stars.", duration: "7 days", price: "from $1,200", image: tourCard5 },
    { id: 21, country: "Morocco", flag: "ma", title: "Coastal Morocco", desc: "Atlantic fishing towns, blue-washed Chefchaouen, and the surf town of Taghazout.", duration: "8 days", price: "from $1,350", image: tourCard6 },
  ],
};

// Hotel picks (Hotels tab content) — horizontal scroll carousel

const HOTEL_PICKS = [
  {
    id: 1, name: "Green Paradise Resort", location: "Bali, Indonesia", stars: 4,
    score: "4.3", label: "Excellent", reviews: "367 reviews",
    amenities: [
      { icon: "paw", label: "Pet friendly" },
      { icon: "wifi", label: "Free Wifi" },
      { icon: "waves", label: "Indoor pool" },
    ],
    // Bali rice terraces — iconic green landscape shot
    price: "from $125", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 2, name: "Santorini Blue Palace", location: "Santorini, Greece", stars: 5,
    score: "4.8", label: "Outstanding", reviews: "892 reviews",
    amenities: [
      { icon: "waves", label: "Infinity pool" },
      { icon: "eye", label: "Sea view" },
      { icon: "coffee", label: "Breakfast" },
    ],
    // Santorini caldera with white buildings and blue domes
    price: "from $285", image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 3, name: "Bangkok Riverside Hotel", location: "Bangkok, Thailand", stars: 4,
    score: "4.1", label: "Very Good", reviews: "1,204 reviews",
    amenities: [
      { icon: "dumbbell", label: "Gym" },
      { icon: "wifi", label: "Free Wifi" },
      { icon: "building", label: "City view" },
    ],
    // Bangkok — Wat Arun temple at sunset on the Chao Phraya river
    price: "from $95", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 4, name: "Marrakech Medina Riad", location: "Marrakech, Morocco", stars: 4,
    score: "4.6", label: "Excellent", reviews: "543 reviews",
    amenities: [
      { icon: "sparkles", label: "Hammam" },
      { icon: "building2", label: "Rooftop terrace" },
      { icon: "coffee", label: "Breakfast" },
    ],
    // Marrakech medina — colourful market alleyway
    price: "from $180", image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&h=600&fit=crop&auto=format",
  },
];

// Flight routes (Flights tab content)

const FLIGHT_ROUTES = [
  // Bali — lush terraced rice fields
  { id: 1, from: "London", fromFlag: "gb", to: "Bali", toFlag: "id", badge: "Best value", badgeGreen: true, stops: "1 stop", duration: "16h 30m", airline: "KLM", dates: "Jul 05 · Jul 19 2026", price: "from $720", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&auto=format" },
  // Bangkok — golden temple at sunset
  { id: 2, from: "London", fromFlag: "gb", to: "Bangkok", toFlag: "th", badge: "Direct", badgeGreen: false, stops: "Direct", duration: "11h 20m", airline: "Thai Airways", dates: "Jul 10 · Jul 24 2026", price: "from $490", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop&auto=format" },
  // Tokyo — city skyline at night
  { id: 3, from: "London", fromFlag: "gb", to: "Tokyo", toFlag: "jp", badge: "Popular", badgeGreen: false, stops: "1 stop", duration: "13h 45m", airline: "ANA", dates: "Aug 01 · Aug 15 2026", price: "from $680", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format" },
  // Lima/Peru — Machu Picchu at sunrise
  { id: 4, from: "London", fromFlag: "gb", to: "Lima", toFlag: "pe", badge: "Best value", badgeGreen: true, stops: "1 stop", duration: "14h 30m", airline: "Iberia", dates: "Sep 03 · Sep 17 2026", price: "from $540", image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop&auto=format" },
  // Marrakech — colourful medina alleyway
  { id: 5, from: "London", fromFlag: "gb", to: "Marrakech", toFlag: "ma", badge: "Direct", badgeGreen: false, stops: "Direct", duration: "3h 30m", airline: "easyJet", dates: "Jul 18 · Jul 25 2026", price: "from $120", image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&h=600&fit=crop&auto=format" },
  // Denpasar/Bali — tropical beach and turquoise water
  { id: 6, from: "London", fromFlag: "gb", to: "Denpasar", toFlag: "id", badge: null, badgeGreen: false, stops: "2 stops", duration: "18h 50m", airline: "Emirates", dates: "Aug 12 · Aug 26 2026", price: "from $810", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop&auto=format" },
];

// Popular destinations for the hotel destination dropdown
const POPULAR_DESTINATIONS = [
  "Lisbon, Portugal",
  "Barcelona, Spain",
  "Rome, Italy",
  "Paris, France",
  "Amsterdam, Netherlands",
  "Vienna, Austria",
  "Prague, Czech Republic",
  "Dubrovnik, Croatia",
];

// Holiday destination inspiration cards — clicking pre-fills the search form and goes to results
const HOLIDAY_DESTINATIONS = [
  {
    id: 1, destination: "Maldives", country: "Maldives", flag: "mv",
    // Maldives — overwater bungalows on crystal-clear turquoise lagoon
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&auto=format",
    desc: "Escape to an exclusive overwater villa with crystal-clear lagoons, world-class diving, and total seclusion.",
    nights: 7, price: "from £1,899",
  },
  {
    id: 2, destination: "Santorini", country: "Greece", flag: "gr",
    // Santorini — white-washed buildings with iconic blue domed church
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop&auto=format",
    desc: "Iconic white-washed clifftop suites with infinity pools overlooking the famous Santorini caldera.",
    nights: 7, price: "from £1,249",
  },
  {
    id: 3, destination: "Bali", country: "Indonesia", flag: "id",
    // Bali — lush green rice terraces in Ubud
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&auto=format",
    desc: "Beachfront luxury with tropical gardens, private pools, and vibrant Seminyak dining on your doorstep.",
    nights: 10, price: "from £1,499",
  },
  {
    id: 4, destination: "Cancún", country: "Mexico", flag: "mx",
    // Cancún — turquoise Caribbean beach with white sand
    image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&h=600&fit=crop&auto=format",
    desc: "All-inclusive beachfront resort with direct Caribbean Sea access and nightly entertainment.",
    nights: 7, price: "from £1,099",
  },
  {
    id: 5, destination: "Dubai", country: "UAE", flag: "ae",
    // Dubai — Burj Khalifa and modern skyline at dusk
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&auto=format",
    desc: "Iconic resort on Palm Jumeirah with a private beach, waterpark, and world-famous restaurants.",
    nights: 7, price: "from £999",
  },
  {
    id: 6, destination: "Phuket", country: "Thailand", flag: "th",
    // Phuket — tropical Thai beach with limestone karsts
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop&auto=format",
    desc: "Secluded luxury on a private bay with stunning ocean views, villa pools, and impeccable Thai hospitality.",
    nights: 10, price: "from £1,349",
  },
];

// Trip type showcase cards — displayed in the "Browse by trip type" section
// on the Holidays tab. Each type has 3 example cards using existing images.
type TripTypeId = "hotel-flight" | "group-tour" | "individual-tour" | "round-trip" | "last-minute";

const TRIP_TYPES: { id: TripTypeId; label: string; icon: React.ReactNode }[] = [
  { id: "hotel-flight",    label: "Hotel + Flight",  icon: <Plane size={15} /> },
  { id: "group-tour",      label: "Group Tours",     icon: <Users size={15} /> },
  { id: "individual-tour", label: "Individual Tours",icon: <User size={15} /> },
  { id: "round-trip",      label: "Round Trips",     icon: <RotateCcw size={15} /> },
  { id: "last-minute",     label: "Last Minute",     icon: <Zap size={15} /> },
];

// Reuses the same tour card images already imported — no extra assets needed.
const TRIP_TYPE_CARDS: Record<TripTypeId, { id: number; title: string; destination: string; image: string; duration: string; price: string }[]> = {
  "hotel-flight": [
    { id: 1, title: "Cancún All-Inclusive Escape",     destination: "Cancún, Mexico",   image: tourCard1, duration: "7 nights", price: "from £849" },
    { id: 2, title: "Maldives Overwater Villa",         destination: "Maldives",         image: tourCard2, duration: "7 nights", price: "from £1,899" },
    { id: 3, title: "Dubai Luxury Getaway",             destination: "Dubai, UAE",       image: tourCard3, duration: "7 nights", price: "from £999" },
  ],
  "group-tour": [
    { id: 4, title: "Classic Peru Group Adventure",    destination: "Peru",             image: tourCard3, duration: "8 days",   price: "from £1,980" },
    { id: 5, title: "Japan Group Highlights Tour",     destination: "Japan",            image: tourCard4, duration: "11 days",  price: "from £2,890" },
    { id: 6, title: "Morocco Imperial Cities Group",   destination: "Morocco",          image: tourCard5, duration: "9 days",   price: "from £1,540" },
  ],
  "individual-tour": [
    { id: 7, title: "Bali Cultural Discovery",         destination: "Bali, Indonesia",  image: tourCard2, duration: "8 days",   price: "from £1,980" },
    { id: 8, title: "Kyoto Self-Guided Journey",       destination: "Japan",            image: tourCard6, duration: "8 days",   price: "from £2,200" },
    { id: 9, title: "Thai Island Hopping",             destination: "Thailand",         image: tourCard1, duration: "10 days",  price: "from £1,650" },
  ],
  "round-trip": [
    { id: 10, title: "Japan Rail Circle Route",        destination: "Japan",            image: tourCard4, duration: "14 days",  price: "from £3,400" },
    { id: 11, title: "Moroccan Imperial Loop",         destination: "Morocco",          image: tourCard5, duration: "9 days",   price: "from £1,540" },
    { id: 12, title: "Peru Amazon & Andes Circuit",    destination: "Peru",             image: tourCard6, duration: "12 days",  price: "from £2,400" },
  ],
  "last-minute": [
    { id: 13, title: "Santorini Getaway",              destination: "Greece",           image: tourCard2, duration: "7 nights", price: "from £749" },
    { id: 14, title: "Bangkok Long Weekend",           destination: "Thailand",         image: tourCard3, duration: "5 nights", price: "from £599" },
    { id: 15, title: "Cancún Quick Escape",            destination: "Mexico",           image: tourCard1, duration: "7 nights", price: "from £819" },
  ],
};

// --- Main Component ---

export default function DiscoveryPage({
  onHotelSearch,
  onHotelDirectSelect,
  onTourSelect,
  onFlightSearch,
  onHolidaySearch,
  onAIPlan,
}: DiscoveryPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("holidays");
  const [activeTourStyle, setActiveTourStyle] = useState("Culture & history");
  const [activeCountry, setActiveCountry] = useState("Thailand");
  // Trip type tab for the "Browse by trip type" showcase on the Holidays landing
  const [activeTripType, setActiveTripType] = useState<TripTypeId>("hotel-flight");

  // Tab indicator: each button ref is measured to position the sliding blue underline.
  // hoveredTab wins over activeTab so the indicator follows the cursor.
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);

  useEffect(() => {
    const targetTab = hoveredTab ?? activeTab;
    const el = tabRefs.current[targetTab];
    const bar = tabBarRef.current;
    if (el && bar) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab, hoveredTab]);

  // Same sliding indicator pattern for the style and country filter tabs
  const styleTabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const styleTabBarRef = useRef<HTMLDivElement>(null);
  const [styleIndicator, setStyleIndicator] = useState({ left: 0, width: 0 });
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  useEffect(() => {
    const target = hoveredStyle ?? activeTourStyle;
    const el = styleTabRefs.current[target];
    const bar = styleTabBarRef.current;
    if (el && bar) setStyleIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTourStyle, hoveredStyle]);

  const countryTabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const countryTabBarRef = useRef<HTMLDivElement>(null);
  const [countryIndicator, setCountryIndicator] = useState({ left: 0, width: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    const target = hoveredCountry ?? activeCountry;
    const el = countryTabRefs.current[target];
    const bar = countryTabBarRef.current;
    if (el && bar) setCountryIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeCountry, hoveredCountry]);

  // Same sliding indicator for the trip type section
  const tripTypeTabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const tripTypeTabBarRef = useRef<HTMLDivElement>(null);
  const [tripTypeIndicator, setTripTypeIndicator] = useState({ left: 0, width: 0 });
  const [hoveredTripType, setHoveredTripType] = useState<TripTypeId | null>(null);

  useEffect(() => {
    const target = hoveredTripType ?? activeTripType;
    const el = tripTypeTabRefs.current[target];
    const bar = tripTypeTabBarRef.current;
    if (el && bar) setTripTypeIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTripType, hoveredTripType]);

  // Hotels panel state
  type HotelPanel = "destination" | "dates" | "guests" | null;
  const [hotelOpenPanel, setHotelOpenPanel] = useState<HotelPanel>(null);

  const [hotelLocation, setHotelLocation] = useState("");
  const [hotelDateRange, setHotelDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), 7),
    to: addDays(new Date(), 14),
  });
  const [hotelRooms, setHotelRooms] = useState<RoomConfig[]>([
    { id: 1, adults: 2, children: 0 },
  ]);

  const hotelTotalGuests = hotelRooms.reduce(
    (sum, r) => sum + r.adults + r.children,
    0
  );

  const hotelDateLabel = hotelDateRange?.from
    ? hotelDateRange.to
      ? `${format(hotelDateRange.from, "MMM d")} – ${format(hotelDateRange.to, "MMM d, yyyy")}`
      : format(hotelDateRange.from, "MMM d, yyyy")
    : "Select dates";

  const hotelGuestsLabel = `${hotelTotalGuests} Guest${hotelTotalGuests !== 1 ? "s" : ""}, ${hotelRooms.length} Room${hotelRooms.length !== 1 ? "s" : ""}`;

  const updateHotelRoom = (
    index: number,
    field: "adults" | "children",
    delta: number
  ) => {
    const updated = [...hotelRooms];
    const min = field === "adults" ? 1 : 0;
    updated[index] = {
      ...updated[index],
      [field]: Math.max(min, Math.min(6, updated[index][field] + delta)),
    };
    setHotelRooms(updated);
  };

  // Flights panel state
  const [flightTripType, setFlightTripType] = useState<"roundtrip" | "multicity">("roundtrip");
  const [flightTripTypeOpen, setFlightTripTypeOpen] = useState(false);

  // Unified legs array — round trip always has exactly 2 legs, multi-city has 2–6.
  // leg[0].date = outbound, leg[1].date = return (for round trip).
  const [flightLegs, setFlightLegs] = useState<FlightLeg[]>([
    { id: 1, from: "", to: "", date: undefined },
    { id: 2, from: "", to: "", date: undefined },
  ]);

  // For the round-trip date range picker — we sync this into the legs on change.
  const [flightDateRange, setFlightDateRange] = useState<DateRange | undefined>(undefined);
  const [flightDatesOpen, setFlightDatesOpen] = useState(false);

  // For multi-city: which leg's date picker is open (by leg id, or null)
  const [openLegDateId, setOpenLegDateId] = useState<number | null>(null);

  // Travellers + cabin class (shared between round trip and multi-city)
  const [flightPassengers, setFlightPassengers] = useState({ adults: 2, children: 0 });
  const [flightCabinClass, setFlightCabinClass] = useState<"economy" | "premium-economy" | "business" | "first">("economy");
  const [flightPassengersOpen, setFlightPassengersOpen] = useState(false);

  // Helper: update a single field on one leg
  const updateLeg = (id: number, field: keyof FlightLeg, value: string | Date | undefined) => {
    setFlightLegs((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  // Add a new empty leg (multi-city only, up to 6)
  const addLeg = () => {
    if (flightLegs.length < 6) {
      setFlightLegs((prev) => [...prev, { id: Date.now(), from: "", to: "", date: undefined }]);
    }
  };

  // Remove a leg by id (only allowed for legs beyond the first 2)
  const removeLeg = (id: number) => {
    setFlightLegs((prev) => prev.filter((l) => l.id !== id));
  };

  const flightDateLabel = flightDateRange?.from
    ? flightDateRange.to
      ? `${format(flightDateRange.from, "MMM d")} – ${format(flightDateRange.to, "MMM d, yyyy")}`
      : format(flightDateRange.from, "MMM d, yyyy")
    : "Select dates";

  const CABIN_CLASS_LABELS: Record<typeof flightCabinClass, string> = {
    "economy": "Economy",
    "premium-economy": "Premium Economy",
    "business": "Business",
    "first": "First Class",
  };

  const flightPassengersLabel = `${flightPassengers.adults} Adult${flightPassengers.adults !== 1 ? "s" : ""}${flightPassengers.children > 0 ? `, ${flightPassengers.children} Child${flightPassengers.children !== 1 ? "ren" : ""}` : ""}`;
  const [flightCabinClassOpen, setFlightCabinClassOpen] = useState(false);

  // Holidays panel — state now lives inside PackageSearchForm

  const [aiPrompt, setAiPrompt] = useState("");

  // Close hotel dropdowns when clicking outside the search card
  const searchCardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        searchCardRef.current &&
        !searchCardRef.current.contains(e.target as Node)
      ) {
        setHotelOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleHotelSearch = () => {
    onHotelSearch({
      location: hotelLocation || "Any destination",
      dateRange: hotelDateRange,
      rooms: hotelRooms,
    });
  };

  return (
    <div className="min-h-screen bg-[#F3F5F6]">
      {/* HERO — full-width background image with search card */}
      {/* On mobile: white background, no image. On sm+: image shows behind floating card */}
      <div className="relative flex flex-col bg-white sm:bg-transparent">
        <div className="hidden sm:block absolute inset-0">
          <img
            src={heroBg}
            alt="Discover the world"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/10" />
        </div>

        <div className="relative z-10 flex flex-col">
          {/* On mobile: no padding so the card is truly flush edge-to-edge */}
          <div className="sm:px-6 lg:px-12 sm:py-16 lg:py-[128px] flex justify-center">
            <div
              ref={searchCardRef}
              className="bg-white sm:rounded-[24px] sm:shadow-2xl w-full sm:max-w-[1200px]"
            >
              {/* Tab bar — sliding blue indicator driven by refs */}
              <div ref={tabBarRef} className="relative border-b border-[#e0e2e8]">
                {/* justify-center centers tabs when they all fit; overflow-x-auto enables scroll when they don't */}
                <div className="flex justify-center overflow-x-auto">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      ref={(el) => {
                        tabRefs.current[tab.id] = el;
                      }}
                      className={`flex flex-col items-center gap-1 pt-3 pb-2 px-3 sm:pt-4 sm:pb-3 sm:px-6 shrink-0 border-b-2 sm:border-0 ${
                        activeTab === tab.id
                          ? "text-[#2681FF] border-[#2681FF]"
                          : "text-[#333743] border-transparent"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                      onMouseEnter={() => setHoveredTab(tab.id)}
                      onMouseLeave={() => setHoveredTab(null)}
                    >
                      <span className={`transition-transform duration-200 ${activeTab === tab.id ? "scale-110" : ""}`}>
                        {tab.icon}
                      </span>
                      <span className={`block text-[11px] sm:text-[18px] ${activeTab === tab.id ? "font-black" : "font-bold"}`}>
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Sliding blue underline — only on sm+ (on mobile each tab has its own border-b-2 instead) */}
                <div
                  className="hidden sm:block absolute bottom-0 h-[2.5px] bg-[#2681FF] rounded-full transition-all duration-300 ease-out"
                  style={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                  }}
                />
              </div>

              {/* Search panels — one shown at a time based on activeTab */}
              {/* p-4 on mobile (tighter), p-6 on desktop */}
              <div className="p-4 sm:p-6">

                {/* HOTELS PANEL */}
                {activeTab === "hotels" && (
                  <div className="flex flex-col lg:flex-row gap-3">

                      {/* Destination */}
                      <div className="flex-1 relative">
                        <button
                          className={`w-full flex items-center gap-3 h-[52px] px-4 rounded-[12px] border text-left transition-all ${
                            hotelOpenPanel === "destination"
                              ? "border-[#2681FF] ring-2 ring-[#2681FF]/20 bg-white"
                              : "border-[#e0e2e8] bg-[#f9fafb] hover:border-[#2681FF]"
                          }`}
                          onClick={() =>
                            setHotelOpenPanel(
                              hotelOpenPanel === "destination"
                                ? null
                                : "destination"
                            )
                          }
                        >
                          <MapPin
                            size={18}
                            className="text-[#2681FF] shrink-0"
                          />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">
                              Destination
                            </span>
                            <span
                              className={`text-[14px] font-semibold truncate w-full ${
                                hotelLocation
                                  ? "text-[#333743]"
                                  : "text-[#9598a4]"
                              }`}
                            >
                              {hotelLocation || "Where are you going?"}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-[#9598a4] shrink-0 transition-transform ${
                              hotelOpenPanel === "destination"
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                        {hotelOpenPanel === "destination" && (
                          <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-white rounded-[16px] shadow-xl border border-[#e0e2e8] z-50 overflow-hidden">
                            <div className="p-3 border-b border-[#f3f5f6]">
                              <div className="flex items-center gap-2 bg-[#f3f5f6] rounded-[10px] px-3 py-2">
                                <Search size={16} className="text-[#9598a4]" />
                                <input
                                  type="text"
                                  placeholder="Search destination..."
                                  className="flex-1 bg-transparent text-[14px] text-[#333743] outline-none placeholder:text-[#9598a4]"
                                  value={hotelLocation}
                                  onChange={(e) =>
                                    setHotelLocation(e.target.value)
                                  }
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="p-2">
                              <p className="text-[11px] font-bold text-[#9598a4] uppercase tracking-wide px-3 py-2">
                                Popular destinations
                              </p>
                              {POPULAR_DESTINATIONS.filter(
                                (d) =>
                                  !hotelLocation ||
                                  d
                                    .toLowerCase()
                                    .includes(hotelLocation.toLowerCase())
                              ).map((dest) => (
                                <button
                                  key={dest}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-left hover:bg-[#f3f5f6] transition-colors"
                                  onClick={() => {
                                    setHotelLocation(dest);
                                    setHotelOpenPanel(null);
                                  }}
                                >
                                  <MapPin
                                    size={16}
                                    className="text-[#2681FF] shrink-0"
                                  />
                                  <span className="text-[14px] text-[#333743] font-medium">
                                    {dest}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="flex-1 relative">
                        <button
                          className={`w-full flex items-center gap-3 h-[52px] px-4 rounded-[12px] border text-left transition-all ${
                            hotelOpenPanel === "dates"
                              ? "border-[#2681FF] ring-2 ring-[#2681FF]/20 bg-white"
                              : "border-[#e0e2e8] bg-[#f9fafb] hover:border-[#2681FF]"
                          }`}
                          onClick={() =>
                            setHotelOpenPanel(
                              hotelOpenPanel === "dates" ? null : "dates"
                            )
                          }
                        >
                          <CalendarIcon
                            size={18}
                            className="text-[#2681FF] shrink-0"
                          />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">
                              Check-in – Check-out
                            </span>
                            <span className="text-[14px] font-semibold text-[#333743] truncate w-full">
                              {hotelDateLabel}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-[#9598a4] shrink-0 transition-transform ${
                              hotelOpenPanel === "dates" ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {hotelOpenPanel === "dates" && (
                          <div className="absolute top-full left-0 mt-2 bg-white rounded-[16px] shadow-xl border border-[#e0e2e8] z-50 overflow-hidden">
                            <style>{`.rdp { --rdp-accent-color: #2681ff; --rdp-background-color: rgba(38, 129, 255, 0.1); margin: 0; } .rdp-day_selected:not([disabled]) { font-weight: bold; }`}</style>
                            <DayPicker
                              mode="range"
                              selected={hotelDateRange}
                              onSelect={(range) => {
                                setHotelDateRange(range);
                                // Auto-close once both dates are picked
                                if (range?.from && range?.to) {
                                  setTimeout(
                                    () => setHotelOpenPanel(null),
                                    200
                                  );
                                }
                              }}
                              numberOfMonths={1}
                              fromDate={new Date()}
                              className="p-4"
                            />
                          </div>
                        )}
                      </div>

                      {/* Guests & rooms */}
                      <div className="flex-1 relative">
                        <button
                          className={`w-full flex items-center gap-3 h-[52px] px-4 rounded-[12px] border text-left transition-all ${
                            hotelOpenPanel === "guests"
                              ? "border-[#2681FF] ring-2 ring-[#2681FF]/20 bg-white"
                              : "border-[#e0e2e8] bg-[#f9fafb] hover:border-[#2681FF]"
                          }`}
                          onClick={() =>
                            setHotelOpenPanel(
                              hotelOpenPanel === "guests" ? null : "guests"
                            )
                          }
                        >
                          <Users
                            size={18}
                            className="text-[#2681FF] shrink-0"
                          />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">
                              Travellers
                            </span>
                            <span className="text-[14px] font-semibold text-[#333743] truncate w-full">
                              {hotelGuestsLabel}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-[#9598a4] shrink-0 transition-transform ${
                              hotelOpenPanel === "guests" ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {hotelOpenPanel === "guests" && (
                          <div className="absolute top-full right-0 mt-2 w-[300px] bg-white rounded-[16px] shadow-xl border border-[#e0e2e8] z-50 p-4">
                            {hotelRooms.map((room, index) => (
                              <div
                                key={room.id}
                                className="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-b-0 border-[#f3f5f6]"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-bold text-[14px] text-[#333743]">
                                    Room {index + 1}
                                  </span>
                                  {hotelRooms.length > 1 && (
                                    <button
                                      className="text-[12px] text-red-500 hover:underline font-medium"
                                      onClick={() =>
                                        setHotelRooms(
                                          hotelRooms.filter(
                                            (_, i) => i !== index
                                          )
                                        )
                                      }
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="text-[14px] font-medium text-[#333743]">
                                      Adults
                                    </div>
                                    <div className="text-[12px] text-[#9598a4]">
                                      Age 18+
                                    </div>
                                  </div>
                                  <CounterControl
                                    value={room.adults}
                                    onDecrement={() =>
                                      updateHotelRoom(index, "adults", -1)
                                    }
                                    onIncrement={() =>
                                      updateHotelRoom(index, "adults", 1)
                                    }
                                    min={1}
                                    max={6}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-[14px] font-medium text-[#333743]">
                                      Children
                                    </div>
                                    <div className="text-[12px] text-[#9598a4]">
                                      Under 18
                                    </div>
                                  </div>
                                  <CounterControl
                                    value={room.children}
                                    onDecrement={() =>
                                      updateHotelRoom(index, "children", -1)
                                    }
                                    onIncrement={() =>
                                      updateHotelRoom(index, "children", 1)
                                    }
                                    min={0}
                                    max={4}
                                  />
                                </div>
                              </div>
                            ))}
                            {hotelRooms.length < 5 && (
                              <button
                                className="mt-3 w-full h-[36px] border border-dashed border-[#2681FF] rounded-[8px] text-[#2681FF] text-[13px] font-bold hover:bg-[#f0f7ff] transition-colors"
                                onClick={() =>
                                  setHotelRooms([
                                    ...hotelRooms,
                                    {
                                      id: Date.now(),
                                      adults: 2,
                                      children: 0,
                                    },
                                  ])
                                }
                              >
                                + Add another room
                              </button>
                            )}
                            <button
                              className="mt-3 w-full h-[40px] bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-bold rounded-[8px] text-[14px] transition-colors"
                              onClick={() => setHotelOpenPanel(null)}
                            >
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                    {/* w-full on mobile so button spans the full width; lg:w-auto restores shrink behaviour on desktop */}
                    <button
                      className="w-full lg:w-auto bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-black text-[16px] h-[52px] px-6 rounded-[12px] transition-colors flex items-center justify-center gap-2 shadow-md"
                      onClick={handleHotelSearch}
                    >
                      <Search size={20} />
                      Search Hotels
                    </button>
                  </div>
                )}

                {/* FLIGHTS PANEL */}
                {activeTab === "flights" && (
                  <div className="flex flex-col gap-4">

                    {/* Secondary criteria row — stacks on mobile, inline pills on sm+ */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:flex-wrap">

                      {/* 1. Trip type dropdown */}
                      <div className="relative w-full sm:w-auto">
                        <button
                          onClick={() => { setFlightTripTypeOpen((o) => !o); setFlightCabinClassOpen(false); setFlightPassengersOpen(false); }}
                          className={`w-full sm:w-auto flex items-center gap-1.5 h-[52px] sm:h-8 px-4 sm:px-3 rounded-[12px] sm:rounded-[8px] border text-[14px] sm:text-[13px] font-semibold transition-all ${flightTripTypeOpen ? "border-[#2681FF] bg-white text-[#2681FF]" : "border-[#e0e2e8] bg-[#f9fafb] text-[#333743] hover:border-[#2681FF]"}`}
                        >
                          {flightTripType === "roundtrip" ? "Round trip" : "Multi-city"}
                          <ChevronDown size={13} className={`shrink-0 transition-transform ${flightTripTypeOpen ? "rotate-180" : ""}`} />
                        </button>
                        {flightTripTypeOpen && (
                          <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1.5 z-50 bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-1.5 w-[140px] flex flex-col gap-0.5">
                            {(["roundtrip", "multicity"] as const).map((type) => (
                              <button
                                key={type}
                                onClick={() => {
                                  setFlightTripType(type);
                                  if (type === "roundtrip") setFlightLegs((prev) => prev.slice(0, 2));
                                  setFlightTripTypeOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-[8px] text-[13px] font-semibold transition-colors ${flightTripType === type ? "bg-[#2681FF] text-white" : "text-[#333743] hover:bg-[#f3f5f6]"}`}
                              >
                                {type === "roundtrip" ? "Round trip" : "Multi-city"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 2. Cabin class dropdown */}
                      <div className="relative w-full sm:w-auto">
                        <button
                          onClick={() => { setFlightCabinClassOpen((o) => !o); setFlightTripTypeOpen(false); setFlightPassengersOpen(false); }}
                          className={`w-full sm:w-auto flex items-center gap-1.5 h-[52px] sm:h-8 px-4 sm:px-3 rounded-[12px] sm:rounded-[8px] border text-[14px] sm:text-[13px] font-semibold transition-all ${flightCabinClassOpen ? "border-[#2681FF] bg-white text-[#2681FF]" : "border-[#e0e2e8] bg-[#f9fafb] text-[#333743] hover:border-[#2681FF]"}`}
                        >
                          {CABIN_CLASS_LABELS[flightCabinClass]}
                          <ChevronDown size={13} className={`shrink-0 transition-transform ${flightCabinClassOpen ? "rotate-180" : ""}`} />
                        </button>
                        {flightCabinClassOpen && (
                          <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1.5 z-50 bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-1.5 w-[180px] flex flex-col gap-0.5">
                            {(["economy", "premium-economy", "business", "first"] as const).map((cls) => (
                              <button
                                key={cls}
                                onClick={() => { setFlightCabinClass(cls); setFlightCabinClassOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-[8px] text-[13px] font-semibold transition-colors ${flightCabinClass === cls ? "bg-[#2681FF] text-white" : "text-[#333743] hover:bg-[#f3f5f6]"}`}
                              >
                                {CABIN_CLASS_LABELS[cls]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. Travellers dropdown — counters for adults/children */}
                      <div className="relative w-full sm:w-auto">
                        <button
                          onClick={() => { setFlightPassengersOpen((o) => !o); setFlightTripTypeOpen(false); setFlightCabinClassOpen(false); }}
                          className={`w-full sm:w-auto flex items-center gap-1.5 h-[52px] sm:h-8 px-4 sm:px-3 rounded-[12px] sm:rounded-[8px] border text-[14px] sm:text-[13px] font-semibold transition-all ${flightPassengersOpen ? "border-[#2681FF] bg-white text-[#2681FF]" : "border-[#e0e2e8] bg-[#f9fafb] text-[#333743] hover:border-[#2681FF]"}`}
                        >
                          {flightPassengersLabel}
                          <ChevronDown size={13} className={`shrink-0 transition-transform ${flightPassengersOpen ? "rotate-180" : ""}`} />
                        </button>
                        {flightPassengersOpen && (
                          <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1.5 z-50 bg-white rounded-[16px] shadow-xl border border-[#e0e2e8] p-5 w-[260px] flex flex-col gap-4">
                            {[
                              { label: "Adults", sub: "Age 12+", key: "adults" as const, min: 1 },
                              { label: "Children", sub: "Age 2–11", key: "children" as const, min: 0 },
                            ].map(({ label, sub, key, min }) => (
                              <div key={key} className="flex items-center justify-between">
                                <div>
                                  <div className="text-[14px] font-semibold text-[#333743]">{label}</div>
                                  <div className="text-[12px] text-[#9598a4]">{sub}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => setFlightPassengers((p) => ({ ...p, [key]: Math.max(min, p[key] - 1) }))}
                                    disabled={flightPassengers[key] <= min}
                                    className="w-8 h-8 rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] hover:border-[#2681FF] hover:text-[#2681FF] transition-colors disabled:opacity-30"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="text-[15px] font-bold text-[#333743] w-4 text-center">{flightPassengers[key]}</span>
                                  <button
                                    onClick={() => setFlightPassengers((p) => ({ ...p, [key]: Math.min(9, p[key] + 1) }))}
                                    className="w-8 h-8 rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] hover:border-[#2681FF] hover:text-[#2681FF] transition-colors"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => setFlightPassengersOpen(false)}
                              className="w-full bg-[#2681FF] text-white font-bold text-[14px] py-2.5 rounded-[10px] hover:bg-[#1a6fd9] transition-colors"
                            >
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── ROUND TRIP FORM ──────────────────────────────────── */}
                    {flightTripType === "roundtrip" && (
                      <div className="flex flex-col lg:flex-row gap-3">

                        {/* From */}
                        <div className="flex-1">
                          <div className="w-full flex items-center gap-3 h-[52px] px-4 rounded-[12px] border border-[#e0e2e8] bg-[#f9fafb] focus-within:border-[#2681FF] transition-all">
                            <Plane size={18} className="text-[#2681FF] shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">From</span>
                              <input
                                type="text"
                                placeholder="Departure city"
                                value={flightLegs[0]?.from ?? ""}
                                onChange={(e) => {
                                  // When origin changes, also update the return leg's destination
                                  updateLeg(flightLegs[0].id, "from", e.target.value);
                                  updateLeg(flightLegs[1].id, "to", e.target.value);
                                }}
                                className="bg-transparent text-[14px] font-semibold text-[#333743] outline-none placeholder:text-[#9598a4] placeholder:font-normal"
                              />
                            </div>
                          </div>
                        </div>

                        {/* To */}
                        <div className="flex-1">
                          <div className="w-full flex items-center gap-3 h-[52px] px-4 rounded-[12px] border border-[#e0e2e8] bg-[#f9fafb] focus-within:border-[#2681FF] transition-all">
                            <Plane size={18} className="text-[#2681FF] shrink-0 rotate-90" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">To</span>
                              <input
                                type="text"
                                placeholder="Destination city"
                                value={flightLegs[0]?.to ?? ""}
                                onChange={(e) => {
                                  // Destination changes: outbound leg goes TO here, return leg comes FROM here
                                  updateLeg(flightLegs[0].id, "to", e.target.value);
                                  updateLeg(flightLegs[1].id, "from", e.target.value);
                                }}
                                className="bg-transparent text-[14px] font-semibold text-[#333743] outline-none placeholder:text-[#9598a4] placeholder:font-normal"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dates — range picker for outbound + return */}
                        <div className="flex-1">
                          <div className="relative w-full">
                            <button
                              className={`w-full flex items-center gap-3 h-[52px] px-4 rounded-[12px] border bg-[#f9fafb] transition-all ${flightDatesOpen ? "border-[#2681FF]" : "border-[#e0e2e8] hover:border-[#2681FF]"}`}
                              onClick={() => setFlightDatesOpen(!flightDatesOpen)}
                            >
                              <CalendarIcon size={18} className="text-[#2681FF] shrink-0" />
                              <div className="flex flex-col items-start flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">Depart – Return</span>
                                <span className={`text-[14px] font-semibold ${flightDateRange?.from ? "text-[#333743]" : "text-[#9598a4]"}`}>
                                  {flightDateLabel}
                                </span>
                              </div>
                            </button>
                            {flightDatesOpen && (
                              <div className="absolute top-[60px] left-0 z-50 bg-white rounded-[16px] shadow-2xl border border-[#e0e2e8] p-4">
                                <style>{`.rdp { --rdp-accent-color: #2681ff; --rdp-background-color: rgba(38, 129, 255, 0.1); margin: 0; } .rdp-day_selected:not([disabled]) { font-weight: bold; }`}</style>
                                <DayPicker
                                  mode="range"
                                  selected={flightDateRange}
                                  onSelect={(range) => {
                                    setFlightDateRange(range);
                                    // Mirror dates into the legs so they get passed to FlightListPage
                                    if (range?.from) updateLeg(flightLegs[0].id, "date", range.from);
                                    if (range?.to) updateLeg(flightLegs[1].id, "date", range.to);
                                    if (range?.from && range?.to) setFlightDatesOpen(false);
                                  }}
                                  numberOfMonths={1}
                                  disabled={{ before: new Date() }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Search button — w-full on mobile (stacked), lg:w-auto on desktop (inline row) */}
                        <button
                          className="w-full lg:w-auto bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-black text-[16px] h-[52px] px-6 rounded-[12px] transition-colors flex items-center justify-center gap-2 shadow-md"
                          onClick={() => {
                            setFlightDatesOpen(false);
                            setFlightPassengersOpen(false);
                            onFlightSearch({
                              tripType: "roundtrip",
                              legs: flightLegs,
                              adults: flightPassengers.adults,
                              children: flightPassengers.children,
                              cabinClass: flightCabinClass,
                            });
                          }}
                        >
                          <Search size={20} />
                          Search Flights
                        </button>
                      </div>
                    )}

                    {/* ── MULTI-CITY FORM ──────────────────────────────────── */}
                    {flightTripType === "multicity" && (
                      <div className="flex flex-col gap-3">

                        {/* One row per leg */}
                        {flightLegs.map((leg, index) => (
                          <div key={leg.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

                            {/* Leg label */}
                            <span className="text-[11px] font-black text-[#9598a4] uppercase tracking-wide shrink-0 sm:w-12 pt-3.5 sm:pt-0 text-left sm:text-right">
                              {index === 0 ? "Leg 1" : index === 1 ? "Leg 2" : `Leg ${index + 1}`}
                            </span>

                            {/* From input */}
                            <div className="flex-1 flex items-center gap-3 h-[52px] px-4 rounded-[12px] border border-[#e0e2e8] bg-[#f9fafb] focus-within:border-[#2681FF] transition-all">
                              <Plane size={16} className="text-[#2681FF] shrink-0" />
                              <input
                                type="text"
                                placeholder="From city"
                                value={leg.from}
                                onChange={(e) => updateLeg(leg.id, "from", e.target.value)}
                                className="bg-transparent text-[14px] font-semibold text-[#333743] outline-none placeholder:text-[#9598a4] placeholder:font-normal w-full"
                              />
                            </div>

                            {/* Arrow between From and To */}
                            <ArrowRight size={14} className="text-[#9598a4] shrink-0 hidden sm:block" />

                            {/* To input */}
                            <div className="flex-1 flex items-center gap-3 h-[52px] px-4 rounded-[12px] border border-[#e0e2e8] bg-[#f9fafb] focus-within:border-[#2681FF] transition-all">
                              <Plane size={16} className="text-[#2681FF] shrink-0 rotate-90" />
                              <input
                                type="text"
                                placeholder="To city"
                                value={leg.to}
                                onChange={(e) => updateLeg(leg.id, "to", e.target.value)}
                                className="bg-transparent text-[14px] font-semibold text-[#333743] outline-none placeholder:text-[#9598a4] placeholder:font-normal w-full"
                              />
                            </div>

                            {/* Date picker for this leg (single date) */}
                            <div className="relative sm:w-[160px]">
                              <button
                                className={`w-full flex items-center gap-2 h-[52px] px-3 rounded-[12px] border bg-[#f9fafb] transition-all ${openLegDateId === leg.id ? "border-[#2681FF]" : "border-[#e0e2e8] hover:border-[#2681FF]"}`}
                                onClick={() => setOpenLegDateId(openLegDateId === leg.id ? null : leg.id)}
                              >
                                <CalendarIcon size={15} className="text-[#2681FF] shrink-0" />
                                <span className={`text-[13px] font-semibold truncate ${leg.date ? "text-[#333743]" : "text-[#9598a4]"}`}>
                                  {leg.date ? format(leg.date, "d MMM yyyy") : "Select date"}
                                </span>
                              </button>
                              {openLegDateId === leg.id && (
                                <div className="absolute top-[60px] left-0 z-50 bg-white rounded-[16px] shadow-2xl border border-[#e0e2e8] p-4">
                                  <style>{`.rdp { --rdp-accent-color: #2681ff; --rdp-background-color: rgba(38, 129, 255, 0.1); margin: 0; } .rdp-day_selected:not([disabled]) { font-weight: bold; }`}</style>
                                  <DayPicker
                                    mode="single"
                                    selected={leg.date}
                                    onSelect={(date) => {
                                      updateLeg(leg.id, "date", date ?? undefined);
                                      setOpenLegDateId(null);
                                    }}
                                    disabled={{ before: new Date() }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Remove button — only shown for legs beyond the first 2 */}
                            {index >= 2 ? (
                              <button
                                onClick={() => removeLeg(leg.id)}
                                className="shrink-0 w-9 h-9 rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#9598a4] hover:border-red-300 hover:text-red-400 transition-colors self-center"
                                title="Remove this leg"
                              >
                                <X size={14} />
                              </button>
                            ) : (
                              // Placeholder to keep alignment when no remove button
                              <div className="shrink-0 w-9 hidden sm:block" />
                            )}
                          </div>
                        ))}

                        {/* Add another flight button — up to 6 legs */}
                        {flightLegs.length < 6 && (
                          <button
                            onClick={addLeg}
                            className="mt-1 h-[44px] w-full border border-dashed border-[#2681FF] rounded-[10px] text-[#2681FF] text-[13px] font-bold hover:bg-[#f0f7ff] transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus size={14} />
                            Add another flight
                          </button>
                        )}

                        {/* Bottom row: search button */}
                        <div className="flex pt-1">

                          {/* Search button */}
                          <button
                            className="flex-1 sm:flex-none bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-black text-[16px] h-[52px] px-6 rounded-[12px] transition-colors flex items-center justify-center gap-2 shadow-md"
                            onClick={() => {
                              setFlightPassengersOpen(false);
                              setOpenLegDateId(null);
                              onFlightSearch({
                                tripType: "multicity",
                                legs: flightLegs,
                                adults: flightPassengers.adults,
                                children: flightPassengers.children,
                                cabinClass: flightCabinClass,
                              });
                            }}
                          >
                            <Search size={20} />
                            Search Flights
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* HOLIDAYS PANEL */}
                {activeTab === "holidays" && (
                  <PackageSearchForm variant="hero" onSearch={onHolidaySearch} />
                )}

                {/* AI PLANNER PANEL */}
                {activeTab === "ai" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-[12px] border border-[#e0e2e8] bg-[#f9fafb] focus-within:border-[#2681FF] focus-within:ring-2 focus-within:ring-[#2681FF]/20 transition-all min-h-[88px]">
                      <Sparkles
                        size={18}
                        className="text-[#2681FF] mt-0.5 shrink-0"
                      />
                      <textarea
                        placeholder="Describe your dream trip… e.g. 'A relaxing 7-day beach holiday for 2 in Europe in July, budget around €3,000'"
                        className="flex-1 bg-transparent text-[14px] text-[#333743] outline-none placeholder:text-[#9598a4] resize-none leading-relaxed"
                        rows={3}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                    </div>
                    <button
                      className="w-full bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-black text-[16px] h-[52px] rounded-[12px] transition-colors flex items-center justify-center gap-2"
                      onClick={() => onAIPlan(aiPrompt)}
                    >
                      <Sparkles size={20} />
                      Plan my trip with AI
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── HOTELS ── */}
      {activeTab === "hotels" && (
        <section className="py-16 px-4 sm:px-6 lg:px-12">
          <div className="max-w-[1200px] mx-auto">

            <div className="mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <Heart size={28} className="text-[#2681FF]" />
                <h2 className="text-[#333743] font-bold text-[32px] leading-tight">
                  Our favourite picks
                </h2>
              </div>
              <p className="text-[#667080] text-[18px]">
                Average prices based on current calendar month
              </p>
            </div>

            <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
              {HOTEL_PICKS.map((hotel) => (
                <div
                  key={hotel.id}
                  className="shrink-0 w-[389px] bg-white rounded-[16px] overflow-hidden shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)] cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200 snap-start"
                  onClick={() => {
                    // Map the HOTEL_PICKS card data to the Hotel shape that
                    // HotelDetailPage expects. We fill in sensible defaults for
                    // fields that the discovery cards don't carry (board types,
                    // cancellation policy, etc.).
                    onHotelDirectSelect({
                      id: `pick_${hotel.id}`,
                      name: hotel.name,
                      image: hotel.image,
                      stars: hotel.stars,
                      // score is on a 5-point scale; HotelDetailPage uses a 10-point scale
                      rating: parseFloat(hotel.score) * 2,
                      reviewCount: parseInt(hotel.reviews.replace(/[^0-9]/g, ""), 10),
                      location: hotel.location,
                      // price is "from $125" — strip to the number
                      price: parseInt(hotel.price.replace(/[^0-9]/g, ""), 10),
                      amenities: hotel.amenities.map((a) => a.label),
                      boardTypes: ["Room only", "Breakfast", "Half board"],
                      cancellationPolicy: "Free cancellation",
                      coordinates: { x: 50, y: 50 },
                    });
                  }}
                >
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-[252px] object-cover"
                  />

                  <div className="p-4 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-[18px] font-bold text-[#0A0A0A] leading-snug">
                          {hotel.name}
                        </span>
                        <span className="text-[13px] text-[#FFB700] tracking-wide mt-0.5">
                          {"★".repeat(hotel.stars)}{"☆".repeat(5 - hotel.stars)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="bg-[#16a34a] text-white text-[12px] font-bold px-2 py-1 rounded-[8px] leading-none">
                          {hotel.score}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-[#333743]">
                            {hotel.label}
                          </span>
                          <span className="text-[12px] text-[#667080]">
                            {hotel.reviews}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#667080] text-[13px]">
                      <MapPin size={13} className="shrink-0" />
                      {hotel.location}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {hotel.amenities.map((a) => (
                        <span
                          key={a.label}
                          className="flex items-center gap-1 bg-[#EFF6FF] text-[#2681FF] text-[12px] font-medium px-2.5 py-1 rounded-full"
                        >
                          <AmenityIcon name={a.icon} />
                          {a.label}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#f3f5f6]">
                      <div className="text-[13px] text-[#667080]">Per person, per night</div>
                      <div className="text-[22px] font-bold text-[#333743]">{hotel.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                className="border border-[#2681FF] text-[#2681FF] font-bold text-[15px] px-5 py-2.5 rounded-[8px] hover:bg-[#eff6ff] transition-colors"
                onClick={() =>
                  onHotelSearch({
                    location: "Any destination",
                    dateRange: { from: addDays(new Date(), 7), to: addDays(new Date(), 14) },
                    rooms: [{ id: 1, adults: 2, children: 0 }],
                  })
                }
              >
                View all hotels (148)
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ── FLIGHTS ── */}
      {activeTab === "flights" && (
        <section className="py-16 px-4 sm:px-6 lg:px-12">
          <div className="max-w-[1200px] mx-auto">

            <div className="mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <Plane size={28} className="text-[#2681FF]" />
                <h2 className="text-[#333743] font-bold text-[32px] leading-tight">
                  Popular flight routes
                </h2>
              </div>
              <p className="text-[#667080] text-[18px]">
                Average prices based on current calendar month
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {FLIGHT_ROUTES.map((route) => (
                <div
                  key={route.id}
                  className="bg-white rounded-[16px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.10)] cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                  onClick={() => onFlightSearch({
                    tripType: "roundtrip",
                    legs: [
                      { id: 1, from: route.from, to: route.to, date: undefined },
                      { id: 2, from: route.to, to: route.from, date: undefined },
                    ],
                    adults: flightPassengers.adults,
                    children: flightPassengers.children,
                    cabinClass: flightCabinClass,
                  })}
                >
                  <div className="relative">
                    <img
                      src={route.image}
                      alt={`${route.from} to ${route.to}`}
                      className="w-full h-[200px] object-cover"
                    />
                    {route.badge && (
                      <span
                        className={`absolute top-3 left-3 text-white text-[12px] font-bold px-2.5 py-1 rounded-[6px] ${
                          route.badge === "Best value"
                            ? "bg-[#16a34a]"
                            : route.badge === "Direct"
                            ? "bg-[#f59e0b]"
                            : "bg-[#2681FF]"
                        }`}
                      >
                        {route.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-[#333743] text-[15px] font-bold">
                      <img
                        src={`https://flagcdn.com/w40/${route.fromFlag}.png`}
                        alt={route.from}
                        className="w-5 h-3.5 rounded-sm object-cover"
                      />
                      {route.from}
                      <ArrowRight size={14} className="text-[#9598a4] mx-0.5" />
                      <img
                        src={`https://flagcdn.com/w40/${route.toFlag}.png`}
                        alt={route.to}
                        className="w-5 h-3.5 rounded-sm object-cover"
                      />
                      {route.to}
                    </div>

                    <div className="flex items-center gap-2 text-[13px] text-[#667080]">
                      <span className="flex items-center gap-1">
                        <GitBranch size={12} />
                        {route.stops}
                      </span>
                      <span className="w-px h-3 bg-[#e0e2e8]" />
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {route.duration}
                      </span>
                      <span className="w-px h-3 bg-[#e0e2e8]" />
                      <span className="bg-[#f3f5f6] text-[#333743] font-bold text-[11px] px-2 py-0.5 rounded-[4px]">
                        {route.airline}
                      </span>
                    </div>

                    <div className="flex items-end justify-between pt-2 border-t border-[#f3f5f6]">
                      <div className="flex items-center gap-1.5 text-[13px] text-[#667080]">
                        <CalendarIcon size={13} />
                        {route.dates}
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] text-[#667080]">Per person</div>
                        <div className="text-[22px] font-bold text-[#333743]">{route.price}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── HOLIDAYS ── */}
      {/* This tab now combines the old Holidays + Tours into one rich experience. */}
      {activeTab === "holidays" && (
        <>

          {/* ── Section 1: Tours by travel style ────────────────────────── */}
          {/* Section has no horizontal padding. The max-w-[1200px] wrapper aligns
              headings + tab bars with the hero card. Scroll rows use dynamic
              pl-[max(pad, (100vw-1200px)/2)] so the first card starts at exactly
              the same left edge on all screen sizes, including wide viewports. */}
          <section className="py-16">

            {/* Constrained content — aligns with hero card left edge */}
            <div className="px-[max(1rem,calc((100vw-75rem)/2))] sm:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <TreePalm size={28} className="text-[#2681FF]" />
                <h2 className="text-[#333743] font-bold text-[32px] leading-tight">
                  Tours for every travel style
                </h2>
              </div>
              <p className="text-[#667080] text-[18px]">
                Average prices based on current calendar month
              </p>
            </div>

            <div ref={styleTabBarRef} className="mx-[max(1rem,calc((100vw-75rem)/2))] sm:mx-[max(1.5rem,calc((100vw-75rem)/2))] lg:mx-[max(3rem,calc((100vw-75rem)/2))] relative border-b border-[#E0E2E8] mb-8 flex gap-0 overflow-x-auto">
              {TOUR_STYLE_FILTERS.map((style) => (
                <button
                  key={style}
                  ref={(el) => { styleTabRefs.current[style] = el; }}
                  onClick={() => setActiveTourStyle(style)}
                  onMouseEnter={() => setHoveredStyle(style)}
                  onMouseLeave={() => setHoveredStyle(null)}
                  className={`shrink-0 px-5 py-3 text-[15px] font-bold whitespace-nowrap ${
                    activeTourStyle === style ? "text-[#2681FF]" : "text-[#333743]"
                  }`}
                >
                  {style}
                </button>
              ))}
              <button className="shrink-0 ml-auto px-5 py-3 text-[15px] font-bold text-[#2681FF] flex items-center gap-1.5">
                Other styles
                <ChevronDown size={16} />
              </button>
              <div
                className="absolute bottom-0 h-[2.5px] bg-[#2681FF] rounded-full transition-all duration-300 ease-out"
                style={{ left: styleIndicator.left, width: styleIndicator.width }}
              />
            </div>

            {/* Scroll row: starts at the same left edge as the hero card.
                pl-[max(pad,(100vw-75rem)/2)] dynamically tracks the mx-auto centering
                so cards align correctly on both narrow and wide screens. */}
            <div className="pl-[max(1rem,calc((100vw-75rem)/2))] sm:pl-[max(1.5rem,calc((100vw-75rem)/2))] lg:pl-[max(3rem,calc((100vw-75rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-75rem)/2))] sm:[scroll-padding-left:max(1.5rem,calc((100vw-75rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-75rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
              {TOUR_CARDS.map((tour) => (
                <div key={tour.id} className="shrink-0 w-[320px] snap-start">
                  <TourCard tour={tour} onSelect={() => onTourSelect(tour)} />
                </div>
              ))}
            </div>

            <div className="px-[max(1rem,calc((100vw-75rem)/2))] sm:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] flex justify-end">
              <button
                onClick={() => onHolidaySearch({
                  from: "London (LHR)",
                  to: "Anywhere",
                  isCachedDestination: false,
                  dateMode: "flexible",
                  dateRange: undefined,
                  selectedMonths: [],
                  nights: 7,
                  adults: 2,
                  children: 0,
                  // Pre-select the travel style filter so the list opens already filtered
                  initialFilters: { style: activeTourStyle },
                })}
                className="border border-[#2681FF] text-[#2681FF] font-bold text-[15px] px-5 py-2.5 rounded-[8px] hover:bg-[#eff6ff] transition-colors"
              >
                View all {activeTourStyle} tours (35)
              </button>
            </div>

          </section>

          <hr className="border-[#E0E2E8] mx-4 sm:mx-6 lg:mx-[max(3rem,calc((100vw-75rem)/2))]" />

          {/* ── Section 2: Tours by destination ──────────────────────────── */}
          <section className="py-16">

            <div className="px-[max(1rem,calc((100vw-75rem)/2))] sm:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <Flag size={28} className="text-[#2681FF]" />
                <h2 className="text-[#333743] font-bold text-[32px] leading-tight">
                  Your next dream destination
                </h2>
              </div>
              <p className="text-[#667080] text-[18px]">
                Average prices based on current calendar month
              </p>
            </div>

            <div ref={countryTabBarRef} className="mx-[max(1rem,calc((100vw-75rem)/2))] sm:mx-[max(1.5rem,calc((100vw-75rem)/2))] lg:mx-[max(3rem,calc((100vw-75rem)/2))] relative border-b border-[#E0E2E8] mb-8 flex gap-0 overflow-x-auto">
              {DESTINATION_FILTERS.map((country) => (
                <button
                  key={country}
                  ref={(el) => { countryTabRefs.current[country] = el; }}
                  onClick={() => setActiveCountry(country)}
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  className={`shrink-0 px-5 py-3 text-[15px] font-bold whitespace-nowrap ${
                    activeCountry === country ? "text-[#2681FF]" : "text-[#333743]"
                  }`}
                >
                  {country}
                </button>
              ))}
              <button className="shrink-0 ml-auto px-5 py-3 text-[15px] font-bold text-[#2681FF] flex items-center gap-1.5">
                More destinations
                <ChevronDown size={16} />
              </button>
              <div
                className="absolute bottom-0 h-[2.5px] bg-[#2681FF] rounded-full transition-all duration-300 ease-out"
                style={{ left: countryIndicator.left, width: countryIndicator.width }}
              />
            </div>

            <div className="pl-[max(1rem,calc((100vw-75rem)/2))] sm:pl-[max(1.5rem,calc((100vw-75rem)/2))] lg:pl-[max(3rem,calc((100vw-75rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-75rem)/2))] sm:[scroll-padding-left:max(1.5rem,calc((100vw-75rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-75rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
              {(TOURS_BY_COUNTRY[activeCountry] ?? []).map((tour) => (
                <div key={tour.id} className="shrink-0 w-[320px] snap-start">
                  <TourCard tour={tour} onSelect={() => onTourSelect(tour)} />
                </div>
              ))}
            </div>

            <div className="px-[max(1rem,calc((100vw-75rem)/2))] sm:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] flex justify-end">
              <button
                onClick={() => onHolidaySearch({
                  from: "London (LHR)",
                  to: activeCountry,
                  isCachedDestination: false,
                  dateMode: "flexible",
                  dateRange: undefined,
                  selectedMonths: [],
                  nights: 7,
                  adults: 2,
                  children: 0,
                  // Pre-select the country filter so the list opens already filtered
                  initialFilters: { country: activeCountry },
                })}
                className="border border-[#2681FF] text-[#2681FF] font-bold text-[15px] px-5 py-2.5 rounded-[8px] hover:bg-[#eff6ff] transition-colors"
              >
                View all {activeCountry} tours (22)
              </button>
            </div>

          </section>

          <hr className="border-[#E0E2E8] mx-4 sm:mx-6 lg:mx-[max(3rem,calc((100vw-75rem)/2))]" />

          {/* ── Section 3: Travel the way you like ───────────────────────── */}
          <section className="py-16">

            <div className="px-[max(1rem,calc((100vw-75rem)/2))] sm:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <GitBranch size={28} className="text-[#2681FF]" />
                <h2 className="text-[#333743] font-bold text-[32px] leading-tight">
                  Travel the way you like
                </h2>
              </div>
              <p className="text-[#667080] text-[18px]">
                Find the right style of holiday for you
              </p>
            </div>

            <div ref={tripTypeTabBarRef} className="mx-[max(1rem,calc((100vw-75rem)/2))] sm:mx-[max(1.5rem,calc((100vw-75rem)/2))] lg:mx-[max(3rem,calc((100vw-75rem)/2))] relative border-b border-[#E0E2E8] mb-8 flex gap-0 overflow-x-auto">
              {TRIP_TYPES.map((tt) => (
                <button
                  key={tt.id}
                  ref={(el) => { tripTypeTabRefs.current[tt.id] = el; }}
                  onClick={() => setActiveTripType(tt.id)}
                  onMouseEnter={() => setHoveredTripType(tt.id)}
                  onMouseLeave={() => setHoveredTripType(null)}
                  className={`shrink-0 px-5 py-3 text-[15px] font-bold whitespace-nowrap ${
                    activeTripType === tt.id ? "text-[#2681FF]" : "text-[#333743]"
                  }`}
                >
                  {tt.label}
                </button>
              ))}
              <div
                className="absolute bottom-0 h-[2.5px] bg-[#2681FF] rounded-full transition-all duration-300 ease-out"
                style={{ left: tripTypeIndicator.left, width: tripTypeIndicator.width }}
              />
            </div>

            {activeTripType === "hotel-flight" && (
              <div className="pl-[max(1rem,calc((100vw-75rem)/2))] sm:pl-[max(1.5rem,calc((100vw-75rem)/2))] lg:pl-[max(3rem,calc((100vw-75rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-75rem)/2))] sm:[scroll-padding-left:max(1.5rem,calc((100vw-75rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-75rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
                {HOLIDAY_DESTINATIONS.map((dest) => (
                  <div key={dest.id} className="shrink-0 w-[320px] snap-start">
                    <HolidayCard
                      dest={dest}
                      onSelect={() => onHolidaySearch({
                        from: "London (LHR)",
                        to: dest.destination,
                        isCachedDestination: false,
                        dateMode: "specific",
                        dateRange: undefined,
                        selectedMonths: [],
                        nights: dest.nights,
                        adults: 2,
                        children: 0,
                      })}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTripType !== "hotel-flight" && (
              <div className="pl-[max(1rem,calc((100vw-75rem)/2))] sm:pl-[max(1.5rem,calc((100vw-75rem)/2))] lg:pl-[max(3rem,calc((100vw-75rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-75rem)/2))] sm:[scroll-padding-left:max(1.5rem,calc((100vw-75rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-75rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
                {(TRIP_TYPE_CARDS[activeTripType] ?? []).map((card) => (
                  <div key={card.id} className="shrink-0 w-[300px] snap-start">
                    <div
                      className="bg-white rounded-[16px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.10)] cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                      onClick={() => onHolidaySearch({
                        from: "London (LHR)",
                        to: card.destination,
                        isCachedDestination: false,
                        dateMode: "specific",
                        dateRange: undefined,
                        selectedMonths: [],
                        nights: 7,
                        adults: 2,
                        children: 0,
                      })}
                    >
                      <div className="relative">
                        <img src={card.image} alt={card.title} className="w-full h-[180px] object-cover" />
                        <span className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          activeTripType === "group-tour"      ? "bg-purple-100 text-purple-700" :
                          activeTripType === "individual-tour" ? "bg-green-100 text-green-700" :
                          activeTripType === "round-trip"      ? "bg-amber-100 text-amber-700" :
                                                                 "bg-red-100 text-red-700"
                        }`}>
                          {TRIP_TYPES.find((t) => t.id === activeTripType)?.icon}
                          {TRIP_TYPES.find((t) => t.id === activeTripType)?.label}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col gap-2">
                        <div className="text-[13px] text-[#667080]">{card.destination}</div>
                        <div className="text-[15px] font-bold text-[#333743] leading-snug">{card.title}</div>
                        <div className="flex items-end justify-between mt-1">
                          <div className="flex items-center gap-1.5 text-[13px] text-[#333743]">
                            <Clock size={14} />
                            {card.duration}
                          </div>
                          <div className="text-right">
                            <div className="text-[12px] text-[#667080]">Per person</div>
                            <div className="text-[20px] font-bold text-[#333743]">{card.price}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-[max(1rem,calc((100vw-75rem)/2))] sm:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] flex justify-end">
              <button
                onClick={() => onHolidaySearch({
                  from: "London (LHR)",
                  to: "Anywhere",
                  isCachedDestination: false,
                  dateMode: "flexible",
                  dateRange: undefined,
                  selectedMonths: [],
                  nights: 7,
                  adults: 2,
                  children: 0,
                  // Pre-select the trip type filter so the list opens already filtered
                  initialFilters: { tripType: activeTripType },
                })}
                className="border border-[#2681FF] text-[#2681FF] font-bold text-[15px] px-5 py-2.5 rounded-[8px] hover:bg-[#eff6ff] transition-colors"
              >
                View all {TRIP_TYPES.find((t) => t.id === activeTripType)?.label} holidays
              </button>
            </div>

          </section>

          <hr className="border-[#E0E2E8] mx-4 sm:mx-6 lg:mx-[max(3rem,calc((100vw-75rem)/2))]" />

          {/* ── Section 5: Why book with us ───────────────────────────────── */}
          <section className="py-16">
            <div className="px-[max(1rem,calc((100vw-75rem)/2))] sm:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: <Sun size={22} className="text-[#2681FF]" />, title: "Buy together & save", desc: "Bundle your flights and hotel for the best combined price." },
                  { icon: <Heart size={22} className="text-[#2681FF]" />, title: "Tailor your holiday", desc: "Mix and match hotels, room types, and board options." },
                  { icon: <Plane size={22} className="text-[#2681FF]" />, title: "Flexible dates", desc: "See prices across different dates to find the best deal." },
                  { icon: <Users size={22} className="text-[#2681FF]" />, title: "24 / 7 support", desc: "Our travel experts are here before, during, and after your trip." },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex flex-col gap-2">
                    <div className="w-10 h-10 bg-[#EFF6FF] rounded-[10px] flex items-center justify-center">{icon}</div>
                    <div className="text-[14px] font-bold text-[#333743]">{title}</div>
                    <div className="text-[13px] text-[#667080] leading-relaxed">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </>
      )}

      {/* Footer */}
      <div className="text-center py-8 border-t border-[#e0e2e8]">
        <p className="text-[#9598a4] text-[13px]">
          © 2026 Nezasa · TripBuilder · Over 500,000 hotels worldwide
        </p>
      </div>
    </div>
  );
}

// Reusable +/- counter for adults/children fields

function CounterControl({
  value,
  onDecrement,
  onIncrement,
  min,
  max,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrement}
        disabled={value <= min}
        className="w-[28px] h-[28px] rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] hover:border-[#2681FF] hover:text-[#2681FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus size={14} />
      </button>
      <span className="w-[20px] text-center font-bold text-[15px] text-[#333743]">
        {value}
      </span>
      <button
        onClick={onIncrement}
        disabled={value >= max}
        className="w-[28px] h-[28px] rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] hover:border-[#2681FF] hover:text-[#2681FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

// Tour card — used in both "by style" and "by destination" sections

type TourCardData = {
  id: number;
  country: string;
  flag: string;
  title: string;
  desc: string;
  duration: string;
  price: string;
  image: string;
};

function TourCard({ tour, onSelect }: { tour: TourCardData; onSelect?: () => void }) {
  return (
    <div
      className="bg-white rounded-[16px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.10)] cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
      onClick={onSelect}
    >
      <img
        src={tour.image}
        alt={tour.title}
        className="w-full h-[200px] object-cover"
      />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-[13px] text-[#333743]">
          <img
            src={`https://flagcdn.com/w40/${tour.flag}.png`}
            alt={tour.country}
            className="w-5 h-3.5 rounded-sm object-cover"
          />
          {tour.country}
        </div>
        <div className="text-[15px] font-bold text-[#333743] leading-snug">
          {tour.title}
        </div>
        <div className="text-[14px] text-[#667080] leading-relaxed line-clamp-2">
          {tour.desc}
        </div>
        <div className="flex items-end justify-between mt-1">
          <div className="flex items-center gap-1.5 text-[13px] text-[#333743]">
            <Clock size={14} />
            {tour.duration}
          </div>
          <div className="text-right">
            <div className="text-[13px] text-[#333743]">Per person</div>
            <div className="text-[22px] font-bold text-[#333743]">{tour.price}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Holiday destination card — same structure as TourCard

type HolidayDestination = {
  id: number;
  destination: string;
  country: string;
  flag: string;
  image: string;
  desc: string;
  nights: number;
  price: string;
};

function HolidayCard({
  dest,
  onSelect,
}: {
  dest: HolidayDestination;
  onSelect?: () => void;
}) {
  return (
    <div
      className="bg-white rounded-[16px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.10)] cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
      onClick={onSelect}
    >
      <img
        src={dest.image}
        alt={dest.destination}
        className="w-full h-[200px] object-cover"
      />

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[18px] font-bold text-[#333743] leading-snug">
          <img
            src={`https://flagcdn.com/w40/${dest.flag}.png`}
            alt={dest.country}
            className="w-6 h-4 rounded-sm object-cover shrink-0"
          />
          {dest.destination}
        </div>
        <div className="text-[14px] text-[#667080] leading-relaxed line-clamp-2">
          {dest.desc}
        </div>
        <div className="flex items-end justify-between mt-1 pt-2 border-t border-[#f3f5f6]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[13px] text-[#333743]">
              <RotateCcw size={14} />
              Return flights
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-[#333743]">
              <Moon size={14} />
              {dest.nights} nights
            </div>
          </div>
          <div className="text-right">
            <div className="text-[13px] text-[#333743]">Per person</div>
            <div className="text-[22px] font-bold text-[#333743]">{dest.price}</div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Maps a string key to the correct Lucide icon for hotel amenity tags

function AmenityIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    paw:       <PawPrint size={12} />,
    wifi:      <Wifi size={12} />,
    waves:     <Waves size={12} />,
    eye:       <Eye size={12} />,
    coffee:    <Coffee size={12} />,
    dumbbell:  <Dumbbell size={12} />,
    building:  <Building size={12} />,
    sparkles:  <Sparkles size={12} />,
    building2: <Building2 size={12} />,
  };
  return <>{icons[name] ?? null}</>;
}
