import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "../../../shared/components/ui/utils";
// Shared shadcn/ui Button — used for real action CTAs (search, view-all, apply).
import { Button } from "../../../shared/components/ui/button";
import { PageContainer } from "../../../shared/components/PageContainer";
// AccommodationStar renders the real star icons (same component as production TripBuilder)
import AccommodationStar from "../../../shared/components/AccommodationStar";
import RatingBlock from "../../../shared/components/RatingBlock";
import PackageSearchForm from "../components/PackageSearchForm";
import heroBg from "../../../../assets/discovery-background.jpg";
// Real tour images from mock data — each card now shows the actual destination photo
import { DISCOVERY_TOUR_MAP } from "../../../mocks/tours";
// Destination registry — used to resolve a card's destCode into the full label
// and isCached flag that the search hook expects.
import { DESTINATIONS } from "../../../mocks/destinations";
// Loading kit — ImageWithPlaceholder reserves space, lazy-loads, and fades
// images in. Used for the hero (with priority) and all big card images on
// this page so we never see layout shift as photos arrive.
import { ImageWithPlaceholder } from "../../../shared/components/loading";
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
  Compass,
  Footprints,
  Bus,
  // Cruises tab icon (Ship for ocean) and Events tab icon (Ticket for ticketed events)
  Ship,
  Ticket,
  // Stopover tab icon — a route with waypoints evokes "break the journey".
  Route,
  // Settings gear — opens the Discovery display-settings popover (top-right).
  Settings,
} from "lucide-react";
import { Switch } from "../../../shared/components/ui/switch";
// Glassy gear → popover that holds the Discovery display settings.
import { Popover, PopoverContent, PopoverTrigger } from "../../../shared/components/ui/popover";
import DiscoverySettingsPanel from "../components/DiscoverySettingsPanel";
// Shared settings (which tabs are on, which stopover airline) live in this context.
import { useSettings } from "../../../shared/contexts/SettingsContext";
// Shared responsive date picker: dropdown on desktop, bottom drawer on mobile.
import { ResponsiveDatePicker } from "../../../shared/components/ui/responsive-date-picker";
import { type DateRange } from "react-day-picker";
// Shared range-picker logic: 1st click = from, 2nd = to, re-open restarts.
import { stepRange, isRangeComplete } from "../../../shared/utils/dateRange";
import { format, addDays } from "date-fns";
import "react-day-picker/dist/style.css";
import type { FlightSearchCriteria, FlightLeg, HolidaySearchCriteria } from "../../../App";
// Searchable city/airport picker — replaces the plain From/To text inputs in
// the Flights tab so users can pick a city by name and we store the IATA code.
import { FlightSearchForm } from "../components/flightSearch/FlightSearchForm";
// Activities tab uses a self-contained search form, mirroring how Holidays
// uses PackageSearchForm. The form is the only "Activities" UI on the
// discovery hero; results live on a separate page.
import ActivitySearchForm, { ACTIVITY_TYPE_OPTIONS } from "../components/ActivitySearchForm";
import type { Activity, ActivitySearchCriteria, ActivityType } from "../../../types";
// Full Activity mock lookup — Discovery cards resolve their activityId here to
// open the right ActivityDetailPage when clicked.
import { ACTIVITY_BY_ID } from "../../../mocks/activities";
// AI Experience entry — pill-shaped moodboard composer with vibes, places,
// inspirations, and a single-line text input. Replaces the old textarea card.
import AiMoodboardComposer from "../components/aiItinerary/AiMoodboardComposer";

// --- Types ---

// Exported so App.tsx can type the "which tab should Discovery open on" state
// it passes back in via `initialActiveTab` (e.g. returning from the flights list).
export type TabId = "hotels" | "flights" | "stopover" | "holidays" | "activities" | "cruises" | "events";

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
  // Called when the user submits the Stopover search form → leads to
  // FlightListPage in stopover-only mode (offers on the chosen leg, Fiji only).
  onStopoverSearch: (criteria: FlightSearchCriteria) => void;
  // Called when the user submits the Holidays search form → leads to HolidayListPage
  onHolidaySearch: (criteria: HolidaySearchCriteria) => void;
  // Called when the user submits the Activities search form → leads to ActivityListPage
  onActivitySearch: (criteria: ActivitySearchCriteria) => void;
  // Called when the user clicks a one-day experience or iconic event card on
  // the Experiences tab → leads straight to ActivityDetailPage, skipping the list.
  onActivityDirectSelect: (activity: Activity) => void;
  // Called when the user submits the AI Experience "Plan my trip" prompt
  // (or taps a suggestion chip) → leads to the new AI Itinerary flow.
  // Optional so existing callers stay compiling; defaults to a no-op if absent.
  onAiPlannerStart?: (prompt: string) => void;
  // Controlled AI Experience toggle state — lifted to App.tsx so it survives
  // the Discovery → AI Itinerary → Back round trip. When `aiExperienceMode`
  // is set to `true` by App.tsx before navigating back here, the user lands
  // on the AI version of the hero instead of the default search card.
  aiExperienceMode: boolean;
  onAiExperienceModeChange: (mode: boolean) => void;
  // Which tab to open on when this page (re)mounts. App.tsx sets this to the
  // last tab the user searched from, so returning from e.g. the flights list
  // lands back on the Flights tab instead of the default. Defaults to "holidays".
  initialActiveTab?: TabId;
};

// --- Tab Definitions ---
// Activities is the newest tab — added last so existing users still land on
// Holidays by default and the existing tab order is undisturbed.
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  // Holidays is the default — Tours and Holidays merged into one experience
  { id: "holidays", label: "Holidays", icon: <Sun size={20} /> },
  { id: "hotels", label: "Hotels", icon: <Building2 size={20} /> },
  { id: "flights", label: "Flights", icon: <Plane size={20} /> },
  // Dedicated stopover journey — Fiji Airways routes with a multi-night stay
  // built into one leg. Sits right after Flights as a close cousin.
  { id: "stopover", label: "Stopover", icon: <Route size={20} /> },
  // Compass icon evokes the experience-led "explore by activity" framing
  { id: "activities", label: "Experiences", icon: <Compass size={20} /> },
  // Promoted out of Experiences — Cruises and Events are headline categories
  // travellers should be able to discover straight from the hero. Search inside
  // these tabs uses the same form as Experiences but with the Activity-type
  // field hidden, since the tab itself dictates the type.
  { id: "cruises", label: "Cruises", icon: <Ship size={20} /> },
  { id: "events", label: "Events", icon: <Ticket size={20} /> },
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

// Helper: pulls the real mainImage from the tour mock data so each card shows its actual destination photo
const tourImg = (id: number) => DISCOVERY_TOUR_MAP[id]?.mainImage ?? "";

// Same cards shown regardless of which style filter is active (would be server-filtered in production).
const TOUR_CARDS = [
  { id: 1, country: "Thailand", flag: "th", title: "Classic Thailand Explorer", desc: "Perfect introduction to Thailand with Bangkok temples, cultural experiences, and island hopping.", duration: "8 days", price: "from $1,650", image: tourImg(1) },
  { id: 2, country: "Indonesia", flag: "id", title: "Cultural Bali Discovery", desc: "Immerse yourself in Balinese culture with traditional villages, temples, and artisan workshops.", duration: "8 days", price: "from $1,980", image: tourImg(2) },
  // Bus tour — also surfaced under the "Bus Tours" tab in "Travel the way you like".
  // Lives here so it appears in the Culture & History travel style carousel too.
  { id: 22, country: "Italy", flag: "it", title: "Lake Garda Wine Festival Bus Tour", desc: "4-day coach tour from Germany to Italy's Lake Garda with the Bardolino wine festival.", duration: "4 days", price: "from €649", image: tourImg(22) },
  { id: 3, country: "Peru", flag: "pe", title: "Classic Peru Adventure", desc: "The ultimate Peru experience with Machu Picchu, Sacred Valley, and Lima exploration.", duration: "8 days", price: "from $1,980", image: tourImg(3) },
  { id: 4, country: "Thailand", flag: "th", title: "Island Paradise", desc: "Focus on Thailand's stunning islands with beach time, snorkeling, and tropical adventures.", duration: "9 days", price: "from $1,790", image: tourImg(4) },
  { id: 5, country: "Peru", flag: "pe", title: "Inca Trail Adventure", desc: "For the adventurous traveler: trek the classic Inca Trail to Machu Picchu.", duration: "8 days", price: "from $2,450", image: tourImg(5) },
  { id: 6, country: "Peru", flag: "pe", title: "Amazon & Andes", desc: "Experience Peru's diverse landscapes from Amazon rainforest to high-altitude lakes.", duration: "10 days", price: "from $2,180", image: tourImg(6) },
];

