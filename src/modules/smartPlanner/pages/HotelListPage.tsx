import React, { useState, useEffect } from "react";
import { BackButton } from "../../../shared/components/BackButton";
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
  List,
  ArrowRight
} from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import { toast } from "sonner";
import { DayPicker, DateRange } from "react-day-picker";
import { format, addDays } from "date-fns";
import "react-day-picker/dist/style.css";

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
  coordinates: { x: number; y: number }; // Percentages for map placement
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
    coordinates: { x: 45, y: 30 }
  },
  {
    id: "h2",
    name: "UNAHOTELS T Hotel Cagliari",
    image: "https://images.unsplash.com/photo-1694595437436-2ccf5a95591f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGV4dGVyaW9yJTIwbW9kZXJuJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc3MDYzODYyN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    stars: 4,
    rating: 9.2,
    reviewCount: 367,
    location: "Cagliari, Italy",
    price: 105,
    amenities: ["Pet friendly", "Free Wifi", "Indoor pool", "Air conditioning"],
    boardTypes: ["Room only", "Breakfast"],
    cancellationPolicy: "Free cancellation",
    coordinates: { x: 55, y: 40 }
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
    coordinates: { x: 30, y: 60 }
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
    coordinates: { x: 70, y: 20 }
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
    coordinates: { x: 20, y: 45 }
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
    coordinates: { x: 65, y: 75 }
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
    coordinates: { x: 80, y: 60 }
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
    coordinates: { x: 40, y: 80 }
  }
];

// --- Components ---

const FilterButton = ({ label, active, onClick, hasSelection, icon }: { label: string, active: boolean, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, hasSelection?: boolean, icon?: React.ReactNode }) => (
  <button 
    className={`px-4 py-2 rounded-full border text-sm flex items-center gap-2 transition-all shrink-0 ${active || hasSelection ? 'bg-[#2681ff] border-[#2681ff] text-white' : 'bg-white border-[#e0e2e8] text-[#333743] hover:border-[#2681ff]' } font-[Mulish]`}
    onClick={onClick}
  >
    {icon && icon}
    {label}
    <ChevronDown size={14} className={active ? "rotate-180 transition-transform" : "transition-transform"} />
  </button>
);

const CheckboxRow = ({ label, checked, onChange }: { label: React.ReactNode, checked: boolean, onChange: () => void }) => (
  <div className="flex items-center gap-3 cursor-pointer group py-2" onClick={onChange}>
    <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors shrink-0 ${checked ? 'bg-[#2681ff] border-[#2681ff]' : 'bg-white border-[#e0e2e8] group-hover:border-[#2681ff]'}`}>
      {checked && <Check size={14} className="text-white" />}
    </div>
    <span className="text-[#333743] text-[14px] font-medium whitespace-nowrap flex items-center gap-1">{label}</span>
  </div>
);

const RadioRow = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
  <div className="flex items-center gap-3 cursor-pointer group py-2" onClick={onChange}>
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${checked ? 'border-[#2681ff]' : 'border-[#e0e2e8] group-hover:border-[#2681ff]'}`}>
      {checked && <div className="w-2.5 h-2.5 rounded-full bg-[#2681ff]" />}
    </div>
    <span className="text-[#333743] text-[14px] font-medium whitespace-nowrap">{label}</span>
  </div>
);

