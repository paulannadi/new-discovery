import React, { useState, useEffect } from "react";
import { cn } from "../../../shared/components/ui/utils";
import { BackButton } from "../../../shared/components/BackButton";
import { PageContainer } from "../../../shared/components/PageContainer";
import AccommodationStar from "../../../shared/components/AccommodationStar";
import RatingBlock from "../../../shared/components/RatingBlock";
import {
  MapPin,
  Star,
  Wifi,
  Waves,
  Car,
  Utensils,
  Dumbbell,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar as CalendarIcon,
  Users,
  Map as MapIcon,
  Dog,
  Accessibility,
  Wine,
  Wind,
  Plus,
  Minus,
  X,
  Clock,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  // Matches the flight filter bar's pill icons (secondaryPill pattern):
  // a "sort" glyph plus one icon per filter so every pill is self-explanatory.
  ArrowDownWideNarrow,
  Wallet,
  Sparkles,
  ShieldCheck,
  List,
  ArrowRight,
  Hotel
} from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import { showToast } from "../../../shared/utils/toast";
// Shared design-system date picker (token-based). DateRange is just the {from,to} type.
import { Calendar } from "../../../shared/components/ui/calendar";
import { type DateRange } from "react-day-picker";
// Shared range-picker logic: 1st click = from, 2nd = to, re-open restarts.
import { stepRange, isRangeComplete } from "../../../shared/utils/dateRange";
import { format, addDays } from "date-fns";
import "react-day-picker/dist/style.css";
import LeafletMap, { type MapMarkerData } from "../../../shared/components/LeafletMap";
// Loading kit — skeletons + staggered reveal + lazy-loaded images.
// Pulled in to apply our project-wide loading patterns: 1.5s simulated wait
// gets skeleton cards (per the doc's 1s–3s tier), images get reserved space
// and a fade-in placeholder, the result list stags in over 60ms intervals.
import {
  SkeletonCard,
  StaggeredList,
  ImageWithPlaceholder,
} from "../../../shared/components/loading";

// --- Types ---

type Hotel = {
  id: string;
  name: string;
  image: string;
  stars: number;
  rating: number;
  reviewCount: number;
  location: string;
  price: number;
  amenities: string[];
  boardTypes: string[];
  cancellationPolicy: "Free cancellation" | "Non-refundable";
  // Real lat/lng so Leaflet can place the pin on an actual map
  coordinates: { lat: number; lng: number };
};

type SortOption = "recommended" | "price_low" | "price_high" | "rating" | "stars";

type DropdownType = 'location' | 'date' | 'guests' | 'board' | 'price' | 'amenities' | 'cancellation' | 'sort' | 'stars' | null;

type MobileViewMode = 'list' | 'map';

// --- Mock Data ---

const HOTELS: Hotel[] = [
  {
    id: "h1",
    name: "Hotel Palazzo Doglio",
    image: "https://images.unsplash.com/photo-1744534637336-6110864236fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBraW5nJTIwYmVkJTIwbW9kZXJufGVufDF8fHx8MTc3MDYzNzcxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    stars: 5,
    rating: 9.8,
    reviewCount: 357,
    location: "Cagliari, Italy",
    price: 125,
    amenities: ["Pet friendly", "Free Wifi", "Indoor pool", "Gym", "Bar", "Restaurant"],
    boardTypes: ["Room only", "Breakfast", "Half board", "Full board"],
    cancellationPolicy: "Free cancellation",
    coordinates: { lat: 39.2238, lng: 9.1217 } // Old Town, Cagliari
  },
  {
    id: "h2",
    name: "UNAHOTELS T Hotel Cagliari",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1080&h=720&fit=crop&auto=format",
    stars: 4,
    rating: 9.2,
    reviewCount: 367,
    location: "Cagliari, Italy",
    price: 105,
    amenities: ["Pet friendly", "Free Wifi", "Indoor pool", "Air conditioning"],
    boardTypes: ["Room only", "Breakfast"],
    cancellationPolicy: "Free cancellation",
    coordinates: { lat: 39.2285, lng: 9.1068 } // Cagliari north
  },
  {
    id: "h3",
    name: "Regina Margherita",
    image: "https://images.unsplash.com/photo-1768913573689-fa59c3c061cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb2Z0b3AlMjBwb29sJTIwZXZlbmluZ3xlbnwxfHx8fDE3NzA2Mzg2MzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    stars: 4,
    rating: 9.0,
    reviewCount: 367,
    location: "Cagliari, Italy",
    price: 98,
    amenities: ["Free Wifi", "Outdoor pool", "Bar"],
    boardTypes: ["Room only", "Breakfast", "Half board"],
    cancellationPolicy: "Non-refundable",
    coordinates: { lat: 39.2254, lng: 9.1136 } // Via Roma waterfront area
  },
  {
    id: "h4",
    name: "Lantana Resort Hotel & Apartments",
    image: "https://images.unsplash.com/photo-1582533568805-78a15dcb01b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJlc29ydCUyMGdhcmRlbnxlbnwxfHx8fDE3NzA2Mzg2Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    stars: 4,
    rating: 8.8,
    reviewCount: 367,
    location: "Pula, Italy",
    price: 150,
    amenities: ["Pet friendly", "Free Wifi", "Indoor pool", "Kids facilities", "Outdoor parking"],
    boardTypes: ["Room only", "Breakfast", "Full board"],
    cancellationPolicy: "Free cancellation",
    coordinates: { lat: 38.9986, lng: 9.0671 } // Pula, south Sardinia
  },
  {
    id: "h5",
    name: "Hotel Villa Fanny",
    image: "https://images.unsplash.com/photo-1601736518157-98c2fe28e9a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwYmVkJTIwYW5kJTIwYnJlYWtmYXN0JTIwZ2FyZGVufGVufDF8fHx8MTc3MDYzODYyN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    stars: 4,
    rating: 9.5,
    reviewCount: 367,
    location: "Cagliari, Italy",
    price: 180,
    amenities: ["Free Wifi", "Air conditioning", "Wheelchair accessible"],
    boardTypes: ["Breakfast"],
    cancellationPolicy: "Free cancellation",
    coordinates: { lat: 39.2194, lng: 9.1321 } // Castello district
  },
  {
    id: "h6",
    name: "B&B Il Vigneto",
    image: "https://images.unsplash.com/photo-1765122670586-b5f22d95c17f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwZW50cmFuY2V8ZW58MXx8fHwxNzcwNTYzNTI0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    stars: 3,
    rating: 8.5,
    reviewCount: 367,
    location: "Cagliari, Italy",
    price: 75,
    amenities: ["Pet friendly", "Free Wifi"],
    boardTypes: ["Room only"],
    cancellationPolicy: "Non-refundable",
    coordinates: { lat: 39.2310, lng: 9.1180 } // Villanova quarter
  },
  {
    id: "h7",
    name: "Villa Flumini",
    image: "https://images.unsplash.com/photo-1769897358307-8c7e3c3775a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpYyUyMGhvdGVsJTIwYnVpbGRpbmclMjBjaXR5fGVufDF8fHx8MTc3MDYzODYyN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    stars: 3,
    rating: 8.9,
    reviewCount: 367,
    location: "Cagliari, Italy",
    price: 85,
    amenities: ["Pet friendly", "Free Wifi", "Indoor parking"],
    boardTypes: ["Room only", "Breakfast"],
    cancellationPolicy: "Free cancellation",
    coordinates: { lat: 39.2160, lng: 9.0990 } // Quartucciu suburb west
  },
  {
    id: "h8",
    name: "Vela Rooms",
    image: "https://images.unsplash.com/photo-1552873547-b88e7b2760e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWFzaWRlJTIwaG90ZWwlMjByZXNvcnR8ZW58MXx8fHwxNzcwNjM4NjI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    stars: 3,
    rating: 8.7,
    reviewCount: 367,
    location: "Cagliari, Italy",
    price: 65,
    amenities: ["Pet friendly", "Free Wifi", "Air conditioning"],
    boardTypes: ["Room only"],
    cancellationPolicy: "Non-refundable",
    coordinates: { lat: 39.2330, lng: 9.1250 } // Poetto beach area
  }
];

