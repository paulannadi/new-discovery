import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "../../../shared/components/ui/utils";
// AccommodationStar renders the real star icons (same component as production TripBuilder)
import AccommodationStar from "../../../shared/components/AccommodationStar";
import RatingBlock from "../../../shared/components/RatingBlock";
import PackageSearchForm from "../components/PackageSearchForm";
import heroBg from "../../../../assets/discovery-background.jpg";
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
  Paperclip,
  Send,
} from "lucide-react";
import { Switch } from "../../../shared/components/ui/switch";
import { DayPicker, DateRange } from "react-day-picker";
import { format, addDays } from "date-fns";
import "react-day-picker/dist/style.css";
import type { FlightSearchCriteria, FlightLeg, HolidaySearchCriteria } from "../../../App";

// --- Types ---

type TabId = "hotels" | "flights" | "holidays";

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
};

// --- Tab Definitions ---
// Only 'hotels' is connected to a real search flow; the others are visual for now.
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  // Holidays is now first — Tours and Holidays have merged into one experience
  { id: "holidays", label: "Holidays", icon: <Sun size={20} /> },
  { id: "hotels", label: "Hotels", icon: <Building2 size={20} /> },
  { id: "flights", label: "Flights", icon: <Plane size={20} /> },
];

// --- Section data ---

// Tours by travel style (Section 1)

// Default 5 styles shown in the tab bar on first load
const TOUR_STYLE_FILTERS = [
  "Culture & History",
  "Sun & Beach",
  "Safari",
  "Sustainable Travel",
  "Spa & Wellness",
];

// Maximum tabs for travel styles (same limit as destinations)
const MAX_STYLES = 5;