const HotelCard = ({ hotel, displayPrice, onSelect, onHover, isHovered }: { hotel: Hotel, displayPrice: number, onSelect: () => void, onHover?: (hovering: boolean) => void, isHovered?: boolean }) => {
  return (
    <div
      className={`bg-white rounded-[16px] overflow-hidden flex flex-col lg:flex-row shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] hover:shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] transition-all cursor-pointer group border ${isHovered ? 'border-[#e0e2e8]' : 'border-transparent'}`}
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {/* Image — stacks above content below 1024px, sits beside it at lg+ */}
      <div className="w-full lg:w-[260px] h-[160px] lg:h-auto shrink-0">
        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>

      {/* Content — p-4 on mobile, p-6 on lg+ */}
      <div className="flex-1 flex flex-col gap-4 p-4 lg:p-6">
        <div className="flex justify-between items-start gap-3">
          {/* min-w-0 + flex-1 let the name column shrink so the rating badge never gets pushed off-screen */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            {/* Name + stars inline — stars follow the name naturally and wrap with it */}
            <p className="font-bold text-[#333743] text-[18px] group-hover:text-[#2681ff] transition-colors leading-snug">
              {hotel.name}{" "}
              <span className="text-[#FFB700] text-[13px] whitespace-nowrap align-top">{"★".repeat(hotel.stars)}</span>
            </p>
            {/* Location sits below the name row */}
            <div className="text-[#333743] text-[12px] flex items-center gap-1.5">
              <MapPin size={12} />
              {hotel.location}
            </div>
          </div>
          {/* TrustYou rating alligned to the left in the row */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <div className="bg-[#19a974] text-white text-[12px] font-bold px-1.5 py-0.5 rounded-[4px]">{hotel.rating}</div>
              <span className="text-[#333743] text-[12px] font-bold">Excellent</span>
            </div>
            <span className="text-[#333743] text-[10px]">{hotel.reviewCount} reviews</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hotel.amenities.slice(0, 3).map((amenity, i) => (
            // Pill chip — matches DiscoveryPage hotel tab: light blue bg, blue text, rounded-full
            <div key={i} className="flex items-center gap-1 bg-[#EFF6FF] text-[#2681FF] text-[12px] font-medium px-2.5 py-1 rounded-full">
              {amenity === "Pet friendly" && <Dog size={12} />}
              {amenity === "Free Wifi" && <Wifi size={12} />}
              {amenity === "Indoor pool" && <Waves size={12} />}
              {amenity === "Gym" && <Dumbbell size={12} />}
              {amenity === "Restaurant" && <Utensils size={12} />}
              {amenity === "Bar" && <Wine size={12} />}
              {amenity === "Air conditioning" && <Wind size={12} />}
              {amenity === "Wheelchair accessible" && <Accessibility size={12} />}
              <span>{amenity}</span>
            </div>
          ))}
        </div>

        {/* Footer: price on the left, "View details" button on the right — matches Figma Frame 5 */}
        {/* On mobile: price above, full-width button below. On sm+: side-by-side. */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
          <div className="flex flex-col gap-0.5">
            {/* Free cancellation badge sits above the price label when applicable */}
            {hotel.cancellationPolicy === "Free cancellation" && (
              <span className="text-[#19a974] text-[12px] font-bold flex items-center gap-1 mb-1">
                <Check size={12} />
                Free cancellation
              </span>
            )}
            {/* Price inline — label + amount on one baseline, right-aligned on mobile */}
            <div className="flex items-baseline gap-1.5 self-end sm:self-auto">
              <span className="text-[#333743] text-[11px]">Per person, per night from</span>
              <span className="text-[#333743] font-black text-[22px] leading-none">${displayPrice}</span>
            </div>
          </div>
          {/* Blue CTA button — full-width on mobile for an easier tap target, auto-width on sm+ */}
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="w-full sm:w-auto justify-center bg-[#2681ff] hover:bg-[#1a6fd9] text-white font-bold text-[14px] px-5 py-2.5 rounded-[10px] transition-colors flex items-center gap-2"
          >
            View details
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MapMarker = ({ hotel, price, isHovered }: { hotel: Hotel, price: number, isHovered: boolean }) => (
  <div 
    className={`absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-300 z-10
      ${isHovered ? 'scale-110 z-20' : 'scale-100'}
    `}
    style={{ left: `${hotel.coordinates.x}%`, top: `${hotel.coordinates.y}%` }}
  >
    <div 
      className={`px-3 py-1.5 rounded-[8px] font-bold text-sm shadow-md flex items-center justify-center relative
        ${isHovered ? 'bg-[#2681ff] text-white' : 'bg-white text-[#333743]'}
      `}
    >
      ${price}
      <div 
        className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 
          ${isHovered ? 'bg-[#2681ff]' : 'bg-white'}
        `} 
      />
    </div>
  </div>
);

// Props type for HotelListPage.
// The "initial*" props are optional — they come from the search page when the user
// clicked "Search Hotels". If they're not provided, sensible defaults are used.
type HotelListPageProps = {
  onHotelSelect: (hotel: Hotel, filters?: { board: string[], cancellation: string[] }, rooms?: {id: number, adults: number, children: number}[]) => void;
  onBackToSearch?: () => void;          // Navigates back to the search landing page
  initialLocation?: string;             // Pre-fills the destination field
  initialDateRange?: DateRange;         // Pre-fills the date picker
  initialRooms?: {id: number, adults: number, children: number}[]; // Pre-fills room config
};

export default function HotelListPage({
  onHotelSelect,
  onBackToSearch,
  initialLocation,
  initialDateRange,
  initialRooms,
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

    toast.success("Search updated!", {
      description: `Found ${filteredAndSortedHotels.length} hotels in ${location}`
    });
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
    toast.info("Filters reset");
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
          <div style={style} className="w-[240px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-bold text-sm mb-3 text-[#333743]">Select Board Type</h4>
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
          <div style={style} className="w-[300px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-6 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-bold text-sm mb-4 text-[#333743]">Price per night</h4>
            <Slider.Root 
              className="relative flex items-center select-none touch-none w-full h-5" 
              value={priceRange} 
              max={500} 
              step={10}
              onValueChange={setPriceRange}
            >
              <Slider.Track className="bg-[#f3f5f6] relative grow rounded-full h-[6px]">
                <Slider.Range className="absolute bg-[#2681ff] rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 bg-[#2681ff] shadow-md rounded-full hover:bg-blue-600 focus:outline-none border-[3px] border-white cursor-grab active:cursor-grabbing" />
              <Slider.Thumb className="block w-5 h-5 bg-[#2681ff] shadow-md rounded-full hover:bg-blue-600 focus:outline-none border-[3px] border-white cursor-grab active:cursor-grabbing" />
            </Slider.Root>
            <div className="flex justify-between mt-4 text-sm font-bold text-[#333743]">
              <div className="px-3 py-1 rounded border border-[#e0e2e8]">${priceRange[0]}</div>
              <div className="px-3 py-1 rounded border border-[#e0e2e8]">${priceRange[1]}</div>
            </div>
          </div>
        );
      case 'amenities':
        return (
          <div style={style} className="w-[280px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200 max-h-[400px] overflow-y-auto">
            <h4 className="font-bold text-sm mb-3 text-[#333743]">Hotel Amenities</h4>
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
          <div style={style} className="w-[240px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-bold text-sm mb-3 text-[#333743]">Cancellation Policy</h4>
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
          <div style={style} className="w-[200px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-bold text-sm mb-3 text-[#333743]">Star Rating</h4>
            <div className="flex flex-col gap-1">
              {[5, 4, 3, 2, 1].map(star => (
                <CheckboxRow 
                  key={star} 
                  label={
                    <div className="flex items-center gap-1">
                      {[...Array(star)].map((_, i) => (
                        <Star key={i} size={14} className="fill-[#FFB700] text-[#FFB700]" />
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
          <div style={style} className="w-[240px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-bold text-sm mb-3 text-[#333743]">Sort by</h4>
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
           <div style={{...style, width: '300px'}} className="bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2">
              {["Lisbon (LIS)", "Paris (CDG)", "London (LHR)", "Cagliari (CAG)", "Rome (FCO)"].map((city) => (
                <div 
                  key={city}
                  className="px-4 py-3 hover:bg-[#f3f5f6] rounded-[8px] cursor-pointer text-sm text-[#333743] flex items-center gap-2"
                  onClick={() => {
                    setLocation(city);
                    setOpenDropdown(null);
                  }}
                >
                  <MapPin size={14} className="text-[#9598a4]" />
                  {city}
                </div>
              ))}
            </div>
          </div>
        );
      case 'date':
        return (
           <div style={style} className="bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200">
             {/* --rdp-accent-color: the selected day fill. --rdp-background-color: the range-middle + hover tint. Both must be set or the range highlight defaults to react-day-picker's own blue. */}
             <style>{`.rdp { --rdp-accent-color: #2681ff; --rdp-background-color: rgba(38, 129, 255, 0.1); margin: 0; } .rdp-day_selected:not([disabled]) { font-weight: bold; }`}</style>
             <DayPicker
               mode="range"
               defaultMonth={new Date()}
               selected={dateRange}
               onSelect={setDateRange}
               numberOfMonths={1}
             />
             <div className="flex justify-end mt-4 pt-4 border-t border-[#f3f5f6]">
               <button 
                 className="bg-[#2681ff] text-white text-sm font-bold px-4 py-2 rounded-[8px] hover:bg-[#1a6fd9]"
                 onClick={() => setOpenDropdown(null)}
               >
                 Apply Dates
               </button>
             </div>
           </div>
        );
      case 'guests':
        return (
          <div style={style} className="w-[300px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200 cursor-default">
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-[#f3f5f6]">
                <span className="font-bold text-[#333743]">Rooms</span>
                <span className="text-sm text-[#9598a4]">{rooms.length}</span>
              </div>
              
              {rooms.map((room, index) => (
                <div key={room.id} className="flex flex-col gap-3 pb-4 border-b border-[#f3f5f6] last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#333743]">Room {index + 1}</span>
                    {rooms.length > 1 && (
                      <button 
                        onClick={() => removeRoom(index)}
                        className="text-[12px] text-[#ff4d4f] font-medium hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  {/* Adults */}
                  <div className="flex justify-between items-center pl-2">
                    <span className="text-sm text-[#5f6372]">Adults</span>
                    <div className="flex items-center gap-3">
                      <button 
                        className="w-7 h-7 rounded-full border border-[#e0e2e8] flex items-center justify-center hover:bg-[#f3f5f6] disabled:opacity-50"
                        onClick={() => updateRoom(index, 'adults', Math.max(1, room.adults - 1))}
                        disabled={room.adults <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-4 text-center text-sm font-bold">{room.adults}</span>
                      <button 
                        className="w-7 h-7 rounded-full border border-[#e0e2e8] flex items-center justify-center hover:bg-[#f3f5f6]"
                        onClick={() => updateRoom(index, 'adults', room.adults + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex justify-between items-center pl-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-[#5f6372]">Children</span>
                      <span className="text-[10px] text-[#9598a4]">Ages 0-17</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        className="w-7 h-7 rounded-full border border-[#e0e2e8] flex items-center justify-center hover:bg-[#f3f5f6] disabled:opacity-50"
                        onClick={() => updateRoom(index, 'children', Math.max(0, room.children - 1))}
                        disabled={room.children <= 0}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-4 text-center text-sm font-bold">{room.children}</span>
                      <button 
                        className="w-7 h-7 rounded-full border border-[#e0e2e8] flex items-center justify-center hover:bg-[#f3f5f6]"
                        onClick={() => updateRoom(index, 'children', room.children + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                className="w-full py-2 border border-dashed border-[#2681ff] text-[#2681ff] font-bold text-sm rounded-[8px] hover:bg-blue-50 transition-colors mt-2"
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

  return (
    <div className="bg-[#f3f5f6] min-h-screen flex flex-col relative">
      {/* Overlay to close dropdowns */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Header Search Bar */}
      <div className="bg-white border-b border-[#e0e2e8] z-30 relative">
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-4">

          {/* Back to Discovery — always visible, including on mobile */}
          {onBackToSearch && (
            <BackButton
              label="Back to discovery"
              onClick={onBackToSearch}
              className="mb-3"
            />
          )}
          
          {/* Mobile Read-Only View */}
          {!isMobileSearchExpanded && (
            <div className="md:hidden flex items-center justify-between gap-3">
              <div 
                className="flex-1 flex flex-col cursor-pointer" 
                onClick={() => setIsMobileSearchExpanded(true)}
              >
                <div className="font-bold text-[#333743] text-[15px] flex items-center gap-2">
                  <MapPin size={16} className="text-[#2681ff]" />
                  <span className="truncate">{location}</span>
                </div>
                <div className="text-[#9598a4] text-xs mt-0.5 ml-6 flex items-center gap-1">
                  <span>{dateRange?.from ? format(dateRange.from, "MMM dd") : "Select"}</span>
                  <span>-</span>
                  <span>{dateRange?.to ? format(dateRange.to, "MMM dd") : "Select"}</span>
                  <span>•</span>
                  <span>{totalGuests} Guests, {rooms.length} Room{rooms.length > 1 ? 's' : ''}</span>
                </div>
              </div>
              <button 
                className="text-[#2681ff] font-bold text-sm px-4 py-2 bg-[#f3f5f6] rounded-full shrink-0"
                onClick={() => setIsMobileSearchExpanded(true)}
              >
                Edit
              </button>
            </div>
          )}

          <div className={`${isMobileSearchExpanded ? 'flex' : 'hidden'} md:flex flex-col lg:flex-row gap-4 items-center animate-in fade-in slide-in-from-top-2 duration-200`}>
            
            {/* Location Input */}
            <div
              className={`border rounded-[8px] h-[48px] flex items-center px-4 gap-3 w-full lg:flex-1 cursor-pointer transition-colors ${openDropdown === 'location' ? 'border-[#2681ff] ring-2 ring-[#2681ff]/20 bg-white' : 'border-[#e0e2e8] bg-[#f9fafb] hover:border-[#2681ff]'}`}
              onClick={(e) => handleDropdownToggle('location', e)}
            >
              <MapPin size={16} className="text-[#2681FF] shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">Destination</span>
                <span className="text-[13px] font-semibold text-[#333743] truncate">{location}</span>
              </div>
              <ChevronDown size={14} className="text-[#9598a4] shrink-0" />
            </div>

            {/* Date Picker */}
            <div
              className={`border rounded-[8px] h-[48px] flex items-center px-4 gap-3 w-full lg:flex-1 cursor-pointer transition-colors ${openDropdown === 'date' ? 'border-[#2681ff] ring-2 ring-[#2681ff]/20 bg-white' : 'border-[#e0e2e8] bg-[#f9fafb] hover:border-[#2681ff]'}`}
              onClick={(e) => handleDropdownToggle('date', e)}
            >
              <CalendarIcon size={16} className="text-[#2681FF] shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">Dates</span>
                <span className={`text-[13px] font-semibold truncate ${dateRange?.from ? "text-[#333743]" : "text-[#9598a4] font-normal"}`}>
                  {dateRange?.from
                    ? `${format(dateRange.from, "MMM d")} – ${dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "?"}`
                    : "Add dates"}
                </span>
              </div>
              <ChevronDown size={14} className="text-[#9598a4] shrink-0" />
            </div>

            {/* Guests */}
            <div
              className={`border rounded-[8px] h-[48px] flex items-center px-4 gap-3 w-full lg:flex-1 cursor-pointer transition-colors ${openDropdown === 'guests' ? 'border-[#2681ff] ring-2 ring-[#2681ff]/20 bg-white' : 'border-[#e0e2e8] bg-[#f9fafb] hover:border-[#2681ff]'}`}
              onClick={(e) => handleDropdownToggle('guests', e)}
            >
              <Users size={16} className="text-[#2681FF] shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">Guests & Rooms</span>
                <span className="text-[13px] font-semibold text-[#333743] truncate">
                  {totalGuests} Guest{totalGuests !== 1 ? 's' : ''} · {rooms.length} Room{rooms.length > 1 ? 's' : ''}
                </span>
              </div>
              <ChevronDown size={14} className="text-[#9598a4] shrink-0" />
            </div>

            {/* Search Button */}
            <button 
              className="bg-[#2681ff] hover:bg-[#1a6fd9] text-white font-bold px-8 h-[48px] rounded-[8px] transition-colors w-full lg:w-auto flex items-center justify-center gap-2"
              onClick={() => {
                handleSearch();
                setIsMobileSearchExpanded(false);
              }}
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Filter Bar (Desktop) */}
      <div className="hidden md:block bg-[#f3f5f6] sticky top-0 z-30">
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-3 flex gap-3 overflow-x-auto no-scrollbar items-center">
          
          {/* Sort By */}
           <FilterButton 
             label={`Sort: ${getSortLabel()}`}
             active={openDropdown === 'sort'} 
             hasSelection={sortOption !== 'recommended'}
             onClick={(e) => handleDropdownToggle('sort', e)} 
             icon={<ArrowUpDown size={14} />}
           />

          {/* Board Types Filter */}
          <FilterButton 
            label="Board Type" 
            active={openDropdown === 'board'} 
            hasSelection={selectedBoardTypes.length > 0}
            onClick={(e) => handleDropdownToggle('board', e)} 
          />

           {/* Star Rating Filter */}
           <FilterButton 
            label="Star Rating" 
            active={openDropdown === 'stars'} 
            hasSelection={selectedStars.length > 0}
            onClick={(e) => handleDropdownToggle('stars', e)} 
          />

          {/* Price Filter */}
          <FilterButton 
            label={`Price: $${priceRange[0]} - $${priceRange[1]}`}
            active={openDropdown === 'price'} 
            hasSelection={priceRange[0] > 0 || priceRange[1] < 500}
            onClick={(e) => handleDropdownToggle('price', e)} 
          />

          {/* Amenities Filter */}
          <FilterButton 
            label="Amenities" 
            active={openDropdown === 'amenities'} 
            hasSelection={selectedAmenities.length > 0}
            onClick={(e) => handleDropdownToggle('amenities', e)} 
          />

          {/* Cancellation Policy Filter */}
          <FilterButton 
            label="Cancellation Policy" 
            active={openDropdown === 'cancellation'} 
            hasSelection={selectedCancellation.length > 0}
            onClick={(e) => handleDropdownToggle('cancellation', e)} 
          />

          {(selectedBoardTypes.length > 0 || selectedAmenities.length > 0 || selectedCancellation.length > 0 || selectedStars.length > 0 || priceRange[0] > 0 || priceRange[1] < 500 || sortOption !== 'recommended') && (
            <button 
              onClick={resetFilters}
              className="text-[#2681ff] text-sm font-bold hover:underline ml-3"
            >
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Bar (Sticky Top) */}
      <div className="md:hidden bg-[#f3f5f6] sticky top-0 z-30 px-4 py-3">
        <div className="bg-white border border-[#e0e2e8] rounded-full flex items-center h-[48px] w-full">
           {/* Sort Button */}
           <button 
             className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-bold text-[#333743] active:bg-gray-50 transition-colors first:rounded-l-full"
             onClick={() => setIsMobileSortOpen(true)}
           >
             <ArrowUpDown size={14} />
             Sort
           </button>
           
           <div className="w-[1px] h-6 bg-[#e0e2e8]" />
           
           {/* Filters Button */}
           <button 
             className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-bold text-[#333743] active:bg-gray-50 transition-colors"
             onClick={() => setIsMobileFiltersOpen(true)}
           >
             <SlidersHorizontal size={14} />
             Filters
           </button>

           <div className="w-[1px] h-6 bg-[#e0e2e8]" />

           {/* Map/List Toggle */}
           <button 
             className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-bold text-[#333743] active:bg-gray-50 transition-colors last:rounded-r-full"
             onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
           >
             {mobileView === 'list' ? <MapIcon size={14} /> : <List size={14} />}
             {mobileView === 'list' ? 'Map' : 'List'}
           </button>
        </div>
      </div>

      {/* Main Content Split View */}
      <div className="flex flex-1 max-w-[1920px] mx-auto w-full overflow-hidden relative">
        
        {/* Hotel List */}
        <div className={`w-full md:w-[65%] min-w-0 h-[calc(100vh-130px)] overflow-y-auto p-4 md:p-6 flex flex-col gap-6 ${mobileView === 'map' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h2 className="text-[#333743] font-bold text-[20px]">
                {filteredAndSortedHotels.length} Hotel offer{filteredAndSortedHotels.length !== 1 ? 's' : ''}
                {filteredAndSortedHotels.length === 0 && <span className="font-normal text-sm ml-2 text-gray-500">(Try adjusting your filters)</span>}
              </h2>
            </div>
            
            {/* Loading Bar */}
            {showLoadingBar && (
              <div className={`h-1 w-full bg-gray-200/50 rounded-full overflow-hidden transition-opacity duration-500 ${loadingProgress >= 100 ? 'opacity-0' : 'opacity-100'}`}>
                <div 
                  className="h-full bg-[#2681ff] transition-all duration-75 ease-linear" 
                  style={{ width: `${loadingProgress}%` }} 
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 pb-24 md:pb-10">
            {filteredAndSortedHotels.length > 0 ? (
              filteredAndSortedHotels.map(hotel => {
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
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[16px] border border-dashed border-gray-200">
                <Search size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No hotels found</h3>
                <p className="text-gray-500 mt-2">Try changing your dates or removing some filters.</p>
                <button 
                  className="mt-6 text-[#2681ff] font-bold hover:underline"
                  onClick={resetFilters}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className={`w-full md:w-[35%] min-w-0 h-[calc(100vh-130px)] sticky top-0 bg-[#e0e2e8] relative overflow-hidden ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}>
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.1.0&auto=format&fit=crop&w=1500&q=80" 
            alt="Map"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black/5" />
          
          {/* Map Markers */}
          {filteredAndSortedHotels.map(hotel => (
             <div 
                key={hotel.id}
                onMouseEnter={() => setHoveredHotelId(hotel.id)}
                onMouseLeave={() => setHoveredHotelId(null)}
             >
               <MapMarker 
                 hotel={hotel} 
                 price={calculateDisplayPrice(hotel.price, hotel)} 
                 isHovered={hoveredHotelId === hotel.id}
               />
             </div>
          ))}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-[#333743]">
             <MapIcon size={16} />
             Search this area
          </div>
        </div>

      </div>

      {/* Render Fixed Dropdowns (Desktop) */}
      {renderDropdownContent()}

      {/* Mobile Filters Takeover */}
      {isMobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-[#e0e2e8]">
            <h2 className="text-lg font-bold text-[#333743]">Filters</h2>
            <button 
              className="p-2 hover:bg-[#f3f5f6] rounded-full"
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              <X size={24} className="text-[#333743]" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8 pb-24">
            
            {/* Price */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-[#333743]">Price per night</h3>
               <Slider.Root 
                className="relative flex items-center select-none touch-none w-full h-5" 
                value={priceRange} 
                max={500} 
                step={10}
                onValueChange={setPriceRange}
              >
                <Slider.Track className="bg-[#f3f5f6] relative grow rounded-full h-[6px]">
                  <Slider.Range className="absolute bg-[#2681ff] rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-6 h-6 bg-[#2681ff] shadow-md rounded-full hover:bg-blue-600 focus:outline-none border-[3px] border-white cursor-grab active:cursor-grabbing" />
                <Slider.Thumb className="block w-6 h-6 bg-[#2681ff] shadow-md rounded-full hover:bg-blue-600 focus:outline-none border-[3px] border-white cursor-grab active:cursor-grabbing" />
              </Slider.Root>
              <div className="flex justify-between text-sm font-bold text-[#333743]">
                <div className="px-4 py-2 rounded-[8px] border border-[#e0e2e8]">${priceRange[0]}</div>
                <div className="px-4 py-2 rounded-[8px] border border-[#e0e2e8]">${priceRange[1]}</div>
              </div>
            </div>

            <div className="h-[1px] bg-[#e0e2e8] w-full" />

            {/* Stars */}
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-[#333743]">Star Rating</h3>
              <div className="flex flex-col gap-3">
                {[5, 4, 3, 2, 1].map(star => (
                  <CheckboxRow 
                    key={star} 
                    label={
                      <div className="flex items-center gap-1">
                        {[...Array(star)].map((_, i) => (
                          <Star key={i} size={16} className="fill-[#FFB700] text-[#FFB700]" />
                        ))}
                      </div>
                    }
                    checked={selectedStars.includes(star)} 
                    onChange={() => toggleStar(star)} 
                  />
                ))}
              </div>
            </div>

            <div className="h-[1px] bg-[#e0e2e8] w-full" />

            {/* Board */}
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-[#333743]">Board Type</h3>
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

             <div className="h-[1px] bg-[#e0e2e8] w-full" />

            {/* Amenities */}
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-[#333743]">Amenities</h3>
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

            <div className="h-[1px] bg-[#e0e2e8] w-full" />

            {/* Cancellation */}
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-[#333743]">Cancellation Policy</h3>
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

          <div className="p-4 border-t border-[#e0e2e8] bg-white pb-8">
            <div className="flex gap-4">
              <button 
                className="flex-1 py-3 font-bold text-[#333743] underline"
                onClick={resetFilters}
              >
                Clear all
              </button>
              <button 
                className="flex-[2] bg-[#2681ff] text-white font-bold py-3 rounded-[8px]"
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
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex flex-col justify-end animate-in fade-in duration-200">
           {/* Backdrop click to close */}
           <div className="absolute inset-0" onClick={() => setIsMobileSortOpen(false)} />
           
           <div className="bg-white rounded-t-[20px] p-6 pb-12 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300 z-10">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-[#333743]">Sort by</h3>
                <button 
                  className="p-2 hover:bg-[#f3f5f6] rounded-full"
                  onClick={() => setIsMobileSortOpen(false)}
                >
                  <X size={20} className="text-[#333743]" />
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