// --- Components ---

// FilterButton — a "secondary pill" filter trigger that mirrors the flight
// filter bar (see secondaryPill.tsx in flightSearch). Same compact dimensions
// (h-8, rounded-lg, white bg, 12px semibold text), a leading lucide icon, the
// current value inline, and a chevron that rotates when the dropdown is open.
//
// Instead of the old solid-blue fill for the selected state, the border + text
// turn primary on hover, when open, AND while a selection is active — the
// inline value (e.g. "2 board types") is what tells the user it's been set.
const FilterButton = ({ label, active, onClick, hasSelection, icon }: { label: string, active: boolean, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, hasSelection?: boolean, icon?: React.ReactNode }) => (
  <button
    className={cn(
      "group flex items-center gap-1.5 h-8 px-3 rounded-lg border bg-white text-xs font-semibold transition-all shrink-0",
      active || hasSelection
        ? "border-primary text-primary"
        : "border-border text-foreground hover:border-primary"
    )}
    onClick={onClick}
  >
    {icon && icon}
    <span className="truncate">{label}</span>
    <ChevronDown
      size={13}
      className={cn("shrink-0 transition-transform", active && "rotate-180")}
    />
  </button>
);

const CheckboxRow = ({ label, checked, onChange }: { label: React.ReactNode, checked: boolean, onChange: () => void }) => (
  <div
    className="flex items-center gap-3 cursor-pointer group py-2"
    onClick={onChange}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onChange();
      }
    }}
  >
    <div className={cn(
      "w-5 h-5 rounded-sm border flex items-center justify-center transition-colors shrink-0",
      checked ? "bg-primary border-primary" : "bg-card border-border group-hover:border-primary"
    )}>
      {checked && <Check size={14} className="text-white" />}
    </div>
    <span className="text-foreground text-sm font-medium whitespace-nowrap flex items-center gap-1">{label}</span>
  </div>
);

const RadioRow = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
  <div
    className="flex items-center gap-3 cursor-pointer group py-2"
    onClick={onChange}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onChange();
      }
    }}
  >
    <div className={cn(
      "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
      checked ? "border-primary" : "border-border group-hover:border-primary"
    )}>
      {checked && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
    </div>
    <span className="text-foreground text-sm font-medium whitespace-nowrap">{label}</span>
  </div>
);