// Full catalogue of travel styles — emoji gives each one a visual identity
// in the picker modal without needing images.
const ALL_STYLES = [
  { name: "Adventure",                    emoji: "🧗" },
  { name: "Aerial Tours",                 emoji: "🚁" },
  { name: "Art",                          emoji: "🎨" },
  { name: "Boat Tours",                   emoji: "⛵" },
  { name: "Christmas & New Year",         emoji: "🎄" },
  { name: "City Life",                    emoji: "🏙️" },
  { name: "Classes",                      emoji: "📚" },
  { name: "Cuisine",                      emoji: "🍽️" },
  { name: "Culture & History",            emoji: "🏛️" },
  { name: "Cycling & Mountain Biking",    emoji: "🚵" },
  { name: "Day Trips & Excursions",       emoji: "🗺️" },
  { name: "Events & Tickets",             emoji: "🎟️" },
  { name: "Festival",                     emoji: "🎉" },
  { name: "Golf",                         emoji: "⛳" },
  { name: "Hiking & Walking",             emoji: "🥾" },
  { name: "Island Hopping",               emoji: "🏝️" },
  { name: "Landscapes & Sceneries",       emoji: "🏔️" },
  { name: "Luxury",                       emoji: "💎" },
  { name: "Multi-Country",                emoji: "🌍" },
  { name: "Nature and Wildlife",          emoji: "🦁" },
  { name: "Outdoor Activities and Sports",emoji: "🏄" },
  { name: "Photography",                  emoji: "📷" },
  { name: "Pilgrimage",                   emoji: "🕌" },
  { name: "Safari",                       emoji: "🦒" },
  { name: "Spa & Wellness",               emoji: "🧖" },
  { name: "Sun & Beach",                  emoji: "🏖️" },
  { name: "Sustainable Travel",           emoji: "🌿" },
  { name: "Theme Parks",                  emoji: "🎢" },
  { name: "Transportation",               emoji: "🚂" },
  { name: "VIP & Exclusive",              emoji: "⭐" },
  { name: "Winter Wonderland",            emoji: "❄️" },
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

// The maximum number of destination tabs the user can have active at once
const MAX_DESTINATIONS = 5;

// Full list of destinations available to choose from in the "More destinations" modal.
// Each entry has the country name and a flag emoji (rendered natively in the browser).
const ALL_DESTINATIONS = [
  { name: "Thailand",     flag: "🇹🇭" },
  { name: "Indonesia",    flag: "🇮🇩" },
  { name: "Peru",         flag: "🇵🇪" },
  { name: "Japan",        flag: "🇯🇵" },
  { name: "Morocco",      flag: "🇲🇦" },
  { name: "Greece",       flag: "🇬🇷" },
  { name: "Maldives",     flag: "🇲🇻" },
  { name: "Mexico",       flag: "🇲🇽" },
  { name: "UAE",          flag: "🇦🇪" },
  { name: "Italy",        flag: "🇮🇹" },
  { name: "Spain",        flag: "🇪🇸" },
  { name: "Portugal",     flag: "🇵🇹" },
  { name: "France",       flag: "🇫🇷" },
  { name: "Vietnam",      flag: "🇻🇳" },
  { name: "India",        flag: "🇮🇳" },
  { name: "Sri Lanka",    flag: "🇱🇰" },
  { name: "Tanzania",     flag: "🇹🇿" },
  { name: "Kenya",        flag: "🇰🇪" },
  { name: "Colombia",     flag: "🇨🇴" },
  { name: "Brazil",       flag: "🇧🇷" },
  { name: "Australia",    flag: "🇦🇺" },
  { name: "New Zealand",  flag: "🇳🇿" },
  { name: "Iceland",      flag: "🇮🇸" },
  { name: "Norway",       flag: "🇳🇴" },
  { name: "Croatia",      flag: "🇭🇷" },
  { name: "Turkey",       flag: "🇹🇷" },
  { name: "Egypt",        flag: "🇪🇬" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "Jordan",       flag: "🇯🇴" },
  { name: "Cambodia",     flag: "🇰🇭" },
];

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
}: DiscoveryPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("holidays");
  // Controls whether the hero shows the normal search card or the AI Experience mode
  const [aiExperienceMode, setAiExperienceMode] = useState(false);

  // Pill pulse — fires only when the toggle actually changes, not on first mount
  const toggleControls = useAnimation();
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    toggleControls.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.4, ease: "easeOut" },
    });
  }, [aiExperienceMode]);
  const [activeTourStyle, setActiveTourStyle] = useState("Culture & History");
  const [activeCountry, setActiveCountry] = useState("Thailand");

  // Style picker modal state — mirrors the same pattern as the destination picker
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([...TOUR_STYLE_FILTERS]);
  const [draftStyles, setDraftStyles] = useState<string[]>([...TOUR_STYLE_FILTERS]);

  const toggleDraftStyle = (name: string) => {
    setDraftStyles((prev) => {
      if (prev.includes(name)) return prev.length > 1 ? prev.filter((s) => s !== name) : prev;
      if (prev.length >= MAX_STYLES) return prev;
      return [...prev, name];
    });
  };

  const openStyleModal = () => {
    setDraftStyles([...selectedStyles]);
    setStyleModalOpen(true);
  };

  const applyStyles = () => {
    setSelectedStyles(draftStyles);
    if (!draftStyles.includes(activeTourStyle)) setActiveTourStyle(draftStyles[0]);
    setStyleModalOpen(false);
  };

  // Destination picker modal state.
  // `selectedDestinations` is the live list shown in the tabs (starts as the default 5).
  // `draftDestinations` holds the in-progress selection while the modal is open —
  // only committed to `selectedDestinations` when the user clicks "Apply".
  const [destinationModalOpen, setDestinationModalOpen] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([...DESTINATION_FILTERS]);
  const [draftDestinations, setDraftDestinations] = useState<string[]>([...DESTINATION_FILTERS]);

  // Toggle a destination inside the modal. Rules:
  // - If already selected → deselect it (always allowed, as long as ≥1 stays selected)
  // - If not selected → only add it if we haven't hit the MAX_DESTINATIONS limit yet
  const toggleDraftDestination = (name: string) => {
    setDraftDestinations((prev) => {
      if (prev.includes(name)) {
        // Keep at least 1 destination selected at all times
        return prev.length > 1 ? prev.filter((d) => d !== name) : prev;
      }
      // Don't go beyond the maximum allowed
      if (prev.length >= MAX_DESTINATIONS) return prev;
      return [...prev, name];
    });
  };

  // Open the modal — copy current selections into the draft so edits are non-destructive
  const openDestinationModal = () => {
    setDraftDestinations([...selectedDestinations]);
    setDestinationModalOpen(true);
  };

  // Apply the draft and close — also reset activeCountry if it was removed
  const applyDestinations = () => {
    setSelectedDestinations(draftDestinations);
    if (!draftDestinations.includes(activeCountry)) {
      setActiveCountry(draftDestinations[0]);
    }
    setDestinationModalOpen(false);
  };

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

  // Tracks the height of the white search card while AI mode is OFF.
  // Frozen when AI mode turns on — used to size the AI white card to match.
  const [lockedCardHeight, setLockedCardHeight] = useState<number | null>(null);

  // Close hotel dropdowns when clicking outside the search card
  const searchCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stop updating while AI mode is on — we keep the last measured value
    if (aiExperienceMode) return;

    const el = searchCardRef.current;
    if (!el) return;

    setLockedCardHeight(el.offsetHeight);

    const observer = new ResizeObserver(() => {
      setLockedCardHeight(el.offsetHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [aiExperienceMode]);
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
    <div className="min-h-screen bg-grey-lightest">
      {/* HERO — full-width background image with search card */}
      {/* On mobile: white background, no image. On sm+: image shows behind floating card */}
      {/* When aiExperienceMode is on, the background swaps to a melted gradient instead */}
      {/* Note: overflow-hidden was removed from here — it was clipping dropdown menus.
          The blob background layer already has its own overflow-hidden to contain the hero image animation. */}
      <div className={`relative flex flex-col bg-transparent transition-all duration-500 ${aiExperienceMode ? "h-screen overflow-hidden" : ""}`}>

        {/*
          Blob background — always in the DOM but starts invisible (opacity 0).
          Uses Framer Motion `animate` so it transitions in the exact same frame
          as the hero image transition below — no cross-fade timing gap or flash.
        */}
        <motion.div
          className={`absolute inset-0 overflow-hidden ${aiExperienceMode ? "block" : "hidden md:block"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: aiExperienceMode ? 1 : 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          style={{ pointerEvents: aiExperienceMode ? "auto" : "none" }}
        >
              {/* Base — cool grey from the design theme */}
              <div className="absolute inset-0 bg-grey-light" />

              {/* Sky zone — wide flat oval, cool grey-blue at the top (matches sky) */}
              <motion.div
                className="absolute"
                style={{
                  width: 1600, height: 500,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, #c8cfe0 0%, transparent 70%)",
                  filter: "blur(80px)",
                  top: -180, left: -150,
                }}
                animate={{ x: [0, 140, -90, 0], y: [0, 70, -50, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Ocean zone — tall wide oval, brand blue, middle band (matches water) */}
              <motion.div
                className="absolute"
                style={{
                  width: 1300, height: 480,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, #5ba8ff 0%, transparent 65%)",
                  filter: "blur(75px)",
                  top: "28%", left: -80,
                }}
                animate={{ x: [0, 120, -80, 0], y: [0, 60, -40, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />

              {/* Cool grey zone — wide oval at the bottom (replaces sand) */}
              <motion.div
                className="absolute"
                style={{
                  width: 1500, height: 550,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, #e4e7f2 0%, transparent 65%)",
                  filter: "blur(85px)",
                  bottom: -180, left: -80,
                }}
                animate={{ x: [0, 100, -120, 0], y: [0, -60, 40, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              />

              {/* Transition zone — soft teal oval bridging ocean into base, center */}
              <motion.div
                className="absolute"
                style={{
                  width: 900, height: 380,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, #7dcfcc 0%, transparent 65%)",
                  filter: "blur(65px)",
                  top: "48%", left: "18%",
                }}
                animate={{ x: [0, 160, -100, 0], y: [0, 70, -50, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              />
        </motion.div>

        {/*
          Hero photo — sits on top of the blobs and melts away when AI mode activates.
          Using Framer Motion (same engine as the blob fade above) guarantees both
          animations start in the same frame — no flash or timing gap.
        */}
        <motion.div
          className="block absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: aiExperienceMode ? 0 : 1 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          <img
            src={heroBg}
            alt="Discover the world"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/25 to-black/10" />
        </motion.div>

        <div className={`relative z-10 flex flex-col ${aiExperienceMode ? "h-full" : ""}`}>

          {/* ── Toggle + tagline — always rendered, text swaps on mode change ── */}
          <div className={`flex flex-col items-center px-6 lg:px-12 pt-16 md:pt-32 pb-6 gap-5`}>
            {/* Toggle pill — pulses when mode changes */}
            <motion.div animate={toggleControls}>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/30">
                <span className="text-white font-bold text-sm whitespace-nowrap">AI Experience</span>
                <Switch
                  checked={aiExperienceMode}
                  onCheckedChange={setAiExperienceMode}
                />
              </div>
            </motion.div>
            {/* Tagline — crossfades between the two strings */}
            <div className="relative flex items-center justify-center min-h-[56px] lg:min-h-[68px] w-full">
              {/* Default tagline — fades out when AI mode turns on */}
              <h1
                className={`absolute text-white font-extrabold text-3xl lg:text-4xl text-center drop-shadow-md leading-tight transition-all duration-500 ${
                  aiExperienceMode ? "opacity-0 -translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"
                }`}
              >
                Explore the world's hidden gems
              </h1>
              {/* AI tagline — fades in when AI mode turns on */}
              <h1
                className={`absolute text-white font-extrabold text-3xl lg:text-4xl text-center drop-shadow-md leading-tight transition-all duration-500 ${
                  aiExperienceMode ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                }`}
              >
                You dream it. We'll plan it.
              </h1>
            </div>
          </div>

          {/* ── Search area ── */}
          {/*
            Both cards sit inside this relative wrapper.
            Whichever card is "hidden" gets absolute inset-0 — scoped to THIS
            wrapper, so it can never jump up over the toggle/tagline above.
          */}
          <div className="relative">

            {/* Normal search card — fades out when AI mode turns on */}
            <div
              className={`transition-all duration-500 ${
                aiExperienceMode ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100"
              }`}
            >
            <div className="md:px-6 lg:px-12 md:pb-16 lg:pb-[128px] flex justify-center">
            <div
              ref={searchCardRef}
              className="bg-card md:rounded-2xl md:shadow-2xl w-full md:max-w-[1200px]"
            >
              {/* Tab bar — sliding blue indicator driven by refs */}
              <div ref={tabBarRef} className="relative border-b border-border">
                {/* Tab row — horizontal scroll on mobile, centered on desktop */}
                <div className="flex justify-center overflow-x-auto">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      ref={(el) => {
                        tabRefs.current[tab.id] = el;
                      }}
                      className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 pt-4 pb-3 px-6 shrink-0 border-b-2 md:border-0 ${
                        activeTab === tab.id
                          ? cn("text-primary border-primary")
                          : cn("text-foreground border-transparent")
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                      onMouseEnter={() => setHoveredTab(tab.id)}
                      onMouseLeave={() => setHoveredTab(null)}
                    >
                      <span className={`transition-transform duration-200 ${activeTab === tab.id ? "scale-110" : ""}`}>
                        {tab.icon}
                      </span>
                      <span className={`block text-lg ${activeTab === tab.id ? "font-extrabold" : "font-bold"}`}>
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Sliding blue underline — only on md+ (on mobile each tab has its own border-b-2 instead) */}
                <div
                  className="hidden md:block absolute bottom-0 h-[2.5px] bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                  }}
                />
              </div>

              {/* Search panels — one shown at a time based on activeTab */}
              {/* p-4 on mobile (tighter), p-6 on desktop */}
              <div className="p-4 md:p-6">

                {/* HOTELS PANEL */}
                {activeTab === "hotels" && (
                  <div className="flex flex-col lg:flex-row gap-3">

                      {/* Destination */}
                      <div className="flex-1 relative">
                        <button
                          className={`w-full flex items-center gap-3 h-[52px] px-4 rounded-xl border text-left transition-all ${
                            hotelOpenPanel === "destination"
                              ? "border-primary ring-2 ring-primary/20 bg-white"
                              : "border-border bg-white hover:border-primary"
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
                            className="text-primary shrink-0"
                          />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                              Destination
                            </span>
                            <span
                              className={cn("text-sm font-semibold truncate w-full", hotelLocation ? "text-foreground" : "text-grey")}
                            >
                              {hotelLocation || "Where are you going?"}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-grey shrink-0 transition-transform ${
                              hotelOpenPanel === "destination"
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                        {hotelOpenPanel === "destination" && (
                          <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
                            <div className="p-3 border-b border-muted">
                              <div className="flex items-center gap-2 bg-grey-light rounded-lg px-3 py-2">
                                <Search size={16} className="text-grey" />
                                <input
                                  type="text"
                                  placeholder="Search destination..."
                                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-grey"
                                  value={hotelLocation}
                                  onChange={(e) =>
                                    setHotelLocation(e.target.value)
                                  }
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="p-2">
                              <p className="text-[10px] font-bold text-grey uppercase tracking-wide px-3 py-2">
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
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-grey-light transition-colors"
                                  onClick={() => {
                                    setHotelLocation(dest);
                                    setHotelOpenPanel(null);
                                  }}
                                >
                                  <MapPin
                                    size={16}
                                    className="text-primary shrink-0"
                                  />
                                  <span className="text-sm text-foreground font-medium">
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
                          className={`w-full flex items-center gap-3 h-[52px] px-4 rounded-xl border text-left transition-all ${
                            hotelOpenPanel === "dates"
                              ? "border-primary ring-2 ring-primary/20 bg-white"
                              : "border-border bg-white hover:border-primary"
                          }`}
                          onClick={() =>
                            setHotelOpenPanel(
                              hotelOpenPanel === "dates" ? null : "dates"
                            )
                          }
                        >
                          <CalendarIcon
                            size={18}
                            className="text-primary shrink-0"
                          />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                              Check-in – Check-out
                            </span>
                            <span className="text-sm font-semibold text-foreground truncate w-full">
                              {hotelDateLabel}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-grey shrink-0 transition-transform ${
                              hotelOpenPanel === "dates" ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {hotelOpenPanel === "dates" && (
                          <div className="absolute top-full left-0 mt-2 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
                            <style>{`.rdp-root { --rdp-accent-color: #2681FF; --rdp-accent-background-color: rgba(38,129,255,0.10); --rdp-day_button-border-radius: 8px; margin: 0; }`}</style>
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
                          className={`w-full flex items-center gap-3 h-[52px] px-4 rounded-xl border text-left transition-all ${
                            hotelOpenPanel === "guests"
                              ? "border-primary ring-2 ring-primary/20 bg-white"
                              : "border-border bg-white hover:border-primary"
                          }`}
                          onClick={() =>
                            setHotelOpenPanel(
                              hotelOpenPanel === "guests" ? null : "guests"
                            )
                          }
                        >
                          <Users
                            size={18}
                            className="text-primary shrink-0"
                          />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                              Travellers
                            </span>
                            <span className="text-sm font-semibold text-foreground truncate w-full">
                              {hotelGuestsLabel}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-grey shrink-0 transition-transform ${
                              hotelOpenPanel === "guests" ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {hotelOpenPanel === "guests" && (
                          <div className="absolute top-full right-0 mt-2 w-[300px] bg-card rounded-xl shadow-xl border border-border z-50 p-4">
                            {hotelRooms.map((room, index) => (
                              <div
                                key={room.id}
                                className="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-b-0 border-muted"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-bold text-sm text-foreground">
                                    Room {index + 1}
                                  </span>
                                  {hotelRooms.length > 1 && (
                                    <button
                                      className="text-xs text-red-500 hover:underline font-medium"
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
                                    <div className="text-sm font-medium text-foreground">
                                      Adults
                                    </div>
                                    <div className="text-xs text-grey">
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
                                    <div className="text-sm font-medium text-foreground">
                                      Children
                                    </div>
                                    <div className="text-xs text-grey">
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
                                className="mt-3 w-full h-[36px] border border-dashed border-primary rounded-lg text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
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
                              className="mt-3 w-full h-[40px] bg-primary hover:brightness-85 text-white font-bold rounded-lg text-sm transition-all"
                              onClick={() => setHotelOpenPanel(null)}
                            >
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                    {/* w-full on mobile so button spans the full width; lg:w-auto restores shrink behaviour on desktop */}
                    <button
                      className="w-full lg:w-auto bg-primary hover:brightness-85 text-white font-extrabold text-base h-[52px] px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
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

                    {/* Secondary criteria row — stacks on mobile, inline pills on md+ */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:flex-wrap">

                      {/* 1. Trip type dropdown */}
                      <div className="relative w-full md:w-auto">
                        <button
                          onClick={() => { setFlightTripTypeOpen((o) => !o); setFlightCabinClassOpen(false); setFlightPassengersOpen(false); }}
                          className={`w-full md:w-auto flex items-center gap-1.5 h-[52px] md:h-8 px-4 md:px-3 rounded-xl md:rounded-lg border text-sm md:text-xs font-semibold transition-all ${flightTripTypeOpen ? "border-primary bg-white text-primary" : "border-border bg-white text-foreground hover:border-primary"}`}
                        >
                          {flightTripType === "roundtrip" ? "Round trip" : "Multi-city"}
                          <ChevronDown size={13} className={`shrink-0 transition-transform ${flightTripTypeOpen ? "rotate-180" : ""}`} />
                        </button>
                        {flightTripTypeOpen && (
                          <div className="absolute top-full right-0 md:left-0 md:right-auto mt-1.5 z-50 bg-card rounded-xl shadow-xl border border-border p-1.5 w-[140px] flex flex-col gap-0.5">
                            {(["roundtrip", "multicity"] as const).map((type) => (
                              <button
                                key={type}
                                onClick={() => {
                                  setFlightTripType(type);
                                  if (type === "roundtrip") setFlightLegs((prev) => prev.slice(0, 2));
                                  setFlightTripTypeOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${flightTripType === type ? "bg-primary text-white" : "text-foreground hover:bg-grey-light"}`}
                              >
                                {type === "roundtrip" ? "Round trip" : "Multi-city"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 2. Cabin class dropdown */}
                      <div className="relative w-full md:w-auto">
                        <button
                          onClick={() => { setFlightCabinClassOpen((o) => !o); setFlightTripTypeOpen(false); setFlightPassengersOpen(false); }}
                          className={`w-full md:w-auto flex items-center gap-1.5 h-[52px] md:h-8 px-4 md:px-3 rounded-xl md:rounded-lg border text-sm md:text-xs font-semibold transition-all ${flightCabinClassOpen ? "border-primary bg-white text-primary" : "border-border bg-white text-foreground hover:border-primary"}`}
                        >
                          {CABIN_CLASS_LABELS[flightCabinClass]}
                          <ChevronDown size={13} className={`shrink-0 transition-transform ${flightCabinClassOpen ? "rotate-180" : ""}`} />
                        </button>
                        {flightCabinClassOpen && (
                          <div className="absolute top-full right-0 md:left-0 md:right-auto mt-1.5 z-50 bg-card rounded-xl shadow-xl border border-border p-1.5 w-[180px] flex flex-col gap-0.5">
                            {(["economy", "premium-economy", "business", "first"] as const).map((cls) => (
                              <button
                                key={cls}
                                onClick={() => { setFlightCabinClass(cls); setFlightCabinClassOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${flightCabinClass === cls ? "bg-primary text-white" : "text-foreground hover:bg-grey-light"}`}
                              >
                                {CABIN_CLASS_LABELS[cls]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. Travellers dropdown — counters for adults/children */}
                      <div className="relative w-full md:w-auto">
                        <button
                          onClick={() => { setFlightPassengersOpen((o) => !o); setFlightTripTypeOpen(false); setFlightCabinClassOpen(false); }}
                          className={`w-full md:w-auto flex items-center gap-1.5 h-[52px] md:h-8 px-4 md:px-3 rounded-xl md:rounded-lg border text-sm md:text-xs font-semibold transition-all ${flightPassengersOpen ? "border-primary bg-white text-primary" : "border-border bg-white text-foreground hover:border-primary"}`}
                        >
                          {flightPassengersLabel}
                          <ChevronDown size={13} className={`shrink-0 transition-transform ${flightPassengersOpen ? "rotate-180" : ""}`} />
                        </button>
                        {flightPassengersOpen && (
                          <div className="absolute top-full right-0 md:left-0 md:right-auto mt-1.5 z-50 bg-card rounded-2xl shadow-xl border border-border p-5 w-[260px] flex flex-col gap-4">
                            {[
                              { label: "Adults", sub: "Age 12+", key: "adults" as const, min: 1 },
                              { label: "Children", sub: "Age 2–11", key: "children" as const, min: 0 },
                            ].map(({ label, sub, key, min }) => (
                              <div key={key} className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-foreground">{label}</div>
                                  <div className="text-xs text-grey">{sub}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => setFlightPassengers((p) => ({ ...p, [key]: Math.max(min, p[key] - 1) }))}
                                    disabled={flightPassengers[key] <= min}
                                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="text-sm font-bold text-foreground w-4 text-center">{flightPassengers[key]}</span>
                                  <button
                                    onClick={() => setFlightPassengers((p) => ({ ...p, [key]: Math.min(9, p[key] + 1) }))}
                                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => setFlightPassengersOpen(false)}
                              className="w-full bg-primary text-white font-bold text-sm py-2.5 rounded-lg hover:brightness-85 transition-all"
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
                          <div className="w-full flex items-center gap-3 h-[52px] px-4 rounded-xl border border-border bg-white focus-within:border-primary transition-all">
                            <Plane size={18} className="text-primary shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">From</span>
                              <input
                                type="text"
                                placeholder="Departure city"
                                value={flightLegs[0]?.from ?? ""}
                                onChange={(e) => {
                                  // When origin changes, also update the return leg's destination
                                  updateLeg(flightLegs[0].id, "from", e.target.value);
                                  updateLeg(flightLegs[1].id, "to", e.target.value);
                                }}
                                className="bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-grey placeholder:font-normal"
                              />
                            </div>
                          </div>
                        </div>

                        {/* To */}
                        <div className="flex-1">
                          <div className="w-full flex items-center gap-3 h-[52px] px-4 rounded-xl border border-border bg-white focus-within:border-primary transition-all">
                            <Plane size={18} className="text-primary shrink-0 rotate-90" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">To</span>
                              <input
                                type="text"
                                placeholder="Destination city"
                                value={flightLegs[0]?.to ?? ""}
                                onChange={(e) => {
                                  // Destination changes: outbound leg goes TO here, return leg comes FROM here
                                  updateLeg(flightLegs[0].id, "to", e.target.value);
                                  updateLeg(flightLegs[1].id, "from", e.target.value);
                                }}
                                className="bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-grey placeholder:font-normal"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dates — range picker for outbound + return */}
                        <div className="flex-1">
                          <div className="relative w-full">
                            <button
                              className={`w-full flex items-center gap-3 h-[52px] px-4 rounded-xl border bg-white transition-all ${flightDatesOpen ? "border-primary" : "border-border hover:border-primary"}`}
                              onClick={() => setFlightDatesOpen(!flightDatesOpen)}
                            >
                              <CalendarIcon size={18} className="text-primary shrink-0" />
                              <div className="flex flex-col items-start flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Depart – Return</span>
                                <span className={cn("text-sm font-semibold", flightDateRange?.from ? "text-foreground" : "text-grey")}>
                                  {flightDateLabel}
                                </span>
                              </div>
                            </button>
                            {flightDatesOpen && (
                              <div className="absolute top-[60px] left-0 z-50 bg-card rounded-2xl shadow-2xl border border-border p-4">
                                <style>{`.rdp-root { --rdp-accent-color: #2681FF; --rdp-accent-background-color: rgba(38,129,255,0.10); --rdp-day_button-border-radius: 8px; margin: 0; }`}</style>
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
                          className="w-full lg:w-auto bg-primary hover:brightness-85 text-white font-extrabold text-base h-[52px] px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
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
                          <div key={leg.id} className="flex flex-col md:flex-row items-stretch md:items-center gap-2">

                            {/* Leg label */}
                            <span className="text-[10px] font-extrabold text-grey uppercase tracking-wide shrink-0 md:w-12 pt-3.5 md:pt-0 text-left md:text-right">
                              {index === 0 ? "Leg 1" : index === 1 ? "Leg 2" : `Leg ${index + 1}`}
                            </span>

                            {/* From input */}
                            <div className="flex-1 flex items-center gap-3 h-[52px] px-4 rounded-xl border border-border bg-white focus-within:border-primary transition-all">
                              <Plane size={16} className="text-primary shrink-0" />
                              <input
                                type="text"
                                placeholder="From city"
                                value={leg.from}
                                onChange={(e) => updateLeg(leg.id, "from", e.target.value)}
                                className="bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-grey placeholder:font-normal w-full"
                              />
                            </div>

                            {/* Arrow between From and To */}
                            <ArrowRight size={14} className="text-grey shrink-0 hidden md:block" />

                            {/* To input */}
                            <div className="flex-1 flex items-center gap-3 h-[52px] px-4 rounded-xl border border-border bg-white focus-within:border-primary transition-all">
                              <Plane size={16} className="text-primary shrink-0 rotate-90" />
                              <input
                                type="text"
                                placeholder="To city"
                                value={leg.to}
                                onChange={(e) => updateLeg(leg.id, "to", e.target.value)}
                                className="bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-grey placeholder:font-normal w-full"
                              />
                            </div>

                            {/* Date picker for this leg (single date) */}
                            <div className="relative md:w-[160px]">
                              <button
                                className={`w-full flex items-center gap-2 h-[52px] px-3 rounded-xl border bg-white transition-all ${openLegDateId === leg.id ? "border-primary" : "border-border hover:border-primary"}`}
                                onClick={() => setOpenLegDateId(openLegDateId === leg.id ? null : leg.id)}
                              >
                                <CalendarIcon size={15} className="text-primary shrink-0" />
                                <span className={cn("text-xs font-semibold truncate", leg.date ? "text-foreground" : "text-grey")}>
                                  {leg.date ? format(leg.date, "d MMM yyyy") : "Select date"}
                                </span>
                              </button>
                              {openLegDateId === leg.id && (
                                <div className="absolute top-[60px] left-0 z-50 bg-card rounded-2xl shadow-2xl border border-border p-4">
                                  <style>{`.rdp-root { --rdp-accent-color: #2681FF; --rdp-accent-background-color: rgba(38,129,255,0.10); --rdp-day_button-border-radius: 8px; margin: 0; }`}</style>
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
                                className="shrink-0 w-9 h-9 rounded-full border border-border flex items-center justify-center text-grey hover:border-red-300 hover:text-red-400 transition-colors self-center"
                                title="Remove this leg"
                              >
                                <X size={14} />
                              </button>
                            ) : (
                              // Placeholder to keep alignment when no remove button
                              <div className="shrink-0 w-9 hidden md:block" />
                            )}
                          </div>
                        ))}

                        {/* Add another flight button — up to 6 legs */}
                        {flightLegs.length < 6 && (
                          <button
                            onClick={addLeg}
                            className="mt-1 h-[44px] w-full border border-dashed border-primary rounded-lg text-primary text-xs font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus size={14} />
                            Add another flight
                          </button>
                        )}

                        {/* Bottom row: search button */}
                        <div className="flex pt-1">

                          {/* Search button */}
                          <button
                            className="flex-1 md:flex-none bg-primary hover:brightness-85 text-white font-extrabold text-base h-[52px] px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
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

              </div>
            </div>
            </div>
            </div>

            {/* AI content wrapper — fades in when the "Try AI Experience" switch is on */}
            <div
              className={`transition-opacity duration-500 ${
                aiExperienceMode
                  ? "opacity-100 flex flex-col justify-center"
                  : "opacity-0 pointer-events-none absolute inset-0 overflow-hidden"
              }`}
            >
              {/* AI search card */}
              <div className="px-4 md:px-6 lg:px-12 pb-6 lg:pb-[128px] flex justify-center">
                <div
                  className="bg-card rounded-2xl shadow-2xl w-full max-w-[860px] flex flex-col"
                  // lockedCardHeight keeps the AI card the same size as the search card it replaced.
                  // Using minHeight (not height) so the card can grow on mobile when the stacked
                  // (flex-col) button row needs extra space — prevents the CTA from overflowing.
                  style={{ minHeight: lockedCardHeight ?? undefined }}
                >
                  <div className="flex-1 p-6">
                    <textarea
                      placeholder="Describe your ideal trip — destination, dates, budget, travel style…"
                      className="w-full h-full bg-transparent text-base text-foreground outline-none placeholder:text-grey resize-none leading-relaxed"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center px-6 pb-6 border-t border-border pt-4 shrink-0 gap-3 md:justify-between">
                    {/* Attachment — icon-only on mobile, text label on md+ */}
                    <button className="flex items-center justify-center gap-2 shrink-0 h-[52px] rounded-xl border border-border text-grey hover:text-muted-foreground hover:border-muted-foreground transition-colors w-[52px] md:w-auto md:px-4 md:font-bold md:text-sm">
                      <Paperclip size={18} />
                      <span className="hidden md:inline">Attach files</span>
                    </button>
                    {/* CTA — fills remaining space on mobile, auto width on md+ */}
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:brightness-85 text-white font-extrabold text-base h-[52px] px-6 rounded-xl transition-all shadow-md">
                      <Send size={18} />
                      Plan my trip
                    </button>
                  </div>
                </div>
              </div>

              {/* Suggestion prompts */}
              <div className="flex flex-col items-center gap-3 px-6 pb-16 lg:pb-[128px] relative z-10">
                <span className="text-white/70 text-sm">Try asking:</span>
                <div className="flex flex-wrap gap-3 justify-center max-w-[860px]">
                  {[
                    "Find me a beach resort in Bali for next month",
                    "Plan a 5-day family trip to Paris",
                    "Weekend getaway in the Alps under €500",
                    "Luxury honeymoon in the Maldives",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white text-sm px-4 py-2 rounded-full border border-white/30 transition-colors"
                      onClick={() => setAiPrompt(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>{/* end relative search-area wrapper */}
        </div>
      </div>

      {/* ── BELOW-HERO CONTENT — collapses to zero height in AI mode so it takes no space ── */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: aiExperienceMode ? 0 : 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{
          pointerEvents: aiExperienceMode ? "none" : "auto",
          overflow: "hidden",
          height: aiExperienceMode ? 0 : "auto",
        }}
      >


      {/* ── HOTELS ── */}
      {activeTab === "hotels" && (
        <section className="py-10 md:py-16 px-4 md:px-6 lg:px-12">
          <div className="max-w-[1200px] mx-auto">

            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <Heart size={24} className="text-primary md:size-7" />
                <h2 className="text-foreground font-bold text-2xl md:text-3xl leading-tight">
                  Our favourite picks
                </h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-lg">
                Average prices based on current calendar month
              </p>
            </div>

            <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
              {HOTEL_PICKS.map((hotel) => (
                <div
                  key={hotel.id}
                  className="shrink-0 w-[389px] bg-card rounded-2xl overflow-hidden shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)] cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200 snap-start"
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
                        <span className="text-lg font-bold text-foreground leading-snug">
                          {hotel.name}
                        </span>
                        <AccommodationStar
                          rating={hotel.stars}
                          offerName={hotel.name}
                          offerId={String(hotel.id)}
                          size={14}
                        />
                      </div>
                      {/* score is 0–5 in HOTEL_PICKS; RatingBlock expects 0–10 */}
                      <RatingBlock
                        reviewScore={parseFloat(hotel.score) * 2}
                        reviewCount={parseInt(hotel.reviews.replace(/[^0-9]/g, ""), 10)}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <MapPin size={13} className="shrink-0" />
                      {hotel.location}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {hotel.amenities.map((a) => (
                        <span
                          key={a.label}
                          className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
                        >
                          <AmenityIcon name={a.icon} />
                          {a.label}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-muted">
                      <div className="text-xs text-muted-foreground">Per person, per night</div>
                      <div className="text-2xl font-bold text-foreground">{hotel.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                className="border border-primary text-primary font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-primary/10 transition-colors"
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
        <section className="py-16 px-4 md:px-6 lg:px-12">
          <div className="max-w-[1200px] mx-auto">

            <div className="mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <Plane size={28} className="text-primary" />
                <h2 className="text-foreground font-bold text-3xl leading-tight">
                  Popular flight routes
                </h2>
              </div>
              <p className="text-muted-foreground text-lg">
                Average prices based on current calendar month
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {FLIGHT_ROUTES.map((route) => (
                <div
                  key={route.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.10)] cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
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
                        className={cn("absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-md",
                          route.badge === "Best value"
                            ? "bg-success"
                            : route.badge === "Direct"
                            ? "bg-warning"
                            : "bg-primary"
                        )}
                      >
                        {route.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-foreground text-base font-bold">
                      <img
                        src={`https://flagcdn.com/w160/${route.fromFlag}.png`}
                        alt={route.from}
                        className="w-5 h-3.5 rounded-sm object-cover"
                      />
                      {route.from}
                      <ArrowRight size={14} className="text-grey mx-0.5" />
                      <img
                        src={`https://flagcdn.com/w160/${route.toFlag}.png`}
                        alt={route.to}
                        className="w-5 h-3.5 rounded-sm object-cover"
                      />
                      {route.to}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GitBranch size={12} />
                        {route.stops}
                      </span>
                      <span className="w-px h-3 bg-border" />
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {route.duration}
                      </span>
                      <span className="w-px h-3 bg-border" />
                      <span className="bg-grey-light text-foreground font-bold text-xs px-2 py-0.5 rounded-sm">
                        {route.airline}
                      </span>
                    </div>

                    <div className="flex items-end justify-between pt-2 border-t border-muted">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarIcon size={13} />
                        {route.dates}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Per person</div>
                        <div className="text-2xl font-bold text-foreground">{route.price}</div>
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
          <section className="py-10 md:py-16">

            {/* Constrained content — aligns with hero card left edge */}
            <div className="px-[max(1rem,calc((100vw-75rem)/2))] md:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] mb-5 md:mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <TreePalm size={24} className="text-primary md:size-7" />
                <h2 className="text-foreground font-bold text-2xl md:text-3xl leading-tight">
                  Tours for every travel style
                </h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-lg">
                Average prices based on current calendar month
              </p>
            </div>

            <div ref={styleTabBarRef} className="mx-[max(1rem,calc((100vw-75rem)/2))] md:mx-[max(1.5rem,calc((100vw-75rem)/2))] lg:mx-[max(3rem,calc((100vw-75rem)/2))] relative border-b border-border mb-5 md:mb-8 flex gap-0 overflow-x-auto">
              {selectedStyles.map((style) => (
                <button
                  key={style}
                  ref={(el) => { styleTabRefs.current[style] = el; }}
                  onClick={() => setActiveTourStyle(style)}
                  onMouseEnter={() => setHoveredStyle(style)}
                  onMouseLeave={() => setHoveredStyle(null)}
                  className={cn("shrink-0 px-5 py-3 text-base font-bold whitespace-nowrap",
                    activeTourStyle === style ? "text-primary" : "text-foreground"
                  )}
                >
                  {style}
                </button>
              ))}
              <button
                onClick={openStyleModal}
                className="shrink-0 ml-auto px-5 py-3 text-base font-bold text-primary flex items-center gap-1.5"
              >
                More styles
                <ChevronDown size={16} />
              </button>
              <div
                className="absolute bottom-0 h-[2.5px] bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ left: styleIndicator.left, width: styleIndicator.width }}
              />
            </div>

            {/* Scroll row: starts at the same left edge as the hero card.
                pl-[max(pad,(100vw-75rem)/2)] dynamically tracks the mx-auto centering
                so cards align correctly on both narrow and wide screens. */}
            <div className="pl-[max(1rem,calc((100vw-75rem)/2))] md:pl-[max(1.5rem,calc((100vw-75rem)/2))] lg:pl-[max(3rem,calc((100vw-75rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-75rem)/2))] md:[scroll-padding-left:max(1.5rem,calc((100vw-75rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-75rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
              {TOUR_CARDS.map((tour) => (
                <div key={tour.id} className="shrink-0 w-[320px] snap-start">
                  <TourCard tour={tour} onSelect={() => onTourSelect(tour)} />
                </div>
              ))}
            </div>

            <div className="px-[max(1rem,calc((100vw-75rem)/2))] md:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] flex justify-end">
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
                className="border border-primary text-primary font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-primary/10 transition-colors"
              >
                View all {activeTourStyle} tours (35)
              </button>
            </div>

          </section>

          <hr className="border-border mx-4 md:mx-6 lg:mx-[max(3rem,calc((100vw-75rem)/2))]" />

          {/* ── Section 2: Tours by destination ──────────────────────────── */}
          <section className="py-10 md:py-16">

            <div className="px-[max(1rem,calc((100vw-75rem)/2))] md:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] mb-5 md:mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <Flag size={24} className="text-primary md:size-7" />
                <h2 className="text-foreground font-bold text-2xl md:text-3xl leading-tight">
                  Your next dream destination
                </h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-lg">
                Average prices based on current calendar month
              </p>
            </div>

            <div ref={countryTabBarRef} className="mx-[max(1rem,calc((100vw-75rem)/2))] md:mx-[max(1.5rem,calc((100vw-75rem)/2))] lg:mx-[max(3rem,calc((100vw-75rem)/2))] relative border-b border-border mb-5 md:mb-8 flex gap-0 overflow-x-auto">
              {/* Render only the user's selected destinations as tabs */}
              {selectedDestinations.map((country) => (
                <button
                  key={country}
                  ref={(el) => { countryTabRefs.current[country] = el; }}
                  onClick={() => setActiveCountry(country)}
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  className={cn("shrink-0 px-5 py-3 text-base font-bold whitespace-nowrap",
                    activeCountry === country ? "text-primary" : "text-foreground"
                  )}
                >
                  {country}
                </button>
              ))}
              {/* "More destinations" opens the picker modal */}
              <button
                onClick={openDestinationModal}
                className="shrink-0 ml-auto px-5 py-3 text-base font-bold text-primary flex items-center gap-1.5"
              >
                More destinations
                <ChevronDown size={16} />
              </button>
              <div
                className="absolute bottom-0 h-[2.5px] bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ left: countryIndicator.left, width: countryIndicator.width }}
              />
            </div>

            <div className="pl-[max(1rem,calc((100vw-75rem)/2))] md:pl-[max(1.5rem,calc((100vw-75rem)/2))] lg:pl-[max(3rem,calc((100vw-75rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-75rem)/2))] md:[scroll-padding-left:max(1.5rem,calc((100vw-75rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-75rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
              {(TOURS_BY_COUNTRY[activeCountry] ?? []).map((tour) => (
                <div key={tour.id} className="shrink-0 w-[320px] snap-start">
                  <TourCard tour={tour} onSelect={() => onTourSelect(tour)} />
                </div>
              ))}
            </div>

            <div className="px-[max(1rem,calc((100vw-75rem)/2))] md:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] flex justify-end">
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
                className="border border-primary text-primary font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-primary/10 transition-colors"
              >
                View all {activeCountry} tours (22)
              </button>
            </div>

          </section>

          <hr className="border-border mx-4 md:mx-6 lg:mx-[max(3rem,calc((100vw-75rem)/2))]" />

          {/* ── Section 3: Travel the way you like ───────────────────────── */}
          <section className="py-10 md:py-16">

            <div className="px-[max(1rem,calc((100vw-75rem)/2))] md:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] mb-5 md:mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <GitBranch size={24} className="text-primary md:size-7" />
                <h2 className="text-foreground font-bold text-2xl md:text-3xl leading-tight">
                  Travel the way you like
                </h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-lg">
                Find the right style of holiday for you
              </p>
            </div>

            <div ref={tripTypeTabBarRef} className="mx-[max(1rem,calc((100vw-75rem)/2))] md:mx-[max(1.5rem,calc((100vw-75rem)/2))] lg:mx-[max(3rem,calc((100vw-75rem)/2))] relative border-b border-border mb-5 md:mb-8 flex gap-0 overflow-x-auto">
              {TRIP_TYPES.map((tt) => (
                <button
                  key={tt.id}
                  ref={(el) => { tripTypeTabRefs.current[tt.id] = el; }}
                  onClick={() => setActiveTripType(tt.id)}
                  onMouseEnter={() => setHoveredTripType(tt.id)}
                  onMouseLeave={() => setHoveredTripType(null)}
                  className={cn("shrink-0 px-5 py-3 text-base font-bold whitespace-nowrap",
                    activeTripType === tt.id ? "text-primary" : "text-foreground"
                  )}
                >
                  {tt.label}
                </button>
              ))}
              <div
                className="absolute bottom-0 h-[2.5px] bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ left: tripTypeIndicator.left, width: tripTypeIndicator.width }}
              />
            </div>

            {activeTripType === "hotel-flight" && (
              <div className="pl-[max(1rem,calc((100vw-75rem)/2))] md:pl-[max(1.5rem,calc((100vw-75rem)/2))] lg:pl-[max(3rem,calc((100vw-75rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-75rem)/2))] md:[scroll-padding-left:max(1.5rem,calc((100vw-75rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-75rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
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
              <div className="pl-[max(1rem,calc((100vw-75rem)/2))] md:pl-[max(1.5rem,calc((100vw-75rem)/2))] lg:pl-[max(3rem,calc((100vw-75rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-75rem)/2))] md:[scroll-padding-left:max(1.5rem,calc((100vw-75rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-75rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
                {(TRIP_TYPE_CARDS[activeTripType] ?? []).map((card) => (
                  <div key={card.id} className="shrink-0 w-[300px] snap-start">
                    <div
                      className="bg-card rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.10)] cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
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
                        <span className={cn("absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                          activeTripType === "group-tour"      ? "bg-purple-100 text-purple-700" :
                          activeTripType === "individual-tour" ? "bg-green-100 text-green-700" :
                          activeTripType === "round-trip"      ? "bg-amber-100 text-amber-700" :
                                                                 "bg-red-100 text-red-700"
                        )}>
                          {TRIP_TYPES.find((t) => t.id === activeTripType)?.icon}
                          {TRIP_TYPES.find((t) => t.id === activeTripType)?.label}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        <div className="text-xs text-foreground">{card.destination}</div>
                        <div className="text-base font-bold text-foreground leading-snug">{card.title}</div>
                        <div className="flex items-end justify-between pt-4 border-t border-muted">
                          <div className="flex items-center gap-1.5 text-xs text-foreground">
                            <Clock size={14} />
                            {card.duration}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-foreground">Per person</div>
                            <div className="text-xl font-bold text-foreground">{card.price}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-[max(1rem,calc((100vw-75rem)/2))] md:px-[max(1.5rem,calc((100vw-75rem)/2))] lg:px-[max(3rem,calc((100vw-75rem)/2))] flex justify-end">
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
                className="border border-primary text-primary font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-primary/10 transition-colors"
              >
                View all {TRIP_TYPES.find((t) => t.id === activeTripType)?.label} holidays
              </button>
            </div>

          </section>


        </>
      )}

      {/* Footer */}
      <div className="text-center py-8 border-t border-border">
        <p className="text-grey text-xs">
          © 2026 Nezasa · TripBuilder · Over 500,000 hotels worldwide
        </p>
      </div>
      </motion.div>{/* end below-hero content */}

      {/* ── Style Picker Modal ── */}
      {styleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setStyleModalOpen(false)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-lg h-[584px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold text-foreground">Choose styles</h2>
              <button
                onClick={() => setStyleModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-grey-lightest transition-colors text-muted-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable grid */}
            <div className="overflow-y-auto px-6 pb-4 flex-1">
              <div className="grid grid-cols-2 gap-2">
                {ALL_STYLES.map((style) => {
                  const isSelected = draftStyles.includes(style.name);
                  const isAtMax = !isSelected && draftStyles.length >= MAX_STYLES;
                  return (
                    <button
                      key={style.name}
                      onClick={() => toggleDraftStyle(style.name)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : isAtMax
                          ? "border-border bg-grey-lightest opacity-40 cursor-not-allowed"
                          : "border-border hover:border-primary/40 hover:bg-grey-lightest cursor-pointer"
                      )}
                    >
                      <span className="text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full bg-grey-lightest shrink-0">
                        {style.emoji}
                      </span>
                      <span className={cn(
                        "text-sm font-semibold leading-snug",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {style.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center gap-3">
              <p className="text-xs text-muted-foreground flex-1 leading-snug">
                {draftStyles.length < MAX_STYLES
                  ? `Select up to ${MAX_STYLES} styles · ${MAX_STYLES - draftStyles.length} slot${MAX_STYLES - draftStyles.length === 1 ? "" : "s"} remaining`
                  : "All 5 slots filled · deselect one to swap it for another"}
              </p>
              <button
                onClick={() => setStyleModalOpen(false)}
                className="shrink-0 px-5 py-2.5 text-sm font-bold text-foreground border border-border rounded-lg hover:bg-grey-lightest transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyStyles}
                className="shrink-0 px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Destination Picker Modal ── */}
      {/* We render a custom modal here rather than using shadcn Dialog so we have
          full control over the layout without extra wrapper complexity. */}
      {destinationModalOpen && (
        // Backdrop — clicking outside the card closes without saving
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setDestinationModalOpen(false)}
        >
          {/* Card — stopPropagation prevents clicks inside from closing the modal */}
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-lg h-[584px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold text-foreground">Choose destinations</h2>
              <button
                onClick={() => setDestinationModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-grey-lightest transition-colors text-muted-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable grid of all destinations */}
            <div className="overflow-y-auto px-6 pb-4 flex-1">
              <div className="grid grid-cols-2 gap-2">
                {ALL_DESTINATIONS.map((dest) => {
                  const isSelected = draftDestinations.includes(dest.name);
                  // If this destination is NOT selected and we're already at max,
                  // the button still renders but clicking it has no effect.
                  const isAtMax = !isSelected && draftDestinations.length >= MAX_DESTINATIONS;

                  return (
                    <button
                      key={dest.name}
                      onClick={() => toggleDraftDestination(dest.name)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150",
                        isSelected
                          // Selected state: brand border + subtle blue tint background
                          ? "border-primary bg-primary/5"
                          : isAtMax
                          // At max and not selected: show as visually disabled
                          ? "border-border bg-grey-lightest opacity-40 cursor-not-allowed"
                          // Normal unselected state
                          : "border-border hover:border-primary/40 hover:bg-grey-lightest cursor-pointer"
                      )}
                    >
                      {/* Flag emoji in a circle container */}
                      <span className="text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full bg-grey-lightest shrink-0">
                        {dest.flag}
                      </span>
                      <span className={cn(
                        "text-sm font-semibold leading-snug",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {dest.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer — hint on the left, action buttons on the right */}
            <div className="px-6 py-4 border-t border-border flex items-center gap-3">
              {/* Hint text lives here permanently so the footer height never changes.
                  The message swaps between a soft prompt and the "deselect first" tip
                  without anything above shifting up or down. */}
              <p className="text-xs text-muted-foreground flex-1 leading-snug">
                {draftDestinations.length < MAX_DESTINATIONS
                  ? `Select up to ${MAX_DESTINATIONS} destinations · ${MAX_DESTINATIONS - draftDestinations.length} slot${MAX_DESTINATIONS - draftDestinations.length === 1 ? "" : "s"} remaining`
                  : "All 5 slots filled · deselect one to swap it for another"}
              </p>
              <button
                onClick={() => setDestinationModalOpen(false)}
                className="shrink-0 px-5 py-2.5 text-sm font-bold text-foreground border border-border rounded-lg hover:bg-grey-lightest transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyDestinations}
                className="shrink-0 px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

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
        className="w-[28px] h-[28px] rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus size={14} />
      </button>
      <span className="w-[20px] text-center font-bold text-sm text-foreground">
        {value}
      </span>
      <button
        onClick={onIncrement}
        disabled={value >= max}
        className="w-[28px] h-[28px] rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
      className="bg-card rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.10)] cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
      onClick={onSelect}
    >
      <img
        src={tour.image}
        alt={tour.title}
        className="w-full h-[200px] object-cover"
      />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <img
            src={`https://flagcdn.com/w160/${tour.flag}.png`}
            alt={tour.country}
            className="w-5 h-5 rounded-full object-cover"
          />
          {tour.country}
        </div>
        <div className="text-base font-bold text-foreground leading-snug">
          {tour.title}
        </div>
        <div className="text-sm text-foreground leading-relaxed line-clamp-2">
          {tour.desc}
        </div>
        <div className="flex items-end justify-between pt-4 border-t border-muted">
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <Clock size={14} />
            {tour.duration}
          </div>
          <div className="text-right">
            <div className="text-xs text-foreground">Per person</div>
            <div className="text-xl font-bold text-foreground">{tour.price}</div>
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
      className="bg-card rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.10)] cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
      onClick={onSelect}
    >
      <img
        src={dest.image}
        alt={dest.destination}
        className="w-full h-[200px] object-cover"
      />

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-base font-bold text-foreground leading-snug">
          <img
            src={`https://flagcdn.com/w160/${dest.flag}.png`}
            alt={dest.country}
            className="w-5 h-5 rounded-full object-cover shrink-0"
          />
          {dest.destination}
        </div>
        <div className="text-sm text-foreground leading-relaxed line-clamp-2">
          {dest.desc}
        </div>
        <div className="flex items-end justify-between pt-4 border-t border-muted">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <RotateCcw size={14} />
              Return flights
            </div>
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <Moon size={14} />
              {dest.nights} nights
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-foreground">Per person</div>
            <div className="text-xl font-bold text-foreground">{dest.price}</div>
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