// ─── Experiences tab — sample data ────────────────────────────────────────────
// Three local arrays drive the below-hero content on the Experiences tab.
// Shape matches TourCardData so we reuse <TourCard> instead of duplicating one.

// 1. "Experience what you like" — activities grouped by their type. Each entry
//    matches an Activity in src/mocks/activities.ts via `activityId`, so
//    clicking the card opens the right ActivityDetailPage. Cards are shown
//    inside a tab bar (one tab per activity type) mirroring the
//    "Travel the way you like" pattern on the Holidays tab.
//
// Order of keys here doesn't matter — the tab order comes from
// ACTIVITY_TYPE_OPTIONS (cruise-ship is already first there).
type ActivityCardData = {
  id: number;
  activityId: string;
  country: string;
  flag: string;
  title: string;
  desc: string;
  duration: string;
  price: string;
  image: string;
};

const ACTIVITY_CARDS_BY_TYPE: Record<ActivityType, ActivityCardData[]> = {
  "cruise-ship": [
    { id: 301, activityId: "norwegian-fjords-cruise",          country: "Norway",    flag: "no", title: "Norwegian Fjords Ocean Cruise", desc: "Seven nights through UNESCO-listed Geirangerfjord with midnight-sun cruising and onboard Michelin-trained dining.", duration: "7 days",  price: "from £1,899", image: "https://images.unsplash.com/photo-1616072224282-c2696dc9853b?w=800&h=600&fit=crop&auto=format" },
    { id: 302, activityId: "western-mediterranean-explorer",   country: "Spain",     flag: "es", title: "Western Mediterranean Explorer", desc: "Barcelona, Marseille, Rome, and Palma in one eight-day Mediterranean loop aboard a mega-ship.",                     duration: "8 days",  price: "from $899",   image: "https://images.unsplash.com/photo-1564959130715-3cca11b6e3ed?w=800&h=600&fit=crop&auto=format" },
    { id: 303, activityId: "caribbean-island-hopping",         country: "Bahamas",   flag: "bs", title: "Caribbean Island Hopping",       desc: "Eight days of turquoise water with stops at CocoCay, St. Thomas, and St. Maarten from Miami.",                     duration: "8 days",  price: "from $999",   image: "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?w=800&h=600&fit=crop&auto=format" },
    { id: 304, activityId: "alaska-inside-passage",            country: "USA",       flag: "us", title: "Alaska Inside Passage",          desc: "Glacier Bay, Juneau, Skagway, and Ketchikan on a classic Inside Passage round-trip from Seattle.",                  duration: "8 days",  price: "from $1,299", image: "https://images.unsplash.com/photo-1504986760686-def829959a20?w=800&h=600&fit=crop&auto=format" },
    { id: 305, activityId: "greek-islands-turkey",             country: "Greece",    flag: "gr", title: "Greek Islands & Turkey",         desc: "Mykonos, Santorini, Rhodes, and Kusadasi over eight days of whitewashed villages and Aegean blue.",                 duration: "8 days",  price: "from $1,349", image: "https://images.unsplash.com/photo-1535919020263-f79f5313f336?w=800&h=600&fit=crop&auto=format" },
    { id: 306, activityId: "disney-magic-at-sea",              country: "USA",       flag: "us", title: "Disney Magic at Sea",            desc: "Five nights of family-friendly fun from Port Canaveral with a private day on Castaway Cay.",                       duration: "5 days",  price: "from $1,299", image: "https://images.unsplash.com/photo-1509897539248-f507156634e8?w=800&h=600&fit=crop&auto=format" },
  ],
  "river-cruise": [
    { id: 311, activityId: "rhine-river-cruise",        country: "Germany",     flag: "de", title: "Rhine River Cruise — Amsterdam to Basel", desc: "Eight days along the Rhine with castle-strewn gorges, Strasbourg's old town, and Black Forest wines.", duration: "8 days", price: "from £2,299", image: "https://images.unsplash.com/photo-1679089232997-a7feb6015579?w=800&h=600&fit=crop&auto=format" },
    { id: 312, activityId: "lake-geneva-sunset-cruise", country: "Switzerland", flag: "ch", title: "Lake Geneva Sunset Cruise",                desc: "A two-hour catamaran sail past the Château de Chillon with a glass of Lavaux wine.",                    duration: "2 hours", price: "from CHF 60", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&h=600&fit=crop&auto=format" },
  ],
  "multi-day-tour": [
    { id: 321, activityId: "tuscany-road-trip",          country: "Italy",          flag: "it", title: "Tuscany Road Trip",      desc: "Six days through Florence, Siena, and the Val d'Orcia — Renaissance art, Chianti, and hilltop villages.",      duration: "6 days", price: "from £1,499", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format" },
    { id: 326, activityId: "champagne-day-trip",         country: "France",         flag: "fr", title: "Champagne Vineyard Day Trip", desc: "Reims and Épernay cellar visits with three tastings — round-trip from Paris by minibus.",                    duration: "Full day", price: "from €189",  image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&fit=crop&auto=format" },
  ],
  "walking-tour": [
    { id: 331, activityId: "cinque-terre-walk",  country: "Italy", flag: "it", title: "Cinque Terre Coastal Walk", desc: "Self-guided five-day walk linking the five UNESCO villages along the Ligurian coast.",        duration: "5 days",  price: "from £899", image: "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800&h=600&fit=crop&auto=format" },
    { id: 332, activityId: "rome-night-walk",    country: "Italy", flag: "it", title: "Rome by Night Walking Tour", desc: "A 3-hour stroll past the Colosseum, Trevi Fountain, and Pantheon — all lit up after dark.",   duration: "3 hours", price: "from €35",  image: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800&h=600&fit=crop&auto=format" },
    { id: 333, activityId: "kyoto-food-crawl",   country: "Japan", flag: "jp", title: "Kyoto Street Food Crawl",    desc: "Six tastings through Nishiki Market and the Gion district with a local guide.",                duration: "4 hours", price: "from €85",  image: "https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&h=600&fit=crop&auto=format" },
  ],
  "bicycle-tour": [
    { id: 341, activityId: "loire-bicycle-tour", country: "France", flag: "fr", title: "Loire Valley Châteaux Bike Tour", desc: "Seven days of easy riding past Chenonceau, Amboise, and Blois with luggage transfers between hotels.", duration: "7 days", price: "from £1,349", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop&auto=format" },
  ],
  "safari": [
    { id: 351, activityId: "kenya-safari", country: "Kenya", flag: "ke", title: "Kenya Big Five Safari", desc: "Eight days across the Maasai Mara, Lake Nakuru, and Amboseli — Big Five game drives with Kilimanjaro views.", duration: "8 days", price: "from £3,299", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format" },
  ],
  "expedition": [
    { id: 361, activityId: "antarctica-expedition",      country: "Antarctica", flag: "aq", title: "Antarctica Classic Expedition", desc: "Eleven days from Ushuaia to the Antarctic Peninsula — penguin colonies, Zodiac landings, and ice cliffs.", duration: "11 days",     price: "from £7,499", image: "https://images.unsplash.com/photo-1551845041-63e8e76836ea?w=800&h=600&fit=crop&auto=format" },
    { id: 362, activityId: "grand-canyon-helicopter",    country: "USA",        flag: "us", title: "Grand Canyon Helicopter Tour",  desc: "A 45-minute helicopter ride from Vegas over the West Rim with a Champagne landing.",                        duration: "Half day",     price: "from $399",  image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop&auto=format" },
    { id: 363, activityId: "cappadocia-hot-air-balloon", country: "Türkiye",    flag: "tr", title: "Cappadocia Hot-Air Balloon",    desc: "Sunrise float over fairy chimneys and ancient cave villages — toast with a glass of fizz on landing.",       duration: "1 hour flight", price: "from €230",  image: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=800&h=600&fit=crop&auto=format" },
  ],
  // Ticketed events — trips built around a fixture / festival.
  // Each `activityId` matches an Activity in src/mocks/activities.ts (type "event")
  // so clicking the card lands directly on its ActivityDetailPage with hotel +
  // itinerary + ticket package details.
  "event": [
    { id: 371, activityId: "wimbledon-package",        country: "United Kingdom", flag: "gb", title: "Wimbledon Championships",   desc: "Centre Court grass-court tennis with strawberries and cream — late June to mid-July.",                            duration: "Match day",    price: "from £180",   image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop&auto=format" },
    { id: 372, activityId: "monaco-gp-package",        country: "Monaco",         flag: "mc", title: "Monaco Grand Prix",          desc: "Formula 1 racing through the streets of Monte-Carlo — the crown jewel of the F1 calendar, every May.",            duration: "Race weekend", price: "from €1,250", image: "https://images.unsplash.com/photo-1614949194403-9602bdc14a3a?w=800&h=600&fit=crop&auto=format" },
    { id: 373, activityId: "nyc-marathon-package",     country: "USA",            flag: "us", title: "TCS New York City Marathon", desc: "26.2 miles through all five boroughs on the first Sunday of November — 50,000 runners, two million spectators.", duration: "Race day",     price: "from $349",   image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&h=600&fit=crop&auto=format" },
    { id: 374, activityId: "oktoberfest-package",      country: "Germany",        flag: "de", title: "Munich Oktoberfest",         desc: "The world's biggest beer festival — 14 vast tents, lederhosen and brass bands, mid-September to early October.",  duration: "3 days",       price: "from €690",   image: "https://images.unsplash.com/photo-1661078226424-28f190c723e0?w=800&h=600&fit=crop&auto=format" },
    { id: 375, activityId: "rio-carnival-package",     country: "Brazil",         flag: "br", title: "Rio de Janeiro Carnival",    desc: "Samba parades at the Sambódromo and city-wide street blocos — the week before Lent in February or March.",      duration: "4 nights",     price: "from $1,290", image: "https://images.unsplash.com/photo-1522008629172-0c17aa47d1ee?w=800&h=600&fit=crop&auto=format" },
    { id: 376, activityId: "edinburgh-fringe-package", country: "United Kingdom", flag: "gb", title: "Edinburgh Festival Fringe",  desc: "The world's largest arts festival — comedy, theatre, and street performers take over the city every August.",    duration: "5 nights",     price: "from £540",   image: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=800&h=600&fit=crop&auto=format" },
  ],
};

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

// Three sample cards per destination — each pulls its real photo from the tour mock data
const TOURS_BY_COUNTRY: Record<string, typeof TOUR_CARDS> = {
  Thailand: [
    { id: 7, country: "Thailand", flag: "th", title: "Bangkok & Beyond", desc: "Discover the energy of Bangkok alongside peaceful temples and floating markets.", duration: "10 days", price: "from $1,480", image: tourImg(7) },
    { id: 8, country: "Thailand", flag: "th", title: "Northern Thailand Highlights", desc: "Chiang Mai hill tribes, elephant sanctuaries, and lush mountain scenery.", duration: "7 days", price: "from $1,250", image: tourImg(8) },
    { id: 9, country: "Thailand", flag: "th", title: "Phuket & the Islands", desc: "Sun, sea, and stunning scenery across Thailand's most beautiful southern islands.", duration: "9 days", price: "from $1,890", image: tourImg(9) },
  ],
  Indonesia: [
    { id: 10, country: "Indonesia", flag: "id", title: "Bali Bliss", desc: "Sacred temples, rice terraces, and sunset beach bars in Bali's most beloved spots.", duration: "9 days", price: "from $2,350", image: tourImg(10) },
    { id: 11, country: "Indonesia", flag: "id", title: "Java & Bali Explorer", desc: "Ancient kingdoms, active volcanoes, and vibrant art scenes across two islands.", duration: "12 days", price: "from $2,280", image: tourImg(11) },
    { id: 12, country: "Indonesia", flag: "id", title: "Lombok & the Gilis", desc: "Pristine beaches, world-class diving, and the quiet beauty of the Gili Islands.", duration: "8 days", price: "from $1,650", image: tourImg(12) },
  ],
  Peru: [
    { id: 13, country: "Peru", flag: "pe", title: "Classic Peru Adventure", desc: "The ultimate Peru experience with Machu Picchu, Sacred Valley, and Lima exploration.", duration: "8 days", price: "from $1,980", image: tourImg(13) },
    { id: 14, country: "Peru", flag: "pe", title: "Inca Trail Adventure", desc: "Trek the classic Inca Trail to Machu Picchu.", duration: "8 days", price: "from $2,450", image: tourImg(14) },
    { id: 15, country: "Peru", flag: "pe", title: "Amazon & Andes", desc: "From Amazon rainforest to high-altitude Andean lakes.", duration: "10 days", price: "from $2,180", image: tourImg(15) },
  ],
  Japan: [
    { id: 16, country: "Japan", flag: "jp", title: "Japan Highlights", desc: "Tokyo skyscrapers, Kyoto temples, and Osaka street food in one unforgettable journey.", duration: "11 days", price: "from $2,890", image: tourImg(16) },
    { id: 17, country: "Japan", flag: "jp", title: "Kyoto & Beyond", desc: "Deep dive into Japan's ancient capital with day trips to Nara and Hiroshima.", duration: "8 days", price: "from $2,490", image: tourImg(17) },
    { id: 18, country: "Japan", flag: "jp", title: "Japan Rail Adventure", desc: "Ride the Shinkansen from Tokyo to Kyoto to the peaceful island of Miyajima.", duration: "14 days", price: "from $3,690", image: tourImg(18) },
  ],
  Morocco: [
    { id: 19, country: "Morocco", flag: "ma", title: "Imperial Cities of Morocco", desc: "Fes, Marrakech, Meknes, and Rabat — the four royal cities in one loop.", duration: "9 days", price: "from $1,540", image: tourImg(19) },
    { id: 20, country: "Morocco", flag: "ma", title: "Sahara & Kasbahs", desc: "Camel rides at sunset, ancient mud-brick kasbahs, and a sky full of desert stars.", duration: "7 days", price: "from $1,320", image: tourImg(20) },
    { id: 21, country: "Morocco", flag: "ma", title: "Coastal Morocco", desc: "Atlantic fishing towns, blue-washed Chefchaouen, and the surf town of Taghazout.", duration: "8 days", price: "from $1,410", image: tourImg(21) },
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
//
// `destCode` is the key from DESTINATIONS used to look up the full search label
// (e.g. "Cancún, Mexico") and isCached flag at click time. Without this, the
// destination filter in useUnifiedSearch wouldn't match any packages and the
// list would come back empty.
const HOLIDAY_DESTINATIONS = [
  {
    id: 1, destination: "Maldives", country: "Maldives", flag: "mv", destCode: "MALDIVES",
    // Maldives — overwater bungalows on crystal-clear turquoise lagoon
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&auto=format",
    desc: "Escape to an exclusive overwater villa with crystal-clear lagoons, world-class diving, and total seclusion.",
    nights: 7, price: "from £1,899",
  },
  {
    id: 2, destination: "Santorini", country: "Greece", flag: "gr", destCode: "SANTORINI",
    // Santorini — white-washed buildings with iconic blue domed church
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop&auto=format",
    desc: "Iconic white-washed clifftop suites with infinity pools overlooking the famous Santorini caldera.",
    nights: 7, price: "from £1,249",
  },
  {
    id: 3, destination: "Bali", country: "Indonesia", flag: "id", destCode: "BALI",
    // Bali — lush green rice terraces in Ubud
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&auto=format",
    desc: "Beachfront luxury with tropical gardens, private pools, and vibrant Seminyak dining on your doorstep.",
    nights: 10, price: "from £1,499",
  },
  {
    id: 4, destination: "Cancún", country: "Mexico", flag: "mx", destCode: "CANCUN",
    // Cancún — turquoise Caribbean beach with white sand
    image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&h=600&fit=crop&auto=format",
    desc: "All-inclusive beachfront resort with direct Caribbean Sea access and nightly entertainment.",
    nights: 7, price: "from £1,099",
  },
  {
    id: 5, destination: "Dubai", country: "UAE", flag: "ae", destCode: "DUBAI",
    // Dubai — Burj Khalifa and modern skyline at dusk
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&auto=format",
    desc: "Iconic resort on Palm Jumeirah with a private beach, waterpark, and world-famous restaurants.",
    nights: 7, price: "from £999",
  },
  {
    id: 6, destination: "Phuket", country: "Thailand", flag: "th", destCode: "PHUKET",
    // Phuket — tropical Thai beach with limestone karsts
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop&auto=format",
    desc: "Secluded luxury on a private bay with stunning ocean views, villa pools, and impeccable Thai hospitality.",
    nights: 10, price: "from £1,349",
  },
];

// Trip type showcase cards — displayed in the "Browse by trip type" section
// on the Holidays tab. Each type has 3 example cards using existing images.
type TripTypeId = "hotel-flight" | "group-tour" | "individual-tour" | "round-trip" | "last-minute" | "bus-tour";

const TRIP_TYPES: { id: TripTypeId; label: string; icon: React.ReactNode }[] = [
  { id: "hotel-flight",    label: "Hotel + Flight",  icon: <Plane size={15} /> },
  { id: "group-tour",      label: "Group Tours",     icon: <Users size={15} /> },
  { id: "individual-tour", label: "Individual Tours",icon: <User size={15} /> },
  { id: "round-trip",      label: "Round Trips",     icon: <RotateCcw size={15} /> },
  { id: "last-minute",     label: "Last Minute",     icon: <Zap size={15} /> },
  { id: "bus-tour",        label: "Bus Tours",       icon: <Bus size={15} /> },
];

// Trip-type cards — each uses a real destination photo.
// Optional `tourId` opens the matching DISCOVERY_TOUR_MAP entry in TourDetailPage
// instead of running a holiday search. Used today by the Bus Tours tab so the
// Lake Garda card jumps straight to its full itinerary on click.
const TRIP_TYPE_CARDS: Record<TripTypeId, { id: number; title: string; destination: string; flag: string; desc: string; image: string; duration: string; price: string; tourId?: number }[]> = {
  "hotel-flight": [
    { id: 1, title: "Cancún All-Inclusive Escape",     destination: "Cancún, Mexico",   flag: "mx", desc: "Powdery white sands, turquoise Caribbean water, and all-inclusive resort luxury.",        image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80", duration: "7 nights", price: "from £849" },
    { id: 2, title: "Maldives Overwater Villa",         destination: "Maldives",         flag: "mv", desc: "Stilted villas above crystal lagoons, world-class diving, and pure tropical seclusion.",  image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", duration: "7 nights", price: "from £1,899" },
    { id: 3, title: "Dubai Luxury Getaway",             destination: "Dubai, UAE",       flag: "ae", desc: "Desert skylines, rooftop pools, and non-stop shopping in the city of the future.",        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", duration: "7 nights", price: "from £999" },
  ],
  "group-tour": [
    { id: 4, title: "Classic Peru Group Adventure",    destination: "Peru",             flag: "pe", desc: "Explore ancient Incan ruins, the Amazon rainforest, and vibrant Andean culture.",          image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80", duration: "8 days",   price: "from £1,980" },
    { id: 5, title: "Japan Group Highlights Tour",     destination: "Japan",            flag: "jp", desc: "Cherry blossoms, samurai history, and neon-lit cities on a classic group adventure.",      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", duration: "11 days",  price: "from £2,890" },
    { id: 6, title: "Morocco Imperial Cities Group",   destination: "Morocco",          flag: "ma", desc: "Wander medinas, souks, and palaces across Morocco's most iconic imperial cities.",         image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80", duration: "9 days",   price: "from £1,540" },
  ],
  "individual-tour": [
    { id: 7, title: "Bali Cultural Discovery",         destination: "Bali, Indonesia",  flag: "id", desc: "Sacred temples, lush rice terraces, and world-class surf on the Island of the Gods.",     image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", duration: "8 days",   price: "from £1,980" },
    { id: 8, title: "Kyoto Self-Guided Journey",       destination: "Japan",            flag: "jp", desc: "Wander ancient streets and zen gardens across Japan's most serene cultural capital.",      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", duration: "8 days",   price: "from £2,200" },
    { id: 9, title: "Thai Island Hopping",             destination: "Thailand",         flag: "th", desc: "Hop between paradise islands, turquoise waters, and vibrant beach towns at your pace.",   image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80", duration: "10 days",  price: "from £1,650" },
  ],
  "round-trip": [
    { id: 10, title: "Japan Rail Circle Route",        destination: "Japan",            flag: "jp", desc: "Circle Japan by bullet train, connecting Tokyo, Kyoto, Hiroshima, and beyond.",           image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", duration: "14 days",  price: "from £3,400" },
    { id: 11, title: "Moroccan Imperial Loop",         destination: "Morocco",          flag: "ma", desc: "A loop through ancient medinas, Saharan dunes, and Atlas Mountain kasbahs.",              image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80", duration: "9 days",   price: "from £1,540" },
    { id: 12, title: "Peru Amazon & Andes Circuit",    destination: "Peru",             flag: "pe", desc: "From Lima to the Amazon, Cusco to Machu Picchu — Peru's greatest circular route.",        image: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80", duration: "12 days",  price: "from £2,400" },
  ],
  "last-minute": [
    { id: 13, title: "Santorini Getaway",              destination: "Greece",           flag: "gr", desc: "Whitewashed cliffs, volcanic beaches, and legendary sunsets over the caldera.",           image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80", duration: "7 nights", price: "from £749" },
    { id: 14, title: "Bangkok Long Weekend",           destination: "Thailand",         flag: "th", desc: "Street food, rooftop bars, golden temples, and buzzing night markets await.",             image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80", duration: "5 nights", price: "from £599" },
    { id: 15, title: "Cancún Quick Escape",            destination: "Mexico",           flag: "mx", desc: "Last-minute Caribbean sun, all-inclusive deals, and white-sand beaches for less.",        image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80", duration: "7 nights", price: "from £819" },
  ],
  "bus-tour": [
    // `tourId: 22` jumps the click handler straight to the matching tour in DISCOVERY_TOUR_MAP.
    { id: 16, tourId: 22, title: "Lake Garda Wine Festival Bus Tour", destination: "Lazise, Italy", flag: "it", desc: "4-day coach tour from Germany to Italy's Lake Garda with the Bardolino wine festival.", image: "https://images.unsplash.com/photo-1530538095376-a4936b35b5f0?w=800&q=80", duration: "4 days", price: "from €649" },
    // `tourId: 23` → BALTIC_SPA_BUS_TOUR in DISCOVERY_TOUR_MAP.
    { id: 17, tourId: 23, title: "Baltic Coast Medical Spa Cure", destination: "Mielno, Poland", flag: "pl", desc: "8-day coach cure holiday from Germany to the Polish Baltic coast — Dead Sea salt pools, saunas, and a doctor-supervised treatment plan.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&q=80", duration: "8 days", price: "from €499" },
  ],
};

// --- Main Component ---

export default function DiscoveryPage({
  onHotelSearch,
  onHotelDirectSelect,
  onTourSelect,
  onFlightSearch,
  onStopoverSearch,
  onHolidaySearch,
  onActivitySearch,
  onActivityDirectSelect,
  onAiPlannerStart,
  aiExperienceMode,
  onAiExperienceModeChange: setAiExperienceMode,
  initialActiveTab,
}: DiscoveryPageProps) {
  // Seed from App's `initialActiveTab` (the last-searched tab) when provided,
  // otherwise fall back to the original default. This only sets the STARTING
  // tab — the user can still switch tabs freely after mount.
  const [activeTab, setActiveTab] = useState<TabId>(initialActiveTab ?? "holidays");
  // `aiExperienceMode` is controlled by App.tsx so the toggle persists across
  // the Discovery → AI Itinerary → Back round trip. See DiscoveryPageProps.

  // Discovery display settings (which tabs are on, which stopover airline). Read
  // from the shared context so the gear popover can flip them live.
  const { settings } = useSettings();
  // Only the enabled tabs are rendered in the tab bar — a disabled tab is hidden
  // entirely. We keep the original TABS order; filtering just drops the off ones.
  const visibleTabs = TABS.filter((tab) => settings.enabledTabs[tab.id]);

  // If the tab the user is currently on gets switched off in settings, fall back
  // to the first still-visible tab so the page never shows an empty panel.
  useEffect(() => {
    if (!settings.enabledTabs[activeTab] && visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [settings.enabledTabs, activeTab, visibleTabs]);

  // If the AI Experience feature is switched off while its hero is showing, snap
  // back to the normal search hero (the pill is gone, so there's no way to toggle
  // it off otherwise).
  useEffect(() => {
    if (!settings.aiExperienceEnabled && aiExperienceMode) {
      setAiExperienceMode(false);
    }
  }, [settings.aiExperienceEnabled, aiExperienceMode, setAiExperienceMode]);

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
    // `settings.enabledTabs` is in the deps because hiding/showing a tab shifts
    // the active tab's position, so the underline must be re-measured.
  }, [activeTab, hoveredTab, settings.enabledTabs]);

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

  // ── Activity type tabs for the "Experience what you like" section on the
  // Activities tab. Same sliding-underline pattern as Trip Types above.
  // Cruises are first because they're the most popular activity category.
  const [activeActivityType, setActiveActivityType] = useState<ActivityType>("cruise-ship");
  const activityTypeTabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const activityTypeTabBarRef = useRef<HTMLDivElement>(null);
  const [activityTypeIndicator, setActivityTypeIndicator] = useState({ left: 0, width: 0 });
  const [hoveredActivityType, setHoveredActivityType] = useState<ActivityType | null>(null);

  useEffect(() => {
    const target = hoveredActivityType ?? activeActivityType;
    const el = activityTypeTabRefs.current[target];
    const bar = activityTypeTabBarRef.current;
    if (el && bar) setActivityTypeIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeActivityType, hoveredActivityType]);

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

  // Flights panel — the form itself now lives in the shared <FlightSearchForm>
  // component (also used on the FlightListPage edit-search panel). We only keep
  // a lightweight mirror of the latest passengers/cabin here so the "Popular
  // routes" quick-search cards lower down can reuse whatever the user picked.
  const [flightQuickCriteria, setFlightQuickCriteria] = useState<{
    adults: number;
    children: number;
    cabinClass: FlightSearchCriteria["cabinClass"];
  }>({ adults: 2, children: 0, cabinClass: "economy" });

  // Holidays panel — state now lives inside PackageSearchForm

  // The AI Experience entry composer owns its own draft state. Discovery
  // just receives the composed brief on submit.

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
              {/*
                Animated gradient — based on nezasa.com's hero (40deg, white → soft pink → mauve)
                plus the color cycle from their `.pop` keyframes (peach → mint → periwinkle).
                We swap the gradient itself on a 14s loop so the whole canvas breathes
                without needing separate blob elements. Framer Motion tweens between
                gradient strings, so it cross-fades smoothly.
              */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "linear-gradient(40deg, #FFFFFF, #F5B9BF, #C896BF)",
                    "linear-gradient(120deg, #FBDCA8, #F5B9BF, #C896BF)",
                    "linear-gradient(200deg, #D0E8D0, #C896BF, #7C94C6)",
                    "linear-gradient(280deg, #FFFFFF, #F5B9BF, #7C94C6)",
                    "linear-gradient(40deg, #FFFFFF, #F5B9BF, #C896BF)",
                  ],
                }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
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
          {/* Hero image — `priority` skips lazy loading because this is
              above the fold. Per the doc, the first 2-3 images on a page
              should be eager-loaded so the initial paint feels fast. */}
          <ImageWithPlaceholder
            src={heroBg}
            alt="Discover the world"
            priority
            containerClassName="w-full h-full"
            // object-top pins the TOP of the photo in place. With the default
            // (object-center), growing the hero re-centers the image and crops
            // both edges at once — which looks like a "skip". Pinning the top
            // means extra height just reveals more of the photo at the bottom.
            className="object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/25 to-black/10" />
        </motion.div>

        <div className={`relative z-10 flex flex-col ${aiExperienceMode ? "h-full" : ""}`}>

          {/* ── Settings gear (top-right) ──
              Subtle glassy button — same frosted look as the AI Experience pill.
              Opens a popover to enable/disable tabs and pick the stopover airline.
              Kept low-key (semi-transparent until hover) so it doesn't compete
              with the hero. Radix Popover portals to <body>, so no ancestor
              overflow-hidden can clip the panel. */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Display settings"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
                >
                  <Settings size={18} />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0">
                <DiscoverySettingsPanel tabs={TABS} />
              </PopoverContent>
            </Popover>
          </div>

          {/* ── Toggle + tagline — always rendered, text swaps on mode change ── */}
          <div className={`flex flex-col items-center px-6 lg:px-12 pt-16 md:pt-32 pb-6 gap-5`}>
            {/* Toggle pill — pulses when mode changes. Hidden entirely when the
                AI Experience feature is switched off in Settings. */}
            {settings.aiExperienceEnabled && (
              <motion.div animate={toggleControls}>
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/30">
                  <span className="text-white font-bold text-sm whitespace-nowrap">AI Experience</span>
                  <Switch
                    checked={aiExperienceMode}
                    onCheckedChange={setAiExperienceMode}
                  />
                </div>
              </motion.div>
            )}
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
                  {visibleTabs.map((tab) => (
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
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                              Destination
                            </span>
                            <span
                              className={cn("text-sm font-semibold truncate w-full", hotelLocation ? "text-foreground" : "text-muted-foreground")}
                            >
                              {hotelLocation || "Where are you going?"}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-muted-foreground shrink-0 transition-transform ${
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
                                <Search size={16} className="text-muted-foreground" />
                                <input
                                  type="text"
                                  placeholder="Search destination..."
                                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                  value={hotelLocation}
                                  onChange={(e) =>
                                    setHotelLocation(e.target.value)
                                  }
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="p-2">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-3 py-2">
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
                      {/* ResponsiveDatePicker = shared calendar wrapper. It shows
                          a dropdown on desktop and a bottom drawer on mobile, so
                          this picker matches every other one in the app. We keep
                          our own trigger button (passed via `trigger`) and just
                          forward the range-calendar props through to it. */}
                      <ResponsiveDatePicker
                        className="flex-1"
                        open={hotelOpenPanel === "dates"}
                        onOpenChange={(open) =>
                          setHotelOpenPanel(open ? "dates" : null)
                        }
                        title="Check-in – Check-out"
                        trigger={
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
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                                Check-in – Check-out
                              </span>
                              <span className="text-sm font-semibold text-foreground truncate w-full">
                                {hotelDateLabel}
                              </span>
                            </div>
                            <ChevronDown
                              size={16}
                              className={`text-muted-foreground shrink-0 transition-transform ${
                                hotelOpenPanel === "dates" ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        }
                        mode="range"
                        selected={hotelDateRange}
                        // Drive the range from the clicked day so it's
                        // predictable: 1st click = check-in, 2nd = check-out,
                        // and re-opening restarts on the first click.
                        onSelect={(_range, day) => {
                          const next = stepRange(hotelDateRange, day);
                          setHotelDateRange(next);
                          // Both dates picked → close shortly after.
                          if (isRangeComplete(next)) {
                            setTimeout(() => setHotelOpenPanel(null), 200);
                          }
                        }}
                        numberOfMonths={1}
                        disabled={{ before: new Date() }}
                      />

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
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                              Travellers
                            </span>
                            <span className="text-sm font-semibold text-foreground truncate w-full">
                              {hotelGuestsLabel}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-muted-foreground shrink-0 transition-transform ${
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
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="text-destructive px-0 h-auto"
                                      onClick={() =>
                                        setHotelRooms(
                                          hotelRooms.filter(
                                            (_, i) => i !== index
                                          )
                                        )
                                      }
                                    >
                                      Remove
                                    </Button>
                                  )}
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="text-sm font-medium text-foreground">
                                      Adults
                                    </div>
                                    <div className="text-xs text-muted-foreground">
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
                                    <div className="text-xs text-muted-foreground">
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
                              <Button
                                variant="tertiary"
                                className="mt-3 w-full"
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
                              </Button>
                            )}
                            <Button
                              className="mt-3 w-full"
                              onClick={() => setHotelOpenPanel(null)}
                            >
                              Done
                            </Button>
                          </div>
                        )}
                      </div>
                    {/* w-full on mobile so button spans the full width; lg:w-auto restores shrink behaviour on desktop */}
                    <Button
                      size="lg"
                      className="w-full lg:w-auto"
                      onClick={handleHotelSearch}
                    >
                      <Search />
                      Search Hotels
                    </Button>
                  </div>
                )}

                {/* FLIGHTS PANEL */}
                {activeTab === "flights" && (
                  <FlightSearchForm
                    onSearch={onFlightSearch}
                    onChange={(c) =>
                      setFlightQuickCriteria({
                        adults: c.adults,
                        children: c.children,
                        cabinClass: c.cabinClass,
                      })
                    }
                  />
                )}

                {/* STOPOVER PANEL — same flight form, but in stopover mode:
                    no opt-in checkbox (a stopover is always on), round-trip only,
                    airports restricted to Fiji's network. Submitting leads to the
                    results page in stopover-only mode. */}
                {activeTab === "stopover" && (
                  <FlightSearchForm stopoverMode onSearch={onStopoverSearch} />
                )}

                {/* HOLIDAYS PANEL */}
                {activeTab === "holidays" && (
                  <PackageSearchForm variant="hero" onSearch={onHolidaySearch} />
                )}

                {/* ACTIVITIES PANEL — same shape as Holidays: a single self-
                    contained search form that takes the user to the list page. */}
                {activeTab === "activities" && (
                  <ActivitySearchForm variant="hero" onSearch={onActivitySearch} />
                )}

                {/* CRUISES PANEL — same form as Activities, but the Activity-type
                    field is hidden (the tab itself implies the type). Submitting
                    sends the user to ActivityListPage already filtered to ocean
                    + river cruises. */}
                {activeTab === "cruises" && (
                  <ActivitySearchForm
                    variant="hero"
                    onSearch={onActivitySearch}
                    lockedActivityTypes={["cruise-ship", "river-cruise"]}
                  />
                )}

                {/* EVENTS PANEL — same idea, locked to ticketed events. */}
                {activeTab === "events" && (
                  <ActivitySearchForm
                    variant="hero"
                    onSearch={onActivitySearch}
                    lockedActivityTypes={["event"]}
                  />
                )}

              </div>
            </div>
            </div>
            </div>

            {/* AI content wrapper — fades in when the "Try AI Experience" switch is on.
                Hosts the new moodboard composer: a single pill input with [+] / mic
                / send, plus three progressive-disclosure bubbles for vibes, links,
                and trending places. The gradient + AI tagline above are untouched. */}
            <div
              className={`transition-opacity duration-500 ${
                aiExperienceMode
                  ? "opacity-100 flex flex-col"
                  : "opacity-0 pointer-events-none absolute inset-0 overflow-hidden"
              }`}
            >
              <div className="px-4 md:px-6 lg:px-12 pb-16 lg:pb-[128px] flex justify-center">
                <AiMoodboardComposer
                  onSubmit={(brief) => onAiPlannerStart?.(brief.summary)}
                />
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


      {/* ── EXPERIENCES (rendered when activeTab === "activities") ── */}
      {/* Two content rows: (1) Experience what you like (tabbed by activity
          type), (2) Iconic events. */}
      {activeTab === "activities" && (
        <section className="py-10 md:py-16 px-4 md:px-6 lg:px-12">
          <PageContainer tier="standard" className="flex flex-col gap-12 md:gap-16">

            {/* ── 1. Experience what you like ── */}
            {/* Activities grouped by activity type, behind a tab bar that
                mirrors the "Travel the way you like" section on Holidays.
                Cruises lead the tab order since they're the headline category. */}
            <div>
              <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-2.5 mb-2">
                  <Footprints size={24} className="text-primary md:size-7" />
                  <h2 className="text-foreground font-bold text-2xl md:text-3xl leading-tight">
                    Experience what you like
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm md:text-lg">
                  Browse hand-picked activities by the kind of trip you love
                </p>
              </div>

              {/* Tab bar — sliding underline driven by the activityTypeTabRefs.
                  Order comes from ACTIVITY_TYPE_OPTIONS, which has
                  cruise-ship first. */}
              <div ref={activityTypeTabBarRef} className="relative border-b border-border mb-5 md:mb-8 flex gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    ref={(el) => { activityTypeTabRefs.current[opt.id] = el; }}
                    onClick={() => setActiveActivityType(opt.id)}
                    onMouseEnter={() => setHoveredActivityType(opt.id)}
                    onMouseLeave={() => setHoveredActivityType(null)}
                    className={cn(
                      "shrink-0 px-5 py-3 text-base font-bold whitespace-nowrap",
                      activeActivityType === opt.id ? "text-primary" : "text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
                <div
                  className="absolute bottom-0 h-[2.5px] bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ left: activityTypeIndicator.left, width: activityTypeIndicator.width }}
                />
              </div>

              {/* Horizontal-scrolling cards for the active activity type.
                  TourCard at 320px wide — same width used elsewhere on
                  Discovery so the rhythm stays consistent. */}
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {ACTIVITY_CARDS_BY_TYPE[activeActivityType].map((card) => (
                  <div key={card.id} className="shrink-0 w-[320px] snap-start">
                    <TourCard
                      tour={card}
                      // Resolve activityId to the full Activity and jump
                      // straight to the detail page (skip the list).
                      onSelect={() => onActivityDirectSelect(ACTIVITY_BY_ID[card.activityId])}
                    />
                  </div>
                ))}
              </div>

              {/* View-all CTA — drops the user into ActivityListPage already
                  filtered to the active type (the list page reads this
                  criterion to scope results). */}
              <div className="mt-5 md:mt-6 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() =>
                    onActivitySearch({
                      destination: "",
                      activityTypes: [activeActivityType],
                      travellers: 2,
                      dateFrom: "",
                      dateTo: "",
                    })
                  }
                >
                  View all {ACTIVITY_TYPE_OPTIONS.find((o) => o.id === activeActivityType)?.label} activities
                </Button>
              </div>
            </div>

          </PageContainer>
        </section>
      )}

      {/* ── CRUISES ─────────────────────────────────────────────────────────
          One single carousel combining ocean + river cruises — travellers
          discover the type of cruise from the card itself rather than from a
          section header. Region/destination filtering happens in the search
          dropdown above. */}
      {activeTab === "cruises" && (
        <section className="py-10 md:py-16 px-4 md:px-6 lg:px-12">
          <PageContainer tier="standard">

            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <Ship size={24} className="text-primary md:size-7" />
                <h2 className="text-foreground font-bold text-2xl md:text-3xl leading-tight">
                  Set sail
                </h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-lg">
                Hand-picked cruises for memorable voyages
              </p>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                ...ACTIVITY_CARDS_BY_TYPE["cruise-ship"],
                ...ACTIVITY_CARDS_BY_TYPE["river-cruise"],
              ].map((card) => (
                <div key={card.id} className="shrink-0 w-[320px] snap-start">
                  <TourCard
                    tour={card}
                    onSelect={() => onActivityDirectSelect(ACTIVITY_BY_ID[card.activityId])}
                  />
                </div>
              ))}
            </div>

            {/* View-all CTA — same locked criteria as the search panel */}
            <div className="mt-5 md:mt-6 flex justify-end">
              <Button
                variant="secondary"
                onClick={() =>
                  onActivitySearch({
                    destination: "",
                    activityTypes: ["cruise-ship", "river-cruise"],
                    travellers: 2,
                    dateFrom: "",
                    dateTo: "",
                  })
                }
              >
                View all cruises
              </Button>
            </div>

          </PageContainer>
        </section>
      )}

      {/* ── EVENTS ──────────────────────────────────────────────────────────
          Single carousel of ticketed events — Wimbledon, Oktoberfest, etc. —
          again sourced from the existing ACTIVITY_CARDS_BY_TYPE mock data. */}
      {activeTab === "events" && (
        <section className="py-10 md:py-16 px-4 md:px-6 lg:px-12">
          <PageContainer tier="standard">

            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <Ticket size={24} className="text-primary md:size-7" />
                <h2 className="text-foreground font-bold text-2xl md:text-3xl leading-tight">
                  Trips built around an event
                </h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-lg">
                Be there for festivals, finals, and once-a-year occasions
              </p>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {ACTIVITY_CARDS_BY_TYPE["event"].map((card) => (
                <div key={card.id} className="shrink-0 w-[320px] snap-start">
                  <TourCard
                    tour={card}
                    onSelect={() => onActivityDirectSelect(ACTIVITY_BY_ID[card.activityId])}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 md:mt-6 flex justify-end">
              <Button
                variant="secondary"
                onClick={() =>
                  onActivitySearch({
                    destination: "",
                    activityTypes: ["event"],
                    travellers: 2,
                    dateFrom: "",
                    dateTo: "",
                  })
                }
              >
                View all events
              </Button>
            </div>

          </PageContainer>
        </section>
      )}

      {/* ── HOTELS ── */}
      {activeTab === "hotels" && (
        <section className="py-10 md:py-16 px-4 md:px-6 lg:px-12">
          <PageContainer tier="standard">

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
                  <ImageWithPlaceholder
                    src={hotel.image}
                    alt={hotel.name}
                    containerClassName="w-full h-[252px]"
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
              <Button
                variant="secondary"
                onClick={() =>
                  onHotelSearch({
                    location: "Any destination",
                    dateRange: { from: addDays(new Date(), 7), to: addDays(new Date(), 14) },
                    rooms: [{ id: 1, adults: 2, children: 0 }],
                  })
                }
              >
                View all hotels (148)
              </Button>
            </div>

          </PageContainer>
        </section>
      )}

      {/* ── FLIGHTS ── */}
      {activeTab === "flights" && (
        <section className="py-16 px-4 md:px-6 lg:px-12">
          <PageContainer tier="standard">

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
                    adults: flightQuickCriteria.adults,
                    children: flightQuickCriteria.children,
                    cabinClass: flightQuickCriteria.cabinClass,
                  })}
                >
                  <div className="relative">
                    <ImageWithPlaceholder
                      src={route.image}
                      alt={`${route.from} to ${route.to}`}
                      containerClassName="w-full h-[200px]"
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
                      <ArrowRight size={14} className="text-muted-foreground mx-0.5" />
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

          </PageContainer>
        </section>
      )}

      {/* ── HOLIDAYS ── */}
      {/* This tab now combines the old Holidays + Tours into one rich experience. */}
      {activeTab === "holidays" && (
        <>

          {/* ── Section 1: Tours by travel style ────────────────────────── */}
          {/* Section has no horizontal padding. The max-w-[1280px] wrapper aligns
              headings + tab bars with the hero card. Scroll rows use dynamic
              pl-[max(pad, (100vw-1280px)/2)] so the first card starts at exactly
              the same left edge on all screen sizes, including wide viewports. */}
          <section className="py-10 md:py-16">

            {/* Constrained content — aligns with hero card left edge */}
            <div className="px-[max(1rem,calc((100vw-80rem)/2))] md:px-[max(1.5rem,calc((100vw-80rem)/2))] lg:px-[max(3rem,calc((100vw-80rem)/2))] mb-5 md:mb-8">
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

            <div ref={styleTabBarRef} className="mx-[max(1rem,calc((100vw-80rem)/2))] md:mx-[max(1.5rem,calc((100vw-80rem)/2))] lg:mx-[max(3rem,calc((100vw-80rem)/2))] relative border-b border-border mb-5 md:mb-8 flex gap-0 overflow-x-auto">
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
                pl-[max(pad,(100vw-80rem)/2)] dynamically tracks the mx-auto centering
                so cards align correctly on both narrow and wide screens. */}
            <div className="pl-[max(1rem,calc((100vw-80rem)/2))] md:pl-[max(1.5rem,calc((100vw-80rem)/2))] lg:pl-[max(3rem,calc((100vw-80rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-80rem)/2))] md:[scroll-padding-left:max(1.5rem,calc((100vw-80rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-80rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
              {TOUR_CARDS.map((tour) => (
                <div key={tour.id} className="shrink-0 w-[320px] snap-start">
                  <TourCard tour={tour} onSelect={() => onTourSelect(tour)} />
                </div>
              ))}
            </div>

            <div className="px-[max(1rem,calc((100vw-80rem)/2))] md:px-[max(1.5rem,calc((100vw-80rem)/2))] lg:px-[max(3rem,calc((100vw-80rem)/2))] flex justify-end">
              <Button
                variant="secondary"
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
              >
                View all {activeTourStyle} tours (35)
              </Button>
            </div>

          </section>

          <hr className="border-border mx-4 md:mx-6 lg:mx-[max(3rem,calc((100vw-80rem)/2))]" />

          {/* ── Section 2: Tours by destination ──────────────────────────── */}
          <section className="py-10 md:py-16">

            <div className="px-[max(1rem,calc((100vw-80rem)/2))] md:px-[max(1.5rem,calc((100vw-80rem)/2))] lg:px-[max(3rem,calc((100vw-80rem)/2))] mb-5 md:mb-8">
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

            <div ref={countryTabBarRef} className="mx-[max(1rem,calc((100vw-80rem)/2))] md:mx-[max(1.5rem,calc((100vw-80rem)/2))] lg:mx-[max(3rem,calc((100vw-80rem)/2))] relative border-b border-border mb-5 md:mb-8 flex gap-0 overflow-x-auto">
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

            <div className="pl-[max(1rem,calc((100vw-80rem)/2))] md:pl-[max(1.5rem,calc((100vw-80rem)/2))] lg:pl-[max(3rem,calc((100vw-80rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-80rem)/2))] md:[scroll-padding-left:max(1.5rem,calc((100vw-80rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-80rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
              {(TOURS_BY_COUNTRY[activeCountry] ?? []).map((tour) => (
                <div key={tour.id} className="shrink-0 w-[320px] snap-start">
                  <TourCard tour={tour} onSelect={() => onTourSelect(tour)} />
                </div>
              ))}
            </div>

            <div className="px-[max(1rem,calc((100vw-80rem)/2))] md:px-[max(1.5rem,calc((100vw-80rem)/2))] lg:px-[max(3rem,calc((100vw-80rem)/2))] flex justify-end">
              <Button
                variant="secondary"
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
              >
                View all {activeCountry} tours (22)
              </Button>
            </div>

          </section>

          <hr className="border-border mx-4 md:mx-6 lg:mx-[max(3rem,calc((100vw-80rem)/2))]" />

          {/* ── Section 3: Travel the way you like ───────────────────────── */}
          <section className="py-10 md:py-16">

            <div className="px-[max(1rem,calc((100vw-80rem)/2))] md:px-[max(1.5rem,calc((100vw-80rem)/2))] lg:px-[max(3rem,calc((100vw-80rem)/2))] mb-5 md:mb-8">
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

            <div ref={tripTypeTabBarRef} className="mx-[max(1rem,calc((100vw-80rem)/2))] md:mx-[max(1.5rem,calc((100vw-80rem)/2))] lg:mx-[max(3rem,calc((100vw-80rem)/2))] relative border-b border-border mb-5 md:mb-8 flex gap-0 overflow-x-auto">
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
              <div className="pl-[max(1rem,calc((100vw-80rem)/2))] md:pl-[max(1.5rem,calc((100vw-80rem)/2))] lg:pl-[max(3rem,calc((100vw-80rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-80rem)/2))] md:[scroll-padding-left:max(1.5rem,calc((100vw-80rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-80rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
                {HOLIDAY_DESTINATIONS.map((dest) => {
                  // Resolve the card's destCode to its full DESTINATIONS entry
                  // so we pass the correct search label (e.g. "Cancún, Mexico")
                  // and the right isCachedDestination flag — otherwise the
                  // search hook can't match any packages and results come back empty.
                  const destEntry = DESTINATIONS.find((d) => d.code === dest.destCode);
                  return (
                    <div key={dest.id} className="shrink-0 w-[320px] snap-start">
                      <HolidayCard
                        dest={dest}
                        onSelect={() => onHolidaySearch({
                          from: "London (LHR)",
                          to: destEntry?.label ?? dest.destination,
                          isCachedDestination: destEntry?.isCached ?? false,
                          dateMode: "specific",
                          dateRange: undefined,
                          selectedMonths: [],
                          nights: dest.nights,
                          adults: 2,
                          children: 0,
                          // Pre-activate the Hotel + Flight filter on HolidayListPage
                          // since these cards live under the Hotel + Flight tab.
                          initialFilters: { tripType: "hotel-flight" },
                        })}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {activeTripType !== "hotel-flight" && (
              <div className="pl-[max(1rem,calc((100vw-80rem)/2))] md:pl-[max(1.5rem,calc((100vw-80rem)/2))] lg:pl-[max(3rem,calc((100vw-80rem)/2))] flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scroll-padding-left:max(1rem,calc((100vw-80rem)/2))] md:[scroll-padding-left:max(1.5rem,calc((100vw-80rem)/2))] lg:[scroll-padding-left:max(3rem,calc((100vw-80rem)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
                {(TRIP_TYPE_CARDS[activeTripType] ?? []).map((card) => (
                  <div key={card.id} className="shrink-0 w-[300px] snap-start">
                    <div
                      className="bg-card rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.10)] cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                      onClick={() => {
                        // Cards with `tourId` jump straight to TourDetailPage
                        // (used by the Bus Tours tab). All other trip-type cards
                        // run a holiday search as before.
                        if (card.tourId) {
                          // Only `id` is read downstream (handleTourSelect looks up
                          // DISCOVERY_TOUR_MAP[id]), but TourCardData requires the
                          // full shape — map the trip-type card fields across.
                          onTourSelect({
                            id: card.tourId,
                            country: card.destination,
                            flag: card.flag,
                            title: card.title,
                            desc: card.desc,
                            duration: card.duration,
                            price: card.price,
                            image: card.image,
                          });
                          return;
                        }
                        onHolidaySearch({
                          from: "London (LHR)",
                          to: card.destination,
                          isCachedDestination: false,
                          dateMode: "specific",
                          dateRange: undefined,
                          selectedMonths: [],
                          nights: 7,
                          adults: 2,
                          children: 0,
                        });
                      }}
                    >
                      <div className="relative">
                        <ImageWithPlaceholder
                          src={card.image}
                          alt={card.title}
                          containerClassName="w-full h-[180px]"
                        />
                        <span className="absolute top-3 left-3 flex items-center gap-1 bg-white text-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                          {TRIP_TYPES.find((t) => t.id === activeTripType)?.icon}
                          {TRIP_TYPES.find((t) => t.id === activeTripType)?.label}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        {/* Flag + destination name — mirrors HolidayCard */}
                        <div className="flex items-center gap-1.5 text-base font-bold text-foreground leading-snug">
                          <img
                            src={`https://flagcdn.com/w160/${card.flag}.png`}
                            alt={card.destination}
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                          {card.destination}
                        </div>
                        {/* Short description */}
                        <div className="text-sm text-foreground leading-relaxed line-clamp-2">{card.desc}</div>
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

            <div className="px-[max(1rem,calc((100vw-80rem)/2))] md:px-[max(1.5rem,calc((100vw-80rem)/2))] lg:px-[max(3rem,calc((100vw-80rem)/2))] flex justify-end">
              <Button
                variant="secondary"
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
              >
                View all {TRIP_TYPES.find((t) => t.id === activeTripType)?.label} holidays
              </Button>
            </div>

          </section>


        </>
      )}

      {/* Footer */}
      <div className="text-center py-8 border-t border-border">
        <p className="text-muted-foreground text-xs">
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
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setStyleModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </Button>
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
              <Button
                variant="tertiary"
                onClick={() => setStyleModalOpen(false)}
                className="shrink-0"
              >
                Cancel
              </Button>
              <Button
                onClick={applyStyles}
                className="shrink-0"
              >
                Apply
              </Button>
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
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setDestinationModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </Button>
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
              <Button
                variant="tertiary"
                onClick={() => setDestinationModalOpen(false)}
                className="shrink-0"
              >
                Cancel
              </Button>
              <Button
                onClick={applyDestinations}
                className="shrink-0"
              >
                Apply
              </Button>
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
      <ImageWithPlaceholder
        src={tour.image}
        alt={tour.title}
        containerClassName="w-full h-[200px]"
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
      <ImageWithPlaceholder
        src={dest.image}
        alt={dest.destination}
        containerClassName="w-full h-[200px]"
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