const HotelCard = ({ hotel, displayPrice, onSelect, onHover, isHovered }: { hotel: Hotel, displayPrice: number, onSelect: () => void, onHover?: (hovering: boolean) => void, isHovered?: boolean }) => {
  return (
    <div
      className={cn(
        "bg-card rounded-xl overflow-hidden flex flex-col lg:flex-row shadow-sm transition-all duration-300 ease-out cursor-pointer group border",
        isHovered ? "border-primary shadow-lg -translate-y-0.5" : "border-border hover:shadow-lg hover:-translate-y-0.5"
      )}
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {/* Image — stacks above content below 1024px, sits beside it at lg+.
          ImageWithPlaceholder reserves space (no layout jump on load), shows
          a bg-muted placeholder until the image is ready, fades it in over
          300ms, and uses native lazy-loading for cards below the fold. */}
      <div className="w-full lg:w-[260px] h-[160px] lg:h-auto shrink-0">
        <ImageWithPlaceholder
          src={hotel.image}
          alt={hotel.name}
          containerClassName="w-full h-full"
          className="group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content — p-4 on mobile, p-6 on lg+ */}
      <div className="flex-1 flex flex-col gap-4 p-4 lg:p-6">
        <div className="flex justify-between items-start gap-3">
          {/* min-w-0 + flex-1 let the name column shrink so the rating badge never gets pushed off-screen */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            {/* Name + stars inline — stars follow the name naturally and wrap with it */}
            <div className="flex items-start gap-1.5 flex-wrap">
              <p className="font-extrabold text-foreground text-lg group-hover:text-primary transition-colors leading-snug">{hotel.name}</p>
              <AccommodationStar rating={hotel.stars} offerName={hotel.name} offerId={String(hotel.id)} size={14} />
            </div>
            {/* Location sits below the name row */}
            <div className="text-foreground text-xs flex items-center gap-1.5">
              <MapPin size={12} />
              {hotel.location}
            </div>
          </div>
          <RatingBlock reviewScore={hotel.rating} reviewCount={hotel.reviewCount} />
        </div>

        <div className="flex flex-wrap gap-2">
          {hotel.amenities.slice(0, 3).map((amenity, i) => (
            // Pill chip — matches DiscoveryPage hotel tab: light blue bg, blue text, rounded-full
            <div key={i} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
              {amenity === "Pet friendly" && <Dog size={12} aria-hidden="true" />}
              {amenity === "Free Wifi" && <Wifi size={12} aria-hidden="true" />}
              {amenity === "Indoor pool" && <Waves size={12} aria-hidden="true" />}
              {amenity === "Gym" && <Dumbbell size={12} aria-hidden="true" />}
              {amenity === "Restaurant" && <Utensils size={12} aria-hidden="true" />}
              {amenity === "Bar" && <Wine size={12} aria-hidden="true" />}
              {amenity === "Air conditioning" && <Wind size={12} aria-hidden="true" />}
              {amenity === "Wheelchair accessible" && <Accessibility size={12} aria-hidden="true" />}
              <span>{amenity}</span>
            </div>
          ))}
        </div>

        {/* Footer: price on the left, "View details" button on the right — matches Figma Frame 5 */}
        {/* On mobile: price above, full-width button below. On md+: side-by-side. */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3">
          <div className="flex flex-col gap-0.5">
            {/* Free cancellation badge sits above the price label when applicable */}
            {hotel.cancellationPolicy === "Free cancellation" && (
              <span className="text-success text-xs font-extrabold flex items-center gap-1 mb-1">
                <Check size={12} aria-hidden="true" />
                Free cancellation
              </span>
            )}
            {/* Price inline — label + amount on one baseline, right-aligned on mobile */}
            <div className="flex items-baseline gap-1.5 self-end md:self-auto">
              <span className="text-foreground text-xs">Per person, per night from</span>
              <span className="text-foreground font-extrabold text-2xl leading-none">${displayPrice}</span>
            </div>
          </div>
          {/* Blue CTA button — full-width on mobile for an easier tap target, auto-width on md+ */}
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="w-full md:w-auto justify-center bg-primary hover:brightness-85 text-white font-extrabold text-sm px-5 py-2.5 rounded-lg transition-all flex items-center gap-2"
          >
            View details
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

// MapMarker removed — replaced by LeafletMap which handles its own markers

// Props type for HotelListPage.
// The "initial*" props are optional — they come from the search page when the user
// clicked "Search Hotels". If they're not provided, sensible defaults are used.
type HotelListPageProps = {
  onHotelSelect: (hotel: Hotel, filters?: { board: string[], cancellation: string[] }, rooms?: {id: number, adults: number, children: number}[]) => void;
  onBackToSearch?: () => void;          // Navigates back to the search landing page
  initialLocation?: string;             // Pre-fills the destination field
  initialDateRange?: DateRange;         // Pre-fills the date picker
  initialRooms?: {id: number, adults: number, children: number}[]; // Pre-fills room config
  // --- Stopover-step overrides ---------------------------------------------
  // When this page is reused as the "stopover hotel" step in the flight flow,
  // we don't want the destination/date/guest search fields (the city + dates
  // are already fixed by the flight choice). `hideSearch` drops that whole
  // search row, leaving just the back button. `headerSlot` lets the caller
  // render something else in the header instead — here, the flight stepper.
  hideSearch?: boolean;
  headerSlot?: React.ReactNode;
  // Number of stopover nights — used in the stopover-step title subtitle
  // ("2 nights in Dubai"). The city comes from `initialLocation`.
  stopoverNights?: number;
};

export default function HotelListPage({
  onHotelSelect,
  onBackToSearch,
  initialLocation,
  initialDateRange,
  initialRooms,
  hideSearch = false,
  headerSlot,
  stopoverNights,
}: HotelListPageProps) {
  // --- State ---

  // Search State
  // We use the initial values from the search page if they were provided,
  // otherwise fall back to sensible defaults.
  const [location, setLocation] = useState(initialLocation || "Lisbon (LIS)");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange || {
      from: new Date(),
      to: addDays(new Date(), 7),
    }
  );


  // Room & Guest State
  const [rooms, setRooms] = useState<{id: number, adults: number, children: number}[]>(
    initialRooms || [{ id: 1, adults: 2, children: 0 }]
  );

  const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);
  const totalGuests = totalAdults + totalChildren;

  const updateRoom = (index: number, field: 'adults' | 'children', value: number) => {
    const newRooms = [...rooms];
    newRooms[index] = { ...newRooms[index], [field]: value };
    setRooms(newRooms);
  };

  const addRoom = () => {
    setRooms([...rooms, { id: Date.now(), adults: 2, children: 0 }]);
  };

  const removeRoom = (index: number) => {
    if (rooms.length <= 1) return;
    const newRooms = rooms.filter((_, i) => i !== index);
    setRooms(newRooms);
  };

  // Dropdown visibility
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number, left: number } | null>(null);

  // Mobile State
  const [mobileView, setMobileView] = useState<MobileViewMode>('list');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  // Filters State
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedBoardTypes, setSelectedBoardTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedCancellation, setSelectedCancellation] = useState<string[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("recommended");

  // Hover State
  const [hoveredHotelId, setHoveredHotelId] = useState<string | null>(null);

  // Loading State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showLoadingBar, setShowLoadingBar] = useState(true);

  // --- Effects ---

  useEffect(() => {
    // Simulate loading progress
    const duration = 1500; // 1.5 seconds total
    const intervalTime = 20;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setShowLoadingBar(false), 500); // Fade out after reaching 100%
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // --- Handlers ---

  const handleDropdownToggle = (type: DropdownType, e?: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    if (openDropdown === type) {
      setOpenDropdown(null);
      setDropdownPos(null);
    } else {
      if (e) {
        const rect = e.currentTarget.getBoundingClientRect();
        // Adjust position slightly to align nicely
        setDropdownPos({ top: rect.bottom + 8, left: rect.left });
      }
      setOpenDropdown(type);
    }
  };

  const handleSearch = () => {
    setOpenDropdown(null);
    // Restart loading animation on search
    setLoadingProgress(0);
    setShowLoadingBar(true);

    // Simple restart logic
    const duration = 1500;
    const intervalTime = 20;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setShowLoadingBar(false), 500);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    showToast.success(`Search updated! Found ${filteredAndSortedHotels.length} hotels in ${location}`);
  };

  const toggleBoardType = (type: string) => {
    if (selectedBoardTypes.includes(type)) {
      setSelectedBoardTypes(selectedBoardTypes.filter(t => t !== type));
    } else {
      setSelectedBoardTypes([...selectedBoardTypes, type]);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const toggleCancellation = (policy: string) => {
    if (selectedCancellation.includes(policy)) {
      setSelectedCancellation(selectedCancellation.filter(p => p !== policy));
    } else {
      setSelectedCancellation([...selectedCancellation, policy]);
    }
  };

  const toggleStar = (star: number) => {
    if (selectedStars.includes(star)) {
      setSelectedStars(selectedStars.filter(s => s !== star));
    } else {
      setSelectedStars([...selectedStars, star]);
    }
  };

  const resetFilters = () => {
    setPriceRange([0, 500]);
    setSelectedBoardTypes([]);
    setSelectedAmenities([]);
    setSelectedCancellation([]);
    setSelectedStars([]);
    setSortOption("recommended");
    showToast.info("Filters reset");
  };

  // --- Filter & Sort Logic ---

  const filteredAndSortedHotels = HOTELS.filter(hotel => {
    // Price Filter
    if (hotel.price < priceRange[0] || hotel.price > priceRange[1]) return false;

    // Board Types Filter
    if (selectedBoardTypes.length > 0) {
      const hasBoardType = selectedBoardTypes.some(type => hotel.boardTypes.includes(type));
      if (!hasBoardType) return false;
    }

    // Amenities Filter
    if (selectedAmenities.length > 0) {
      const hasAllAmenities = selectedAmenities.every(amenity => hotel.amenities.includes(amenity));
      if (!hasAllAmenities) return false;
    }

    // Cancellation Filter
    if (selectedCancellation.length > 0) {
      // Logic:
      // "Free cancellation" -> Show hotels with Free Cancellation
      // "Exclude non refundable" -> Show hotels that are NOT Non-refundable (i.e., Free Cancellation)

      let matches = false;
      if (selectedCancellation.includes("Free cancellation") && hotel.cancellationPolicy === "Free cancellation") matches = true;
      if (selectedCancellation.includes("Exclude non refundable") && hotel.cancellationPolicy !== "Non-refundable") matches = true;

      if (!matches) return false;
    }

    // Stars Filter
    if (selectedStars.length > 0) {
      if (!selectedStars.includes(hotel.stars)) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortOption) {
      case "price_low":
        return a.price - b.price;
      case "price_high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "stars":
        return b.stars - a.stars;
      case "recommended":
      default:
        return 0; // Default order (mock recommended)
    }
  });

  const getSortLabel = () => {
    switch (sortOption) {
      case "price_low": return "Price: Low to High";
      case "price_high": return "Price: High to Low";
      case "rating": return "Rating";
      case "stars": return "Stars";
      default: return "Recommended";
    }
  };

  // --- Filter pill value labels ---
  // Each desktop filter pill shows its current value inline, exactly like the
  // flight filter bar ("Any airline" → "2 airlines"). This is what replaces
  // the old solid-fill "active" styling: a set filter reads its own value,
  // an unset one reads "Any …".
  const boardLabel =
    selectedBoardTypes.length === 0
      ? "Any board"
      : selectedBoardTypes.length === 1
      ? selectedBoardTypes[0]
      : `${selectedBoardTypes.length} board types`;

  const starsLabel =
    selectedStars.length === 0
      ? "Any rating"
      : selectedStars.length === 1
      ? `${selectedStars[0]} stars`
      : `${selectedStars.length} ratings`;

  const priceLabel =
    priceRange[0] === 0 && priceRange[1] === 500
      ? "Any price"
      : `$${priceRange[0]} – $${priceRange[1]}`;

  const amenitiesLabel =
    selectedAmenities.length === 0
      ? "Any amenities"
      : selectedAmenities.length === 1
      ? selectedAmenities[0]
      : `${selectedAmenities.length} amenities`;

  const cancellationLabel =
    selectedCancellation.length === 0
      ? "Any policy"
      : selectedCancellation.length === 1
      ? selectedCancellation[0]
      : `${selectedCancellation.length} policies`;

  const calculateDisplayPrice = (basePrice: number, hotel: Hotel) => {
    let price = basePrice;

    // Add cheapest selected board option that matches what the hotel actually offers
    if (selectedBoardTypes.length > 0) {
      const costs: Record<string, number> = {
        "Room only": 0,
        "Breakfast": 15,
        "Half board": 40,
        "Full board": 70
      };

      const applicableCosts = selectedBoardTypes
        .filter(type => hotel.boardTypes.includes(type)) // Only consider types this hotel offers
        .map(type => costs[type] ?? 0)
        .sort((a, b) => a - b);

      if (applicableCosts.length > 0) {
        price += applicableCosts[0];
      }
    }

    // Add cheapest selected cancellation option that matches what the hotel offers
    if (selectedCancellation.length > 0) {
       const costs: Record<string, number> = {
        "Free cancellation": 20,
        "Exclude non refundable": 20 // Maps to same cost behavior as Free Cancellation
      };

      const relevantSelections = selectedCancellation.map(s => {
          if (s === "Exclude non refundable") return "Free cancellation"; // Map to actual policy name
          return s;
      });

      const applicableCosts = relevantSelections
        .filter(type => type === hotel.cancellationPolicy) // Only consider if hotel offers it
        .map(type => {
            if (type === "Free cancellation") return 20;
            return 0;
        })
        .sort((a, b) => a - b);

      if (applicableCosts.length > 0) {
        price += applicableCosts[0];
      }
    }

    return price;
  };

  // --- Render Dropdown Content (Desktop) ---

  const renderDropdownContent = () => {
    if (!openDropdown || !dropdownPos) return null;

    const style: React.CSSProperties = {
      position: 'fixed',
      top: dropdownPos.top,
      left: dropdownPos.left,
      zIndex: 100 // Ensure it's above everything
    };

    switch (openDropdown) {
      case 'board':
        return (
          <div style={style} className="w-[240px] bg-card rounded-xl shadow-xl border border-border p-4 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-extrabold text-sm mb-3 text-foreground">Select Board Type</h4>
            <div className="flex flex-col gap-1">
              {["Room only", "Breakfast", "Half board", "Full board"].map(type => (
                <CheckboxRow
                  key={type}
                  label={type}
                  checked={selectedBoardTypes.includes(type)}
                  onChange={() => toggleBoardType(type)}
                />
              ))}
            </div>
          </div>
        );
      case 'price':
        return (
          <div style={style} className="w-[300px] bg-card rounded-xl shadow-xl border border-border p-6 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-extrabold text-sm mb-4 text-foreground">Price per night</h4>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={priceRange}
              max={500}
              step={10}
              onValueChange={setPriceRange}
            >
              <Slider.Track className="bg-grey-light relative grow rounded-full h-[6px]">
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 bg-primary shadow-md rounded-full hover:bg-blue-600 focus:outline-none border-[3px] border-white cursor-grab active:cursor-grabbing" />
              <Slider.Thumb className="block w-5 h-5 bg-primary shadow-md rounded-full hover:bg-blue-600 focus:outline-none border-[3px] border-white cursor-grab active:cursor-grabbing" />
            </Slider.Root>
            <div className="flex justify-between mt-4 text-sm font-extrabold text-foreground">
              <div className="px-3 py-1 rounded border border-border">${priceRange[0]}</div>
              <div className="px-3 py-1 rounded border border-border">${priceRange[1]}</div>
            </div>
          </div>
        );
      case 'amenities':
        return (
          <div style={style} className="w-[280px] bg-card rounded-xl shadow-xl border border-border p-4 animate-in fade-in zoom-in-95 duration-200 max-h-[400px] overflow-y-auto">
            <h4 className="font-extrabold text-sm mb-3 text-foreground">Hotel Amenities</h4>
            <div className="flex flex-col gap-1">
              {["Free Wifi", "Indoor pool", "Outdoor pool", "Gym", "Bar", "Restaurant", "Pet friendly", "Air conditioning", "Indoor parking", "24-hour reception", "Wheelchair accessible"].map(amenity => (
                <CheckboxRow
                  key={amenity}
                  label={amenity}
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
              ))}
            </div>
          </div>
        );
      case 'cancellation':
        return (
          <div style={style} className="w-[240px] bg-card rounded-xl shadow-xl border border-border p-4 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-extrabold text-sm mb-3 text-foreground">Cancellation Policy</h4>
            <div className="flex flex-col gap-1">
              {["Free cancellation", "Exclude non refundable"].map(policy => (
                <CheckboxRow
                  key={policy}
                  label={policy}
                  checked={selectedCancellation.includes(policy)}
                  onChange={() => toggleCancellation(policy)}
                />
              ))}
            </div>
          </div>
        );
      case 'stars':
        return (
          <div style={style} className="w-[200px] bg-card rounded-xl shadow-xl border border-border p-4 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-extrabold text-sm mb-3 text-foreground">Star Rating</h4>
            <div className="flex flex-col gap-1">
              {[5, 4, 3, 2, 1].map(star => (
                <CheckboxRow
                  key={star}
                  label={
                    <div className="flex items-center gap-1">
                      {[...Array(star)].map((_, i) => (
                        <Star key={i} size={14} className="fill-warning text-warning" aria-hidden="true" />
                      ))}
                    </div>
                  }
                  checked={selectedStars.includes(star)}
                  onChange={() => toggleStar(star)}
                />
              ))}
            </div>
          </div>
        );
      case 'sort':
        return (
          <div style={style} className="w-[240px] bg-card rounded-xl shadow-xl border border-border p-4 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-extrabold text-sm mb-3 text-foreground">Sort by</h4>
            <div className="flex flex-col gap-1">
              <RadioRow
                  label="Recommended"
                  checked={sortOption === 'recommended'}
                  onChange={() => setSortOption('recommended')}
              />
              <RadioRow
                  label="Price: Low to High"
                  checked={sortOption === 'price_low'}
                  onChange={() => setSortOption('price_low')}
              />
              <RadioRow
                  label="Price: High to Low"
                  checked={sortOption === 'price_high'}
                  onChange={() => setSortOption('price_high')}
              />
              <RadioRow
                  label="Rating: High to Low"
                  checked={sortOption === 'rating'}
                  onChange={() => setSortOption('rating')}
              />
                <RadioRow
                  label="Stars: High to Low"
                  checked={sortOption === 'stars'}
                  onChange={() => setSortOption('stars')}
              />
            </div>
          </div>
        );
      case 'location':
        return (
           <div style={{...style, width: '300px'}} className="bg-card rounded-xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2">
              {["Lisbon (LIS)", "Paris (CDG)", "London (LHR)", "Cagliari (CAG)", "Rome (FCO)"].map((city) => (
                <div
                  key={city}
                  className="px-4 py-3 hover:bg-grey-light rounded-lg cursor-pointer text-sm text-foreground flex items-center gap-2"
                  onClick={() => {
                    setLocation(city);
                    setOpenDropdown(null);
                  }}
                >
                  <MapPin size={14} className="text-grey" aria-hidden="true" />
                  {city}
                </div>
              ))}
            </div>
          </div>
        );
      case 'date':
        return (
           <div style={style} className="bg-card rounded-xl shadow-xl border border-border p-4 animate-in fade-in zoom-in-95 duration-200">
             {/* Shared design-system Calendar — same token-driven component the
                 flight edit-search panel uses, so both results editors match. */}
             <Calendar
               mode="range"
               defaultMonth={new Date()}
               selected={dateRange}
               // 1st click = check-in, 2nd = check-out, then auto-close.
               // Re-opening restarts on the first click (see stepRange).
               onSelect={(_range, day) => {
                 const next = stepRange(dateRange, day);
                 setDateRange(next);
                 if (isRangeComplete(next)) {
                   setTimeout(() => setOpenDropdown(null), 200);
                 }
               }}
               numberOfMonths={1}
               disabled={{ before: new Date() }}
               className="p-0"
             />
             <div className="flex justify-end mt-4 pt-4 border-t border-muted">
               <button
                 className="bg-primary text-white text-sm font-extrabold px-4 py-2 rounded-lg hover:brightness-85"
                 onClick={() => setOpenDropdown(null)}
               >
                 Apply Dates
               </button>
             </div>
           </div>
        );
      case 'guests':
        return (
          <div style={style} className="w-[300px] bg-card rounded-xl shadow-xl border border-border p-4 animate-in fade-in zoom-in-95 duration-200 cursor-default">
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-muted">
                <span className="font-extrabold text-foreground">Rooms</span>
                <span className="text-sm text-grey">{rooms.length}</span>
              </div>

              {rooms.map((room, index) => (
                <div key={room.id} className="flex flex-col gap-3 pb-4 border-b border-muted last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-foreground">Room {index + 1}</span>
                    {rooms.length > 1 && (
                      <button
                        onClick={() => removeRoom(index)}
                        className="text-xs text-red-600 font-medium hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Adults */}
                  <div className="flex justify-between items-center pl-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Adults</span>
                      <span className="text-xs text-grey">Age 18+</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-grey-light disabled:opacity-50"
                        onClick={() => updateRoom(index, 'adults', Math.max(1, room.adults - 1))}
                        disabled={room.adults <= 1}
                      >
                        <Minus size={12} aria-hidden="true" />
                      </button>
                      <span className="w-4 text-center text-sm font-extrabold">{room.adults}</span>
                      <button
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-grey-light"
                        onClick={() => updateRoom(index, 'adults', room.adults + 1)}
                      >
                        <Plus size={12} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex justify-between items-center pl-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Children</span>
                      <span className="text-xs text-grey">Under 18</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-grey-light disabled:opacity-50"
                        onClick={() => updateRoom(index, 'children', Math.max(0, room.children - 1))}
                        disabled={room.children <= 0}
                      >
                        <Minus size={12} aria-hidden="true" />
                      </button>
                      <span className="w-4 text-center text-sm font-extrabold">{room.children}</span>
                      <button
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-grey-light"
                        onClick={() => updateRoom(index, 'children', room.children + 1)}
                      >
                        <Plus size={12} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                className="w-full py-2 border border-dashed border-primary text-primary font-extrabold text-sm rounded-lg hover:bg-primary/5 transition-colors mt-2"
                onClick={addRoom}
              >
                + Add another room
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // On the stopover step we drop the side map, so the content matches the
  // narrower single-column width used by the other flight-flow pages. The
  // normal hotel search keeps the wide, map-friendly width.
  const containerTier = hideSearch ? "narrow" : "wide";

  return (
    <div className="bg-grey-lightest min-h-screen flex flex-col relative">
      {/* Overlay to close dropdowns */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Header Search Bar — white card strip with the back button, same as
          everywhere else. On the stopover step the search fields are dropped
          (see below) but the white header + back button stay. */}
      <div className="bg-card border-b border-border z-30 relative">
        <PageContainer tier={containerTier} className="px-4 md:px-6 py-4">

          {/* Back to Discovery — always visible, including on mobile.
              No bottom margin on the stopover step since nothing follows it
              inside this white strip. */}
          {onBackToSearch && (
            <BackButton
              label="Back to discovery"
              onClick={onBackToSearch}
              className={hideSearch ? undefined : "mb-3"}
            />
          )}

          {/* Mobile Read-Only View — hidden on the stopover step (no search) */}
          {!hideSearch && !isMobileSearchExpanded && (
            <div className="md:hidden flex items-center justify-between gap-3">
              <div
                className="flex-1 flex flex-col cursor-pointer"
                onClick={() => setIsMobileSearchExpanded(true)}
              >
                <div className="font-extrabold text-foreground text-sm flex items-center gap-2">
                  <MapPin size={16} className="text-primary" aria-hidden="true" />
                  <span className="truncate">{location}</span>
                </div>
                <div className="text-grey text-xs mt-0.5 ml-6 flex items-center gap-1">
                  <span>{dateRange?.from ? format(dateRange.from, "MMM dd") : "Select"}</span>
                  <span>-</span>
                  <span>{dateRange?.to ? format(dateRange.to, "MMM dd") : "Select"}</span>
                  <span>•</span>
                  <span>{totalGuests} Guests, {rooms.length} Room{rooms.length > 1 ? 's' : ''}</span>
                </div>
              </div>
              <button
                className="text-primary font-extrabold text-sm px-4 py-2 bg-grey-light rounded-full shrink-0"
                onClick={() => setIsMobileSearchExpanded(true)}
              >
                Edit
              </button>
            </div>
          )}

          {/* The whole search row — only on the normal hotel search, never on
              the stopover step (where city + dates are already decided). */}
          {!hideSearch && (
          <div className={cn(
            isMobileSearchExpanded ? 'flex' : 'hidden',
            "md:flex flex-col lg:flex-row gap-4 items-center animate-in fade-in slide-in-from-top-2 duration-200"
          )}>

            {/* Location Input */}
            <div
              className={cn(
                "border rounded-lg h-[48px] flex items-center px-4 gap-3 w-full lg:flex-1 cursor-pointer transition-colors",
                openDropdown === 'location'
                  ? "border-primary ring-2 ring-primary/20 bg-card"
                  : "border-border bg-white hover:border-primary"
              )}
              onClick={(e) => handleDropdownToggle('location', e)}
            >
              <MapPin size={16} className="text-primary shrink-0" aria-hidden="true" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-extrabold text-grey uppercase tracking-wide leading-none mb-0.5">Destination</span>
                <span className="text-sm font-semibold text-foreground truncate">{location}</span>
              </div>
              <ChevronDown size={14} className="text-grey shrink-0" aria-hidden="true" />
            </div>

            {/* Date Picker */}
            <div
              className={cn(
                "border rounded-lg h-[48px] flex items-center px-4 gap-3 w-full lg:flex-1 cursor-pointer transition-colors",
                openDropdown === 'date'
                  ? "border-primary ring-2 ring-primary/20 bg-card"
                  : "border-border bg-white hover:border-primary"
              )}
              onClick={(e) => handleDropdownToggle('date', e)}
            >
              <CalendarIcon size={16} className="text-primary shrink-0" aria-hidden="true" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-extrabold text-grey uppercase tracking-wide leading-none mb-0.5">Check-in – Check-out</span>
                <span className={cn(
                  "text-sm font-semibold truncate",
                  dateRange?.from ? "text-foreground" : "text-grey font-normal"
                )}>
                  {dateRange?.from
                    ? `${format(dateRange.from, "MMM d")} – ${dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "?"}`
                    : "Add dates"}
                </span>
              </div>
              <ChevronDown size={14} className="text-grey shrink-0" aria-hidden="true" />
            </div>

            {/* Guests */}
            <div
              className={cn(
                "border rounded-lg h-[48px] flex items-center px-4 gap-3 w-full lg:flex-1 cursor-pointer transition-colors",
                openDropdown === 'guests'
                  ? "border-primary ring-2 ring-primary/20 bg-card"
                  : "border-border bg-white hover:border-primary"
              )}
              onClick={(e) => handleDropdownToggle('guests', e)}
            >
              <Users size={16} className="text-primary shrink-0" aria-hidden="true" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-extrabold text-grey uppercase tracking-wide leading-none mb-0.5">Travellers</span>
                <span className="text-sm font-semibold text-foreground truncate">
                  {totalGuests} Guest{totalGuests !== 1 ? 's' : ''} · {rooms.length} Room{rooms.length > 1 ? 's' : ''}
                </span>
              </div>
              <ChevronDown size={14} className="text-grey shrink-0" aria-hidden="true" />
            </div>

            {/* Search Button */}
            <button
              className="bg-primary hover:brightness-85 text-white font-extrabold px-8 h-[48px] rounded-lg transition-all w-full lg:w-auto flex items-center justify-center gap-2"
              onClick={() => {
                handleSearch();
                setIsMobileSearchExpanded(false);
              }}
            >
              <Search size={18} aria-hidden="true" />
              Search
            </button>
          </div>
          )}
        </PageContainer>
      </div>

      {/* Stopover step: the flight stepper sits on the grey page background,
          just under the white header (not inside it). */}
      {headerSlot && (
        <div className="bg-grey-lightest">
          <PageContainer tier={containerTier} className="px-4 md:px-6 pt-4 pb-3">
            {headerSlot}

            {/* Title + subtitle — same style AND spacing as the flight step's
                heading: gap-2.5 icon↔text, mt-0.5 title↔subtitle, mb-10 from
                the stepper above and (via pb-3 here + the filter bar's py-3)
                ~mb-6 to the filters below. Reads: stepper → title → filters. */}
            {hideSearch && (
              <div className="mt-10 flex items-start gap-2.5">
                <Hotel size={22} className="text-primary shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h1 className="text-lg md:text-xl font-extrabold text-foreground leading-tight">
                    Pick your stopover hotel
                  </h1>
                  {stopoverNights && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {stopoverNights} night{stopoverNights > 1 ? "s" : ""} in {initialLocation || location}
                    </p>
                  )}
                </div>
              </div>
            )}
          </PageContainer>
        </div>
      )}

      {/* Horizontal Filter Bar (Desktop) */}
      <div className="hidden md:block bg-grey-lightest sticky top-0 z-30">
        <PageContainer tier={containerTier} className="px-4 md:px-6 py-3 flex gap-3 overflow-x-auto no-scrollbar items-center">

          {/* Sort By — ArrowDownWideNarrow matches the flight bar's sort pill */}
           <FilterButton
             label={getSortLabel()}
             active={openDropdown === 'sort'}
             hasSelection={sortOption !== 'recommended'}
             onClick={(e) => handleDropdownToggle('sort', e)}
             icon={<ArrowDownWideNarrow size={14} aria-hidden="true" />}
           />

          {/* Board Types Filter */}
          <FilterButton
            label={boardLabel}
            active={openDropdown === 'board'}
            hasSelection={selectedBoardTypes.length > 0}
            onClick={(e) => handleDropdownToggle('board', e)}
            icon={<Utensils size={14} aria-hidden="true" />}
          />

           {/* Star Rating Filter */}
           <FilterButton
            label={starsLabel}
            active={openDropdown === 'stars'}
            hasSelection={selectedStars.length > 0}
            onClick={(e) => handleDropdownToggle('stars', e)}
            icon={<Star size={14} aria-hidden="true" />}
          />

          {/* Price Filter */}
          <FilterButton
            label={priceLabel}
            active={openDropdown === 'price'}
            hasSelection={priceRange[0] > 0 || priceRange[1] < 500}
            onClick={(e) => handleDropdownToggle('price', e)}
            icon={<Wallet size={14} aria-hidden="true" />}
          />

          {/* Amenities Filter */}
          <FilterButton
            label={amenitiesLabel}
            active={openDropdown === 'amenities'}
            hasSelection={selectedAmenities.length > 0}
            onClick={(e) => handleDropdownToggle('amenities', e)}
            icon={<Sparkles size={14} aria-hidden="true" />}
          />

          {/* Cancellation Policy Filter */}
          <FilterButton
            label={cancellationLabel}
            active={openDropdown === 'cancellation'}
            hasSelection={selectedCancellation.length > 0}
            onClick={(e) => handleDropdownToggle('cancellation', e)}
            icon={<ShieldCheck size={14} aria-hidden="true" />}
          />

          {(selectedBoardTypes.length > 0 || selectedAmenities.length > 0 || selectedCancellation.length > 0 || selectedStars.length > 0 || priceRange[0] > 0 || priceRange[1] < 500 || sortOption !== 'recommended') && (
            <button
              onClick={resetFilters}
              className="text-primary text-sm font-extrabold hover:underline ml-3"
            >
              Reset all
            </button>
          )}
        </PageContainer>
      </div>

      {/* Mobile Filter Bar (Sticky Top) */}
      <div className="md:hidden bg-grey-lightest sticky top-0 z-30 px-4 py-3">
        <div className="bg-card border border-border rounded-full flex items-center h-[48px] w-full">
           {/* Sort Button */}
           <button
             className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-extrabold text-foreground active:bg-gray-50 transition-colors first:rounded-l-full"
             onClick={() => setIsMobileSortOpen(true)}
           >
             <ArrowUpDown size={14} aria-hidden="true" />
             Sort
           </button>

           <div className="w-[1px] h-6 bg-border" />

           {/* Filters Button */}
           <button
             className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-extrabold text-foreground active:bg-gray-50 transition-colors"
             onClick={() => setIsMobileFiltersOpen(true)}
           >
             <SlidersHorizontal size={14} aria-hidden="true" />
             Filters
           </button>

           {/* Map/List Toggle — hidden on the stopover step (there's no map) */}
           {!hideSearch && <div className="w-[1px] h-6 bg-border" />}

           {!hideSearch && (
           <button
             className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-extrabold text-foreground active:bg-gray-50 transition-colors last:rounded-r-full"
             onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
           >
             {mobileView === 'list' ? <MapIcon size={14} aria-hidden="true" /> : <List size={14} aria-hidden="true" />}
             {mobileView === 'list' ? 'Map' : 'List'}
           </button>
           )}
        </div>
      </div>

      {/* Main Content — split list+map for normal search; a single full-width
          column (no map) on the stopover step so it matches the other pages. */}
      <PageContainer
        tier={containerTier}
        className={cn("relative", hideSearch ? "block" : "flex flex-1 overflow-hidden")}
      >

        {/* Hotel List */}
        <div className={cn(
          // Horizontal + bottom padding is shared; top padding differs per mode
          // (see below) so the stopover step can sit tight under the filter bar.
          "min-w-0 flex flex-col px-4 md:px-6 pb-4 md:pb-6",
          // Stopover step: full width, page scrolls normally (no inner scroll).
          // Tight top padding (pt-2 = 8px) so that 8px + the filter bar's 12px
          // bottom padding ≈ the flight list's 20px filter→results gap.
          // Normal search: 65% column beside the map, with its own scroll and
          // the usual generous top padding under the result-count heading.
          hideSearch
            ? "w-full pt-2 gap-4"
            : cn(
                "pt-4 md:pt-6 gap-6 w-full md:w-[65%] h-[calc(100vh-130px)] overflow-y-auto",
                mobileView === 'map' ? 'hidden md:flex' : 'flex',
              ),
        )}>
          {/* Header wrapper — only rendered when it has something to show: the
              result-count (normal search) or the loading bar (while searching).
              On the stopover step, the count is hidden and once loading is done
              this whole block is skipped, so it no longer eats a gap slot above
              the cards — that was the source of the oversized stopover gap. */}
          {(!hideSearch || showLoadingBar) && (
          <div className="flex flex-col gap-2">
            {/* Result count — only on the normal search. The stopover step's
                title lives above the filter bar instead (see header section). */}
            {!hideSearch && (
              <div className="flex justify-between items-center">
                <h2 className="text-foreground font-extrabold text-xl">
                  {filteredAndSortedHotels.length} Hotel offer{filteredAndSortedHotels.length !== 1 ? 's' : ''}
                  {filteredAndSortedHotels.length === 0 && <span className="font-normal text-sm ml-2 text-muted-foreground">(Try adjusting your filters)</span>}
                </h2>
              </div>
            )}

            {/* Loading Bar */}
            {showLoadingBar && (
              <div className={cn(
                "h-1 w-full bg-gray-200/50 rounded-full overflow-hidden transition-opacity duration-500",
                loadingProgress >= 100 ? 'opacity-0' : 'opacity-100'
              )}>
                <div
                  className="h-full bg-primary transition-all duration-75 ease-linear"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            )}
          </div>
          )}

          <div className="flex flex-col gap-4 pb-24 md:pb-10">
            {/* While the simulated 1.5s search is running, show 4 SkeletonCards
                instead of jumping the real cards in. This is the doc's 1s–3s
                tier — skeleton with pulse, no globe needed (fast enough). */}
            {showLoadingBar && loadingProgress < 100 ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <SkeletonCard key={i} variant="horizontal" />
                ))}
              </>
            ) : filteredAndSortedHotels.length > 0 ? (
              <StaggeredList className="flex flex-col gap-4">
                {filteredAndSortedHotels.map(hotel => {
                  const displayPrice = calculateDisplayPrice(hotel.price, hotel);
                  return (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      displayPrice={displayPrice}
                      onSelect={() => onHotelSelect({ ...hotel, price: displayPrice }, { board: selectedBoardTypes, cancellation: selectedCancellation }, rooms)}
                      onHover={(isHovering) => setHoveredHotelId(isHovering ? hotel.id : null)}
                      isHovered={hoveredHotelId === hotel.id}
                    />
                  );
                })}
              </StaggeredList>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed border-gray-200">
                <Search size={48} className="text-gray-300 mb-4" aria-hidden="true" />
                <h3 className="text-lg font-extrabold text-gray-700">No hotels found</h3>
                <p className="text-gray-500 mt-2">Try changing your dates or removing some filters.</p>
                <button
                  className="mt-6 text-primary font-extrabold hover:underline"
                  onClick={resetFilters}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map — hidden entirely on the stopover step (single-column layout) */}
        {!hideSearch && (
        <div className={cn(
          "w-full md:w-[35%] min-w-0 h-[calc(100vh-130px)] sticky top-0",
          mobileView === 'list' ? 'hidden md:block' : 'block'
        )}>
          <LeafletMap
            // Centre the map on Cagliari (where all our hotels are)
            center={[39.2238, 9.1217]}
            zoom={13}
            // Build marker data from whichever hotels are currently visible after filtering
            markers={filteredAndSortedHotels.map((hotel): MapMarkerData => ({
              id: hotel.id,
              lat: hotel.coordinates.lat,
              lng: hotel.coordinates.lng,
              label: hotel.name,
              price: `$${calculateDisplayPrice(hotel.price, hotel)}`,
              isHighlighted: hoveredHotelId === hotel.id,
            }))}
            // When hovering a map marker, highlight the matching card in the list
            onMarkerHover={(id) => setHoveredHotelId(id)}
          />
        </div>
        )}

      </PageContainer>

      {/* Render Fixed Dropdowns (Desktop) */}
      {renderDropdownContent()}

      {/* Mobile Filters Takeover */}
      {isMobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-card flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-extrabold text-foreground">Filters</h2>
            <button
              className="p-2 hover:bg-grey-light rounded-full"
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              <X size={24} className="text-foreground" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8 pb-24">

            {/* Price */}
            <div className="flex flex-col gap-4">
              <h3 className="font-extrabold text-foreground">Price per night</h3>
               <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={priceRange}
                max={500}
                step={10}
                onValueChange={setPriceRange}
              >
                <Slider.Track className="bg-grey-light relative grow rounded-full h-[6px]">
                  <Slider.Range className="absolute bg-primary rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-6 h-6 bg-primary shadow-md rounded-full hover:bg-blue-600 focus:outline-none border-[3px] border-white cursor-grab active:cursor-grabbing" />
                <Slider.Thumb className="block w-6 h-6 bg-primary shadow-md rounded-full hover:bg-blue-600 focus:outline-none border-[3px] border-white cursor-grab active:cursor-grabbing" />
              </Slider.Root>
              <div className="flex justify-between text-sm font-extrabold text-foreground">
                <div className="px-4 py-2 rounded-lg border border-border">${priceRange[0]}</div>
                <div className="px-4 py-2 rounded-lg border border-border">${priceRange[1]}</div>
              </div>
            </div>

            <div className="h-[1px] bg-border w-full" />

            {/* Stars */}
            <div className="flex flex-col gap-3">
              <h3 className="font-extrabold text-foreground">Star Rating</h3>
              <div className="flex flex-col gap-3">
                {[5, 4, 3, 2, 1].map(star => (
                  <CheckboxRow
                    key={star}
                    label={
                      <div className="flex items-center gap-1">
                        {[...Array(star)].map((_, i) => (
                          <Star key={i} size={16} className="fill-warning text-warning" aria-hidden="true" />
                        ))}
                      </div>
                    }
                    checked={selectedStars.includes(star)}
                    onChange={() => toggleStar(star)}
                  />
                ))}
              </div>
            </div>

            <div className="h-[1px] bg-border w-full" />

            {/* Board */}
            <div className="flex flex-col gap-3">
              <h3 className="font-extrabold text-foreground">Board Type</h3>
              <div className="flex flex-col gap-3">
                 {["Room only", "Breakfast", "Half board", "Full board"].map(type => (
                  <CheckboxRow
                    key={type}
                    label={type}
                    checked={selectedBoardTypes.includes(type)}
                    onChange={() => toggleBoardType(type)}
                  />
                ))}
              </div>
            </div>

             <div className="h-[1px] bg-border w-full" />

            {/* Amenities */}
            <div className="flex flex-col gap-3">
              <h3 className="font-extrabold text-foreground">Amenities</h3>
              <div className="flex flex-col gap-3">
                {["Free Wifi", "Indoor pool", "Outdoor pool", "Gym", "Bar", "Restaurant", "Pet friendly", "Air conditioning", "Indoor parking", "24-hour reception", "Wheelchair accessible"].map(amenity => (
                  <CheckboxRow
                    key={amenity}
                    label={amenity}
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />
                ))}
              </div>
            </div>

            <div className="h-[1px] bg-border w-full" />

            {/* Cancellation */}
            <div className="flex flex-col gap-3">
              <h3 className="font-extrabold text-foreground">Cancellation Policy</h3>
              <div className="flex flex-col gap-3">
                {["Free cancellation", "Exclude non refundable"].map(policy => (
                  <CheckboxRow
                    key={policy}
                    label={policy}
                    checked={selectedCancellation.includes(policy)}
                    onChange={() => toggleCancellation(policy)}
                  />
                ))}
              </div>
            </div>

          </div>

          <div className="p-4 border-t border-border bg-card pb-8">
            <div className="flex gap-4">
              <button
                className="flex-1 py-3 font-extrabold text-foreground underline"
                onClick={resetFilters}
              >
                Clear all
              </button>
              <button
                className="flex-[2] bg-primary text-white font-extrabold py-3 rounded-lg"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                Show {filteredAndSortedHotels.length} hotels
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sort Takeover */}
      {isMobileSortOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-foreground/50 flex flex-col justify-end animate-in fade-in duration-200">
           {/* Backdrop click to close */}
           <div className="absolute inset-0" onClick={() => setIsMobileSortOpen(false)} />

           <div className="bg-card rounded-t-3xl p-6 pb-12 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300 z-10">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-extrabold text-foreground">Sort by</h3>
                <button
                  className="p-2 hover:bg-grey-light rounded-full"
                  onClick={() => setIsMobileSortOpen(false)}
                >
                  <X size={20} className="text-foreground" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <RadioRow
                    label="Recommended"
                    checked={sortOption === 'recommended'}
                    onChange={() => { setSortOption('recommended'); setIsMobileSortOpen(false); }}
                />
                <RadioRow
                    label="Price: Low to High"
                    checked={sortOption === 'price_low'}
                    onChange={() => { setSortOption('price_low'); setIsMobileSortOpen(false); }}
                />
                <RadioRow
                    label="Price: High to Low"
                    checked={sortOption === 'price_high'}
                    onChange={() => { setSortOption('price_high'); setIsMobileSortOpen(false); }}
                />
                <RadioRow
                    label="Rating: High to Low"
                    checked={sortOption === 'rating'}
                    onChange={() => { setSortOption('rating'); setIsMobileSortOpen(false); }}
                />
                  <RadioRow
                    label="Stars: High to Low"
                    checked={sortOption === 'stars'}
                    onChange={() => { setSortOption('stars'); setIsMobileSortOpen(false); }}
                />
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
