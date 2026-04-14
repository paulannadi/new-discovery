import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "../../../shared/components/ui/utils";
import { BackButton } from "../../../shared/components/BackButton";
import AccommodationStar from "../../../shared/components/AccommodationStar";
import RatingBlock from "../../../shared/components/RatingBlock";
import {
  MapPin,
  Wifi,
  Waves,
  Dumbbell,
  Users,
  Share,
  Bed,
  Armchair,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Dog,
  Check,
  CalendarDays,
  Search,
  ArrowRight,
  Info,
  MapPinned,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import LeafletMap from "../../../shared/components/LeafletMap";
import { DayPicker } from "react-day-picker";
import { format, parseISO, addDays } from "date-fns";
import "react-day-picker/dist/style.css";
import { showToast } from "../../../shared/utils/toast";
import { hotelDescription, nearbyPOIs, locationCoords } from "../../../shared/utils/hotelUtils";
import PoliciesSection from "../components/PoliciesSection";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../../shared/components/ui/tooltip";

// --- Types ---

type PricingOption = {
  id: string;
  label: string;
  priceDelta: number; // 0 for base
  subLabel?: string;
};

type Room = {
  id: string;
  name: string;
  image: string;
  details: {
    bedrooms: number;
    sleeps: number;
    bedType: string;
  };
  basePrice: number;
  cancellationPolicies: PricingOption[];
  extras: PricingOption[];
};

type RoomConfig = {
  id: number;
  adults: number;
  children: number;
};

type RoomSelection = {
  room: Room;
  cancelOption: string;
  extraOption: string;
};

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
  coordinates: { x: number; y: number };
};

// --- Mock Data Generators ---

const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1744534637336-6110864236fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBraW5nJTIwYmVkJTIwbW9kZXJufGVufDF8fHx8MTc3MDYzNzcxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1648383228240-6ed939727ad6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjB0d2luJTIwYmVkcyUyMG1vZGVybnxlbnwxfHx8fDE3NzA2Mzc3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1766928210443-0be92ed5884a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBtb2Rlcm4lMjBsdXh1cnklMjBiZWRyb29tfGVufDF8fHx8MTc3MDYzNzcxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBzdWl0ZSUyMGx1eHVyeSUyMGludGVyaW9yfGVufDF8fHx8MTc3MDYzNzcxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1559414059-34fe0a59e57a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBwZW50aG91c2UlMjBzdWl0ZSUyMHZpZXd8ZW58MXx8fHwxNzcwNjM3NzE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBjb3p5fGVufDF8fHx8MTc3MDgwOTk3Mnww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBtb2Rlcm58ZW58MXx8fHwxNzcwODA5OTcyfDA&ixlib=rb-4.1.0&q=80&w=1080"
];

const ROOM_TYPES = [
  { name: "Single Room", sleeps: 1, bed: "1 Single Bed", basePriceFactor: 0.6 },
  { name: "Double Room", sleeps: 2, bed: "1 Queen Bed", basePriceFactor: 0.8 },
  { name: "Deluxe King Room", sleeps: 2, bed: "1 King Bed", basePriceFactor: 1.0 },
  { name: "Twin Room", sleeps: 2, bed: "2 Single Beds", basePriceFactor: 0.85 },
  { name: "Triple Room", sleeps: 3, bed: "1 Queen + 1 Single", basePriceFactor: 1.2 },
  { name: "Family Studio", sleeps: 3, bed: "3 Single Beds", basePriceFactor: 1.3 },
  { name: "Family Suite", sleeps: 4, bed: "1 King + 2 Singles", basePriceFactor: 1.5 },
  { name: "Quadruple Room", sleeps: 4, bed: "2 Queen Beds", basePriceFactor: 1.6 },
  { name: "Penthouse Suite", sleeps: 4, bed: "2 King Beds", basePriceFactor: 2.5 }
];

const BOARD_OPTIONS: PricingOption[] = [
  { id: "room_only", label: "Room only", priceDelta: 0 },
  { id: "breakfast", label: "Breakfast", priceDelta: 15 },
  { id: "half_board", label: "Half board", priceDelta: 45 },
  { id: "full_board", label: "Full board", priceDelta: 80 }
];

const CANCELLATION_OPTIONS: PricingOption[] = [
  { id: "non_refundable", label: "Non-refundable", priceDelta: 0 },
  { id: "free_cancellation", label: "Free cancellation", priceDelta: 25 }
];


// Simple pseudo-random number generator seeded by string
const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
};

const generateRoomsForHotel = (hotel: Hotel, basePrice: number): Room[] => {
  const numRooms = 3 + Math.floor(seededRandom(hotel.id + "count") * 4); // 3 to 6 rooms
  const rooms: Room[] = [];

  for (let i = 0; i < numRooms; i++) {
    const seed = hotel.id + "room" + i;

    // Pick a room type based on seed
    const typeIndex = Math.floor(seededRandom(seed + "type") * ROOM_TYPES.length);
    const roomType = ROOM_TYPES[typeIndex];

    // Pick an image
    const imageIndex = Math.floor(seededRandom(seed + "image") * ROOM_IMAGES.length);
    const image = ROOM_IMAGES[imageIndex];

    // Generate Cancellation Policies based on Hotel Offerings
    const policies: PricingOption[] = [];

    // Always add non-refundable as the base option if applicable
    policies.push(CANCELLATION_OPTIONS[0]); // Non-refundable (cheaper base)

    // If hotel offers free cancellation, add it as an upgrade option
    if (hotel.cancellationPolicy === "Free cancellation") {
       policies.push(CANCELLATION_OPTIONS[1]); // Free cancellation
    }

    // Generate Extras (Board Types) based on Hotel Offerings
    const extras: PricingOption[] = [];

    // Map string board types to PricingOptions
    hotel.boardTypes.forEach(type => {
      if (type === "Room only") extras.push(BOARD_OPTIONS[0]);
      if (type === "Breakfast") extras.push(BOARD_OPTIONS[1]);
      if (type === "Half board") extras.push(BOARD_OPTIONS[2]);
      if (type === "Full board") extras.push(BOARD_OPTIONS[3]);
    });

    // Ensure we have unique options and at least one
    const uniqueExtras = Array.from(new Set(extras.map(e => e.id)))
      .map(id => extras.find(e => e.id === id)!);

    if (uniqueExtras.length === 0) uniqueExtras.push(BOARD_OPTIONS[0]); // Fallback

    rooms.push({
      id: `${hotel.id}_r${i}`,
      name: roomType.name,
      image: image,
      details: {
        bedrooms: roomType.sleeps > 2 ? 2 : 1,
        sleeps: roomType.sleeps,
        bedType: roomType.bed
      },
      basePrice: Math.round(basePrice * roomType.basePriceFactor),
      cancellationPolicies: policies,
      extras: uniqueExtras
    });
  }

  // Sort by price
  return rooms.sort((a, b) => a.basePrice - b.basePrice);
};

// Comprehensive amenities shown in the "See all" modal, grouped by category.
// These are static mock amenities typical of a full-service hotel.
const HOTEL_AMENITY_GROUPS = [
  {
    label: "Pool & Beach",
    items: ["Outdoor pool", "Indoor pool", "Heated pool", "Pool bar", "Private beach access", "Beach towels", "Water sports"],
  },
  {
    label: "Food & Drink",
    items: ["On-site restaurant", "Breakfast included", "Room service (24hr)", "Bar & lounge", "Poolside bar", "Coffee shop", "Minibar"],
  },
  {
    label: "Wellness & Fitness",
    items: ["Full-service spa", "Gym / Fitness centre", "Sauna", "Steam room", "Yoga classes", "Massage treatments"],
  },
  {
    label: "Room",
    items: ["Air conditioning", "Flat-screen TV", "Free WiFi", "In-room safe", "Blackout curtains", "Coffee machine", "Bathtub", "Walk-in shower"],
  },
  {
    label: "Services",
    items: ["24-hr front desk", "Concierge", "Luggage storage", "Laundry service", "Dry cleaning", "Airport shuttle", "Car rental", "Tour desk"],
  },
  {
    label: "Family",
    items: ["Kids' club", "Babysitting", "Children's pool", "Family rooms", "Playground", "High chairs available"],
  },
  {
    label: "Accessibility",
    items: ["Wheelchair accessible", "Elevator / lift", "Accessible bathroom", "Accessible parking"],
  },
  {
    label: "Parking & Transport",
    items: ["Free parking", "Valet parking", "Electric vehicle charging", "Bicycle rental"],
  },
  {
    label: "Other",
    items: ["Pet friendly", "Non-smoking rooms", "Rooftop terrace", "Business centre", "Meeting rooms", "Gift shop", "ATM on-site"],
  },
];

const HOTEL_MOCK_REVIEWS = [
  { score: "8/10", label: "Good",      text: "The staff were friendly and helpful. Great location.",                             date: "Feb 22, 2026" },
  { score: "9/10", label: "Excellent", text: "Amazing pool and beautiful rooms. Highly recommend!",                              date: "Feb 12, 2026" },
  { score: "10/10", label: "Perfect",  text: "Perfect in every way! Will definitely come back.",                                 date: "Jan 26, 2026" },
  { score: "8/10", label: "Good",      text: "Good size room. Nice breakfast.",                                                  date: "Jan 14, 2026" },
];

// --- Utility Functions ---

// Converts a hotel rating (0–10) to a label like "Excellent"
function ratingLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 8.5) return "Outstanding";
  if (score >= 8) return "Excellent";
  if (score >= 7.5) return "Very good";
  return "Good";
}


// --- Components ---

const RoomCard = ({ room, initialBoard, initialCancellation, onSelect, isSelected, nights }: {
  room: Room,
  initialBoard?: string[],
  initialCancellation?: string[],
  onSelect: (cancelOption: string, extraOption: string) => void,
  isSelected: boolean,
  // How many nights the stay covers — used to show the total price
  nights: number
}) => {
  const [selectedCancel, setSelectedCancel] = useState(() => {
    // If filters are passed, try to select the matching one
    if (initialCancellation && initialCancellation.length > 0) {
      // Logic for "Exclude non refundable" - prioritize refundable options
      if (initialCancellation.includes("Exclude non refundable")) {
          // Find the first option that is NOT non-refundable
          const refundable = room.cancellationPolicies.find(p => p.id !== "non_refundable");
          if (refundable) return refundable.id;
      }

      // Standard filter matching
      const matching = room.cancellationPolicies.find(p => initialCancellation.includes(p.label));
      if (matching) return matching.id;
    }
    return room.cancellationPolicies[0].id;
  });

  const [selectedExtra, setSelectedExtra] = useState(() => {
    // If filters are passed, try to select the matching one
    if (initialBoard && initialBoard.length > 0) {
      // Find intersection
      const matching = room.extras.find(p => initialBoard.includes(p.label));
      if (matching) return matching.id;
    }
    return room.extras[0].id;
  });

  const cancelOpt = room.cancellationPolicies.find(o => o.id === selectedCancel) || room.cancellationPolicies[0];
  const extraOpt = room.extras.find(o => o.id === selectedExtra) || room.extras[0];

  const totalPrice = room.basePrice + cancelOpt.priceDelta + extraOpt.priceDelta;

  const handleCancelChange = (optId: string) => {
    setSelectedCancel(optId);
  };

  const handleExtraChange = (optId: string) => {
    setSelectedExtra(optId);
  };

  const handleBookClick = () => {
    onSelect(selectedCancel, selectedExtra);
  };

  return (
    <div className={cn(
      "bg-card rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all border-2",
      isSelected ? "border-foreground shadow-lg" : "border-transparent"
    )}>
      {/* Image Carousel */}
      <div className="h-[200px] relative bg-gray-100 group">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity" />


        {/* Carousel Controls */}
        {/* On mobile (touch screens) buttons are always visible; on desktop they appear on hover */}
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white text-primary"
          aria-hidden="true"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white text-primary"
          aria-hidden="true"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-foreground font-bold text-lg leading-tight mb-3">{room.name}</h3>

        {/* Room Details */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-2 text-foreground">
            <Bed size={16} aria-hidden="true" />
            <span className="text-sm">{room.details.bedrooms} bedroom{room.details.bedrooms > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Users size={16} aria-hidden="true" />
            <span className="text-sm">Sleeps {room.details.sleeps}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Armchair size={16} aria-hidden="true" />
            <span className="text-sm">{room.details.bedType}</span>
          </div>
        </div>

        <hr className="border-border mb-4" />

        {/* Cancellation Policy */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-foreground">Cancellation policy</span>
            <span className="text-xs text-grey">per person, per night</span>
          </div>
          <div className="flex flex-col gap-2">
            {room.cancellationPolicies.map((opt) => (
              <label key={opt.id} className="flex items-center justify-between cursor-pointer group" onClick={() => handleCancelChange(opt.id)}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    selectedCancel === opt.id ? "border-primary" : "border-border"
                  )}>
                    {selectedCancel === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-xs text-foreground">{opt.label}</span>
                </div>
                {opt.priceDelta > 0 && <span className="text-xs text-foreground">+ {opt.priceDelta}€</span>}
              </label>
            ))}
          </div>
        </div>

        <hr className="border-border mb-4" />

        {/* Extras */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-foreground">Extras</span>
            <span className="text-xs text-grey">per person, per night</span>
          </div>
          <div className="flex flex-col gap-2">
            {room.extras.map((opt) => (
              <label key={opt.id} className="flex items-center justify-between cursor-pointer group" onClick={() => handleExtraChange(opt.id)}>
                <div className="flex items-center gap-2">
                   <div className={cn(
                     "w-4 h-4 rounded-full border flex items-center justify-center",
                     selectedExtra === opt.id ? "border-primary" : "border-border"
                   )}>
                    {selectedExtra === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-xs text-foreground">{opt.label}</span>
                </div>
                {opt.priceDelta > 0 && <span className="text-xs text-foreground">+ {opt.priceDelta}€</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-muted flex flex-col gap-2">
          <div className="text-right text-xs text-grey">{totalPrice}€ per person, per night</div>
          {/* Total for the full stay — calculated as per-night price × number of nights */}
          <div className="text-right text-sm font-bold text-foreground">
            Total for {nights} night{nights !== 1 ? 's' : ''}: {totalPrice * nights}€
          </div>
          {/* default = main action, secondary = already-selected confirmation state */}
          <Button
            onClick={handleBookClick}
            variant={isSelected ? "secondary" : "default"}
            className="w-full"
          >
            {isSelected && <Check size={16} />}
            {isSelected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function HotelDetailPage({
  onBack,
  onBook,
  hotel,
  initialFilters,
  roomConfiguration = [{ id: 1, adults: 2, children: 0 }],
  initialCheckIn,
  initialCheckOut
}: {
  onBack: () => void,
  // Called when the user has selected a room for every guest configuration
  // and clicks the final "Book" button. App.tsx uses this to navigate to SmartPlanner.
  onBook: (hotel: Hotel, roomSelections: {[key: number]: RoomSelection | null}) => void,
  hotel: Hotel | null,
  initialFilters?: { board: string[], cancellation: string[] },
  roomConfiguration?: RoomConfig[],
  // Pre-fill check-in and check-out dates from the hotel search (ISO strings, e.g. "2026-04-10")
  initialCheckIn?: string,
  initialCheckOut?: string
}) {
  if (!hotel) return <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <h1 className="text-xl font-bold">Hotel not found</h1>
    <BackButton label="Back to all hotels" onClick={onBack} />
  </div>;

  // Memoize rooms generation so it doesn't change on re-renders unless hotel changes
  const rooms = useMemo(() => {
    return generateRoomsForHotel(hotel, hotel.price);
  }, [hotel, hotel.price]);

  // Track selections for each room configuration
  const [roomSelections, setRoomSelections] = useState<{[roomConfigId: number]: RoomSelection | null}>(() => {
    const initial: {[key: number]: RoomSelection | null} = {};
    roomConfiguration.forEach(config => {
      initial[config.id] = null;
    });
    return initial;
  });

  // Track active tab for multi-room flow
  const [activeRoomTab, setActiveRoomTab] = useState(roomConfiguration[0]?.id || 1);

  // Search criteria state — pre-filled from props if the parent page passed them in
  const [searchDates, setSearchDates] = useState({
    checkIn: initialCheckIn || '',
    checkOut: initialCheckOut || '',
  });

  // Controls the brief "Searching..." loading state when the user hits Update Search
  const [isSearching, setIsSearching] = useState(false);

  // Local copy of the room config — the user can edit adults/children/rooms in the
  // Guests & Rooms dropdown without it immediately affecting the room grid.
  // Changes only take effect when they hit "Update Search".
  const [localRoomConfig, setLocalRoomConfig] = useState<RoomConfig[]>(roomConfiguration);

  // Derived: how many nights between check-in and check-out (fallback 7 if dates not set)
  const nights =
    searchDates.checkIn && searchDates.checkOut
      ? Math.max(1, Math.round(
          (parseISO(searchDates.checkOut).getTime() - parseISO(searchDates.checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
        ))
      : 7;

  // Controls the "All reviews" modal
  const [reviewsOpen, setReviewsOpen] = useState(false);

  // Controls the "All photos" modal
  const [photosOpen, setPhotosOpen] = useState(false);

  // Controls the "Read more about the hotel" description modal
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  // Controls the "See all amenities" modal
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);

  // Controls the "Show on map" modal
  const [showMapModal, setShowMapModal] = useState(false);

  // Hotel description text and nearby POIs — derived from the hotel's location
  // useMemo means these only recalculate when the hotel changes, not on every render
  const desc = useMemo(() => hotelDescription(hotel.name, hotel.location), [hotel.name, hotel.location]);
  const pois = useMemo(() => nearbyPOIs(hotel.location), [hotel.location]);
  const coords = useMemo(() => locationCoords(hotel.location), [hotel.location]);

  // Tracks which panel popup is open — "checkIn", "checkOut", "guests", or null (closed)
  const [openSearchPanel, setOpenSearchPanel] = useState<"checkIn" | "checkOut" | "guests" | null>(null);

  // Ref on the search bar so we can close any open panel when the user clicks outside
  const searchBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setOpenSearchPanel(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use localRoomConfig so that after the user edits guests and hits Update Search,
  // all-rooms-selected checks against the new configuration.
  const allRoomsSelected = localRoomConfig.every(config => roomSelections[config.id] != null);
  const someRoomsSelected = Object.values(roomSelections).some(sel => sel !== null);

  // Fire a success toast (top-right, matching real TripBuilder style)
  // whenever all rooms become selected.
  useEffect(() => {
    if (allRoomsSelected) {
      showToast.success("All rooms selected — ready to complete your booking!");
    }
  }, [allRoomsSelected]);

  // Helper to get total guest count for a room config
  const getTotalGuests = (config: RoomConfig) => config.adults + config.children;

  // Filter rooms by capacity for a specific room configuration
  const getAvailableRoomsForConfig = (config: RoomConfig) => {
    const totalGuests = getTotalGuests(config);
    return rooms.filter(room => room.details.sleeps >= totalGuests);
  };

  // Handle room selection
  const handleRoomSelect = (roomConfigId: number, room: Room, cancelOption: string, extraOption: string) => {
    setRoomSelections(prev => ({
      ...prev,
      [roomConfigId]: { room, cancelOption, extraOption }
    }));

    // Auto-advance to the next room tab (stay on current if it's the last one)
    const currentIndex = localRoomConfig.findIndex(c => c.id === roomConfigId);
    if (currentIndex < localRoomConfig.length - 1) {
      setActiveRoomTab(localRoomConfig[currentIndex + 1].id);
    }

  };

  // Calculate total price for all selected rooms
  const calculateTotalPrice = () => {
    let total = 0;
    Object.values(roomSelections).forEach(selection => {
      if (selection) {
        const cancelOpt = selection.room.cancellationPolicies.find(o => o.id === selection.cancelOption);
        const extraOpt = selection.room.extras.find(o => o.id === selection.extraOption);
        total += selection.room.basePrice + (cancelOpt?.priceDelta || 0) + (extraOpt?.priceDelta || 0);
      }
    });
    return total;
  };

  const totalPrice = calculateTotalPrice();

  // Triggered when user clicks "Update Search" in the search bar.
  // Resets all selected rooms and briefly shows a loading state to simulate fetching new prices.
  const handleSearchUpdate = () => {
    setIsSearching(true);
    setOpenSearchPanel(null);
    // Rebuild roomSelections from the (possibly updated) localRoomConfig
    const reset: {[key: number]: RoomSelection | null} = {};
    localRoomConfig.forEach(config => { reset[config.id] = null; });
    setRoomSelections(reset);
    // Reset active tab to first room
    setActiveRoomTab(localRoomConfig[0]?.id || 1);
    // After 700ms, hide the loading state and show the room grid again
    setTimeout(() => setIsSearching(false), 700);
  };

  const handleCompleteBooking = () => {
    if (allRoomsSelected) {
      showToast.success(`Booking confirmed for ${roomConfiguration.length} room(s) - Total: ${totalPrice}€`);
      // Navigate to SmartPlanner — App.tsx handles the actual page switch
      onBook(hotel, roomSelections);
    } else {
      showToast.error(`Please select a room for each guest configuration`);
    }
  };

  return (
    <div className="bg-grey-lightest min-h-screen">


      {/* ── WHITE INFO CARD — structure matches PackageDetailPage ────────── */}
      <div className="bg-card">
        <div className="max-w-[1280px] mx-auto">

          {/* Back button — own container with responsive horizontal padding */}
          <div className="px-4 sm:px-6 md:px-10 pt-5 pb-5">
            <BackButton label="Back to all hotels" onClick={onBack} />
          </div>

          {/* ── HERO GALLERY ─────────────────────────────────────────────────
              Inset with mx-4 sm:mx-6 md:mx-10 so gallery edges align with the
              info row padding below — matches PackageDetailPage exactly.
              Grid switches to [3fr_2fr] at md breakpoint (same as reference).
          ─────────────────────────────────────────────────────────────────── */}
          {/* The `relative` wrapper lets us absolutely-position the "See all photos"
              button in the bottom-right corner, exactly like PackageDetailPage does. */}
          <div className="relative mx-4 sm:mx-6 md:mx-10">
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] h-[280px] md:h-[402px] gap-2">
              {/* Left: Main hero image — clicking it also opens the photos modal */}
              <div
                className="relative overflow-hidden rounded-xl group cursor-pointer"
                onClick={() => setPhotosOpen(true)}
              >
                <img
                  src={hotel.image}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  alt="Exterior"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Right: 2×2 thumbnail grid — 4 hotel photos, no map here.
                  Each thumbnail is also clickable to open the photos modal. */}
              <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
                <div
                  className="overflow-hidden rounded-xl cursor-pointer group"
                  onClick={() => setPhotosOpen(true)}
                >
                  <img
                    src="https://images.unsplash.com/photo-1763207291832-819499e261dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc3RhdXJhbnQlMjBicmVha2Zhc3QlMjBidWZmZXR8ZW58MXx8fHwxNzY5NzgxMzM2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    alt="Breakfast"
                  />
                </div>
                <div
                  className="overflow-hidden rounded-xl cursor-pointer group"
                  onClick={() => setPhotosOpen(true)}
                >
                  <img
                    src="https://images.unsplash.com/photo-1729605411476-defbdab14c54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGJhbGklMjBwb29sJTIwaW5maW5pdHl8ZW58MXx8fHwxNzY5NzgxMzM2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    alt="Pool"
                  />
                </div>
                {/* Slot 3 — room interior (was map, now a real hotel photo) */}
                <div
                  className="overflow-hidden rounded-xl cursor-pointer group"
                  onClick={() => setPhotosOpen(true)}
                >
                  <img
                    src={ROOM_IMAGES[0]}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    alt="Room"
                  />
                </div>
                {/* Slot 4 — another hotel photo (was an empty grey filler) */}
                <div
                  className="overflow-hidden rounded-xl cursor-pointer group"
                  onClick={() => setPhotosOpen(true)}
                >
                  <img
                    src={ROOM_IMAGES[1]}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    alt="Lounge"
                  />
                </div>
              </div>
            </div>

            {/* "See all photos" button — overlaid at the bottom-right of the grid.
                Uses the secondary Button variant matching PackageDetailPage's pattern. */}
            <Button
              variant="secondary"
              onClick={() => setPhotosOpen(true)}
              className="absolute bottom-4 right-4"
            >
              ⊞ See all photos
            </Button>
          </div>

          {/* ── HOTEL INFO + ACTION ROW ───────────────────────────────────────
              Two-column grid matching PackageDetailPage:
              Left col (flex-1): identity — rating, name, location, amenities
              Right col (auto): share + book actions aligned to the right on lg+
              Horizontal padding matches the back button and gallery above.
          ─────────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 lg:gap-12 px-4 sm:px-6 md:px-10 py-5 md:py-8">

            {/* LEFT: Hotel identity */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                {/* Rating badge row — RatingBlock on the left, "X reviews" link on the right.
                    Clicking the link opens the full reviews modal (same pattern as PackageDetailPage). */}
                <div className="flex items-center gap-2 flex-wrap">
                  <RatingBlock reviewScore={hotel.rating} reviewCount={hotel.reviewCount} />
                  {/* link variant = navigation/browse action, no bg, underline on hover */}
                  <Button
                    variant="link"
                    onClick={() => setReviewsOpen(true)}
                    className="text-sm text-foreground h-auto p-0"
                  >
                    {hotel.reviewCount.toLocaleString()} reviews
                  </Button>
                </div>

                {/* Hotel name + stars */}
                <div className="flex items-start gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-[1.1] tracking-tight">{hotel.name}</h1>
                  <AccommodationStar
                    rating={hotel.stars}
                    offerName={hotel.name}
                    offerId={hotel.id}
                    size={16}
                  />
                </div>
              </div>

              {/* Address + "Show on map" link — same row, same pattern as PackageDetailPage */}
              <div className="flex items-center gap-4 text-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <MapPin size={15} className="shrink-0" aria-hidden="true" />
                  <span className="text-base">{hotel.location}</span>
                </div>
                {/* link variant = navigation action */}
                <Button
                  variant="link"
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary h-auto p-0"
                >
                  <MapPinned size={14} aria-hidden="true" />
                  Show on map
                </Button>
              </div>

              {/* Amenities heading */}
              <h3 className="text-lg font-bold text-foreground">Hotel amenities and facilities</h3>

              {/* Amenities list — 16px text, always followed by a "See all" link */}
              <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 items-center">
                {hotel.amenities.slice(0, 4).map((amenity, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {amenity === "Pet friendly" && <Dog size={16} className="text-foreground" aria-hidden="true" />}
                    {amenity === "Free Wifi" && <Wifi size={16} className="text-foreground" aria-hidden="true" />}
                    {amenity === "Indoor pool" && <Waves size={16} className="text-foreground" aria-hidden="true" />}
                    {amenity === "Gym" && <Dumbbell size={16} className="text-foreground" aria-hidden="true" />}
                    {["Pet friendly", "Free Wifi", "Indoor pool", "Gym"].indexOf(amenity) === -1 && <Check size={16} className="text-foreground" aria-hidden="true" />}
                    <span className="text-base text-foreground font-medium">{amenity}</span>
                  </div>
                ))}
                {/* link variant = browse action ("Go to all [items]" pattern) */}
                <Button
                  variant="link"
                  onClick={() => setAmenitiesOpen(true)}
                  className="text-primary font-bold text-base h-auto p-0"
                >
                  See all
                </Button>
              </div>
            </div>

            {/* RIGHT: Share + Book actions */}
            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex items-center gap-3">
                {/* ghost + icon size = contextual icon-only action; border keeps it visually grounded next to the primary CTA */}
                <Button variant="ghost" size="icon" className="border border-border" aria-label="Share">
                  <Share size={20} aria-hidden="true" />
                </Button>
                {/* default = the main action on this screen (scroll to room selection or confirm booking) */}
                <Button
                  variant="default"
                  className="px-6 py-4 text-base font-bold"
                  onClick={() => {
                    if (!allRoomsSelected) {
                      document.getElementById('room-selection')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {allRoomsSelected
                    ? `Book for ${totalPrice * nights}€`
                    : localRoomConfig.length > 1 ? 'Select rooms' : 'Select room'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Select Rooms Section - Grey Background */}
        <div id="room-selection" className="w-full max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 pt-[40px] flex flex-col gap-6">
          <h2 className="font-extrabold text-foreground text-2xl">Select rooms</h2>

          {/* ── Inline Search Bar ──────────────────────────────────────────────
              Each field uses the same individual bordered card style as
              PackageSearchForm — separate rounded boxes, blue icons, a small
              uppercase label, and a value line — rather than one merged bar.
              Clicking a date field opens a DayPicker popup (same as the main
              search form). The Guests field is display-only since room config
              comes from the previous search.
          ─────────────────────────────────────────────────────────────────── */}
          <div ref={searchBarRef} className="flex flex-col lg:flex-row gap-3 w-full">

            {/* ── Check-in field ── */}
            <div className="relative flex-1">
              {/* Clickable field box — active state adds a blue ring, matching PackageSearchForm's fieldBase() */}
              <div
                className={cn(
                  "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors cursor-pointer",
                  openSearchPanel === "checkIn"
                    ? "border-primary ring-2 ring-primary/20 bg-white"
                    : "border-border bg-white hover:border-primary"
                )}
                onClick={() => setOpenSearchPanel(openSearchPanel === "checkIn" ? null : "checkIn")}
              >
                <CalendarDays size={16} className="text-primary shrink-0" aria-hidden="true" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Check-in</span>
                  {/* format() converts the ISO string ("2026-04-10") to "Apr 10, 2026" */}
                  <span className={cn(
                    "text-sm font-semibold truncate",
                    searchDates.checkIn ? "text-foreground" : "text-grey font-normal"
                  )}>
                    {searchDates.checkIn ? format(parseISO(searchDates.checkIn), "MMM d, yyyy") : "Add date"}
                  </span>
                </div>
                <ChevronDown size={14} className="text-grey shrink-0" aria-hidden="true" />
              </div>

              {/* DayPicker popup — same pattern as PackageSearchForm's dates panel */}
              {/* max-w-[calc(100vw-2rem)] prevents the calendar from overflowing the viewport on small phones */}
              {openSearchPanel === "checkIn" && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-xl shadow-2xl border border-border p-4 animate-in fade-in zoom-in-95 duration-150 max-w-[calc(100vw-2rem)] overflow-x-auto">
                  <style>{`.rdp-root { --rdp-accent-color: #2681FF; --rdp-accent-background-color: rgba(38,129,255,0.10); --rdp-day_button-border-radius: 8px; margin: 0; }`}</style>
                  <DayPicker
                    mode="single"
                    selected={searchDates.checkIn ? parseISO(searchDates.checkIn) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      // Store back as ISO string to match existing state shape
                      setSearchDates(prev => ({ ...prev, checkIn: format(date, "yyyy-MM-dd") }));
                      // Auto-advance to check-out so the user flows naturally through both fields
                      setOpenSearchPanel("checkOut");
                    }}
                    disabled={{ before: new Date() }}
                  />
                </div>
              )}
            </div>

            {/* ── Check-out field ── */}
            <div className="relative flex-1">
              <div
                className={cn(
                  "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors cursor-pointer",
                  openSearchPanel === "checkOut"
                    ? "border-primary ring-2 ring-primary/20 bg-white"
                    : "border-border bg-white hover:border-primary"
                )}
                onClick={() => setOpenSearchPanel(openSearchPanel === "checkOut" ? null : "checkOut")}
              >
                <CalendarDays size={16} className="text-primary shrink-0" aria-hidden="true" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Check-out</span>
                  <span className={cn(
                    "text-sm font-semibold truncate",
                    searchDates.checkOut ? "text-foreground" : "text-grey font-normal"
                  )}>
                    {searchDates.checkOut ? format(parseISO(searchDates.checkOut), "MMM d, yyyy") : "Add date"}
                  </span>
                </div>
                <ChevronDown size={14} className="text-grey shrink-0" aria-hidden="true" />
              </div>

              {openSearchPanel === "checkOut" && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-xl shadow-2xl border border-border p-4 animate-in fade-in zoom-in-95 duration-150 max-w-[calc(100vw-2rem)] overflow-x-auto">
                  <style>{`.rdp-root { --rdp-accent-color: #2681FF; --rdp-accent-background-color: rgba(38,129,255,0.10); --rdp-day_button-border-radius: 8px; margin: 0; }`}</style>
                  <DayPicker
                    mode="single"
                    selected={searchDates.checkOut ? parseISO(searchDates.checkOut) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      setSearchDates(prev => ({ ...prev, checkOut: format(date, "yyyy-MM-dd") }));
                      // Close panel once check-out is picked — both dates are now set
                      setOpenSearchPanel(null);
                    }}
                    // Must be at least 1 night after check-in
                    disabled={{ before: searchDates.checkIn ? addDays(parseISO(searchDates.checkIn), 1) : new Date() }}
                  />
                </div>
              )}
            </div>

            {/* ── Guests & Rooms — clickable, opens a dropdown to edit travellers and rooms ── */}
            <div className="relative flex-1">
              <div
                className={cn(
                  "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors cursor-pointer",
                  openSearchPanel === "guests"
                    ? "border-primary ring-2 ring-primary/20 bg-white"
                    : "border-border bg-white hover:border-primary"
                )}
                onClick={() => setOpenSearchPanel(openSearchPanel === "guests" ? null : "guests")}
              >
                <Users size={16} className="text-primary shrink-0" aria-hidden="true" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Guests & Rooms</span>
                  <span className="text-sm font-semibold text-foreground truncate">
                    {localRoomConfig.reduce((sum, r) => sum + r.adults, 0)} Adult{localRoomConfig.reduce((sum, r) => sum + r.adults, 0) !== 1 ? 's' : ''}
                    {localRoomConfig.reduce((sum, r) => sum + r.children, 0) > 0 &&
                      ` · ${localRoomConfig.reduce((sum, r) => sum + r.children, 0)} Child${localRoomConfig.reduce((sum, r) => sum + r.children, 0) !== 1 ? 'ren' : ''}`
                    }
                    {' · '}{localRoomConfig.length} Room{localRoomConfig.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ChevronDown size={14} className="text-grey shrink-0" aria-hidden="true" />
              </div>

              {/* Guests dropdown panel — w-full on mobile so it doesn't overflow; capped at 300px on larger screens */}
              {openSearchPanel === "guests" && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-xl shadow-2xl border border-border p-4 w-full sm:w-[300px] max-w-[calc(100vw-2rem)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                  {localRoomConfig.map((config, index) => (
                    <div key={config.id} className="flex flex-col gap-3">
                      {/* Room header row */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">Room {index + 1}</span>
                        {/* Remove button — only shown when there's more than 1 room */}
                        {/* ghost variant + text-danger = low-emphasis destructive action; also fixes the hardcoded text-red-500 to the design token */}
                        {localRoomConfig.length > 1 && (
                          <Button
                            variant="ghost"
                            onClick={() => setLocalRoomConfig(prev => prev.filter(r => r.id !== config.id))}
                            className="text-xs text-danger font-bold h-auto p-0 hover:bg-transparent hover:underline"
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Adults counter */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-foreground">Adults</div>
                          <div className="text-xs text-grey">Age 18+</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setLocalRoomConfig(prev => prev.map(r =>
                              r.id === config.id ? { ...r, adults: Math.max(1, r.adults - 1) } : r
                            ))}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground font-bold text-base hover:border-primary hover:text-primary disabled:opacity-30"
                            disabled={config.adults <= 1}
                          >−</button>
                          <span className="text-sm font-bold text-foreground w-4 text-center">{config.adults}</span>
                          <button
                            onClick={() => setLocalRoomConfig(prev => prev.map(r =>
                              r.id === config.id ? { ...r, adults: Math.min(6, r.adults + 1) } : r
                            ))}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground font-bold text-base hover:border-primary hover:text-primary disabled:opacity-30"
                            disabled={config.adults >= 6}
                          >+</button>
                        </div>
                      </div>

                      {/* Children counter */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-foreground">Children</div>
                          <div className="text-xs text-grey">Age 2–17</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setLocalRoomConfig(prev => prev.map(r =>
                              r.id === config.id ? { ...r, children: Math.max(0, r.children - 1) } : r
                            ))}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground font-bold text-base hover:border-primary hover:text-primary disabled:opacity-30"
                            disabled={config.children <= 0}
                          >−</button>
                          <span className="text-sm font-bold text-foreground w-4 text-center">{config.children}</span>
                          <button
                            onClick={() => setLocalRoomConfig(prev => prev.map(r =>
                              r.id === config.id ? { ...r, children: Math.min(6, r.children + 1) } : r
                            ))}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground font-bold text-base hover:border-primary hover:text-primary disabled:opacity-30"
                            disabled={config.children >= 6}
                          >+</button>
                        </div>
                      </div>

                      {/* Divider between rooms */}
                      {index < localRoomConfig.length - 1 && (
                        <div className="border-t border-muted" />
                      )}
                    </div>
                  ))}

                  {/* Add room button — max 6 rooms */}
                  {/* outline variant = low-emphasis addition action; dashed border signals "add" affordance */}
                  {localRoomConfig.length < 6 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newId = Math.max(...localRoomConfig.map(r => r.id)) + 1;
                        setLocalRoomConfig(prev => [...prev, { id: newId, adults: 2, children: 0 }]);
                      }}
                      className="w-full h-[36px] border-dashed border-primary text-primary hover:bg-primary/10"
                    >
                      + Add another room
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* ── Update Search button — matches PackageSearchForm's search button style ── */}
            {/* default variant = main search action; w-full on mobile, auto-width on large screens */}
            <Button
              variant="default"
              onClick={() => { setOpenSearchPanel(null); handleSearchUpdate(); }}
              className="w-full lg:w-auto shrink-0 h-[48px] px-5 whitespace-nowrap"
            >
              <Search size={16} aria-hidden="true" />
              {isSearching ? 'Searching...' : 'Update Search'}
            </Button>
          </div>

          {/* Tabs for Multiple Rooms */}
          {localRoomConfig.length > 1 ? (
            <>
              {/* Tab Navigation */}
              <div className="sticky top-0 z-40 bg-grey-lightest flex items-center -mx-1 px-1 pt-2 border-b border-border overflow-x-auto whitespace-nowrap">
                {localRoomConfig.map((config, index) => {
                  const selectedRoom = roomSelections[config.id];
                  const isActive = activeRoomTab === config.id;
                  // A tab is disabled if any previous room hasn't been selected yet
                  const isDisabled = localRoomConfig.slice(0, index).some(prev => !roomSelections[prev.id]);

                  return (
                    <button
                      key={config.id}
                      onClick={() => !isDisabled && setActiveRoomTab(config.id)}
                      disabled={isDisabled}
                      className={cn(
                        "flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors relative",
                        isDisabled
                          ? "border-transparent text-grey cursor-not-allowed"
                          : isActive
                            ? "border-primary text-primary"
                            : "border-transparent text-foreground hover:text-foreground hover:border-primary"
                      )}
                    >
                      <span>Room {index + 1}</span>
                      <div className="flex items-center gap-1 text-xs font-normal">
                        <Users size={14} aria-hidden="true" />
                        <span>{config.adults + config.children}</span>
                      </div>
                      {selectedRoom && (
                        <div className="absolute top-0 right-0 bg-foreground rounded-full p-0.5">
                          <Check size={12} className="text-white" aria-hidden="true" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Content */}
              {localRoomConfig.map((config) => {
                if (activeRoomTab !== config.id) return null;

                const availableRooms = getAvailableRoomsForConfig(config);
                const selectedRoom = roomSelections[config.id];

                return (
                  <div key={config.id} className="flex flex-col gap-6">
                    {isSearching ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(n => (
                          <div key={n} className="bg-card rounded-xl border-2 border-border h-[420px] animate-pulse" />
                        ))}
                      </div>
                    ) : availableRooms.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableRooms.map(room => (
                          <RoomCard
                            key={room.id}
                            room={room}
                            nights={nights}
                            initialBoard={initialFilters?.board}
                            initialCancellation={initialFilters?.cancellation}
                            onSelect={(cancelOption, extraOption) => handleRoomSelect(config.id, room, cancelOption, extraOption)}
                            isSelected={selectedRoom?.room.id === room.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                        <p className="text-yellow-900 font-bold text-sm">
                          No rooms available for {getTotalGuests(config)} guest{getTotalGuests(config) > 1 ? 's' : ''}
                        </p>
                        <p className="text-yellow-700 text-xs mt-2">
                          Please try adjusting your guest configuration on the search page.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            /* Single Room - No Tabs */
            <>
              {localRoomConfig.map((config) => {
                const availableRooms = getAvailableRoomsForConfig(config);
                const selectedRoom = roomSelections[config.id];

                return (
                  <div key={config.id} className="flex flex-col gap-6">
                    {isSearching ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(n => (
                          <div key={n} className="bg-card rounded-xl border-2 border-border h-[420px] animate-pulse" />
                        ))}
                      </div>
                    ) : availableRooms.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableRooms.map(room => (
                          <RoomCard
                            key={room.id}
                            room={room}
                            nights={nights}
                            initialBoard={initialFilters?.board}
                            initialCancellation={initialFilters?.cancellation}
                            onSelect={(cancelOption, extraOption) => handleRoomSelect(config.id, room, cancelOption, extraOption)}
                            isSelected={selectedRoom?.room.id === room.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                        <p className="text-yellow-900 font-bold text-sm">
                          No rooms available for {getTotalGuests(config)} guest{getTotalGuests(config) > 1 ? 's' : ''}
                        </p>
                        <p className="text-yellow-700 text-xs mt-2">
                          Please try adjusting your guest configuration on the search page.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
      </div>

      {/* ── HOTEL INFORMATION SECTION ──────────────────────────────────────────
          Two-column layout adapted from PackageDetailPage:
          LEFT  — "About the hotel" description + highlight pills
          RIGHT — Location map image + "Getting around" POI pills
          This section sits above Policies, which is the operational info block.
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 pt-8 pb-2 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-foreground">Hotel information</h2>

        {/* One big card wrapping both columns — same outer treatment as PoliciesSection */}
        <div className="bg-card rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── LEFT: About tile + Highlights ────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* About the hotel — styled exactly like a policy card (same border, padding,
                radius) and fixed to h-[200px] to match the map height on the right.
                Text overflows hidden; "Read more" at the bottom opens the full modal. */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-border h-[200px] overflow-hidden">
              <div className="flex items-center gap-2 text-foreground">
                <Info size={18} className="shrink-0" aria-hidden="true" />
                <span className="font-bold text-sm">About the hotel</span>
              </div>
              <p className="text-sm text-foreground leading-normal flex-1 overflow-hidden">
                {desc.short} {desc.long}
              </p>
              {/* link variant = navigation/expand action */}
              <Button
                variant="link"
                onClick={() => setDescriptionOpen(true)}
                className="text-xs font-semibold h-auto p-0 self-start shrink-0"
              >
                Read more about the hotel
              </Button>
            </div>

            {/* Highlights — amenity pills, no divider needed */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {(hotel.amenities.length > 0
                  ? hotel.amenities.slice(0, 6)
                  : ["Beachfront", "Outdoor pool", "Spa", "All-day dining", "Free WiFi", "Kids club"]
                ).map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3.5 py-2"
                  >
                    {amenity === "Free Wifi" || amenity === "Free WiFi"
                      ? <Wifi size={14} className="text-primary shrink-0" aria-hidden="true" />
                      : amenity === "Indoor pool" || amenity === "Outdoor pool" || amenity === "Beachfront"
                      ? <Waves size={14} className="text-primary shrink-0" aria-hidden="true" />
                      : amenity === "Gym"
                      ? <Dumbbell size={14} className="text-primary shrink-0" aria-hidden="true" />
                      : <Check size={14} className="text-primary shrink-0" aria-hidden="true" />
                    }
                    <span className="text-sm text-foreground font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Map + Getting around ──────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Interactive map — h-[200px] matches the About tile height on the left */}
            <div className="rounded-xl overflow-hidden h-[200px] relative border border-border">
              <LeafletMap
                center={coords}
                zoom={13}
                markers={[{ id: hotel.id, lat: coords[0], lng: coords[1], label: hotel.name }]}
                className="w-full h-full"
              />
              {/* ghost + sm = contextual overlay action; custom bg/backdrop keeps it legible over the map */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMapModal(true)}
                className="absolute top-2 right-2 z-[400] bg-card/95 backdrop-blur-sm shadow-sm text-primary hover:bg-card"
              >
                <MapPinned size={12} aria-hidden="true" />
                Show on map
              </Button>
            </div>

            {/* Getting around — no divider needed */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">Getting around</h3>
              <div className="flex flex-wrap gap-2">
                {pois.map((poi) => (
                  <span
                    key={poi.label}
                    className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3.5 py-2 text-sm"
                  >
                    <MapPin size={12} className="text-primary shrink-0" aria-hidden="true" />
                    <span className="font-medium text-foreground">{poi.label}</span>
                    <span className="text-grey">· {poi.distance}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
        </div>
      </div>

      {/* Hotel Policies Section — renamed from "Hotel information" to "Policies" */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 py-5 md:py-8 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-foreground">Policies</h2>

        <PoliciesSection />
      </div>

      {/* Guest Reviews Section */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 py-5 md:py-8 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-foreground">Guest Reviews</h2>

        <div className="bg-card rounded-xl shadow-md flex flex-col md:flex-row gap-5 md:gap-10 p-4 md:py-6 md:pl-6 md:pr-0">

          {/* Left column — score + label + review count. Row on mobile, column on desktop. */}
          <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1 md:shrink-0 md:w-[100px]">
            <RatingBlock reviewScore={hotel.rating} reviewCount={hotel.reviewCount} />
            {/* link variant = browse action */}
            <Button variant="link" onClick={() => setReviewsOpen(true)} className="text-xs text-foreground h-auto p-0 text-left mt-1 justify-start">
              See all verified reviews
            </Button>
          </div>

          {/* Right column — scrollable cards + "See all" link */}
          <div className="flex flex-col gap-6 flex-1 min-w-0 overflow-hidden">
            {/* Cards scroll horizontally. w-[78vw] on mobile makes each card take most of the screen
                so it's obvious there are more cards to scroll to. */}
            <div className="flex flex-row gap-4 overflow-x-auto pb-1 pr-6" style={{ scrollbarWidth: "none" }}>
              {HOTEL_MOCK_REVIEWS.map((review, i) => (
                <div
                  key={i}
                  className="flex flex-col border border-border rounded-xl p-4 shrink-0 w-[78vw] sm:w-[280px] md:w-[295px] h-[210px] sm:h-[230px]"
                >
                  <div className="text-base font-bold text-foreground mb-2">
                    {review.score} {review.label}
                  </div>
                  <p className="text-base text-foreground leading-normal flex-1 overflow-hidden">
                    {review.text}
                  </p>
                  {/* link variant = navigation action */}
                  <Button variant="link" className="text-xs font-bold h-auto p-0 text-left mt-2 mb-1 justify-start">
                    See details
                  </Button>
                  <div className="text-base text-foreground">{review.date}</div>
                  <div className="text-xs text-grey">Verified review</div>
                </div>
              ))}
            </div>

            {/* Same modal as the link next to the score — consistent entry point */}
            {/* link variant = browse action ("Go to all [items]" pattern) */}
            <Button
              variant="link"
              onClick={() => setReviewsOpen(true)}
              className="text-base font-bold h-auto p-0 justify-start"
            >
              See all {hotel.reviewCount.toLocaleString()} reviews
            </Button>
          </div>

        </div>
      </div>

      {/* All-rooms-done banner — fades in above the sticky bar.
          Matches the real TripBuilder Alert component structure:
          grid layout with icon column + text column, same color token pattern. */}

      {/* Sticky Booking Bar */}
      {someRoomsSelected && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
          <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-[60px] py-3 md:py-4">

            {/* Mobile layout: compact room pills + price/button row */}
            <div className="flex flex-col gap-2 sm:hidden">
              {/* Room status pills */}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {localRoomConfig.map((config, index) => {
                  const sel = roomSelections[config.id];
                  return (
                    <div key={config.id} className="flex items-center gap-1.5 min-w-0">
                      {sel ? (
                        <div className="shrink-0 bg-foreground rounded-full p-0.5">
                          <Check size={10} className="text-white" aria-hidden="true" />
                        </div>
                      ) : (
                        <ArrowRight size={14} className="shrink-0 text-foreground" aria-hidden="true" />
                      )}
                      <span className="text-xs font-semibold text-foreground shrink-0 flex items-center gap-1">
                        Room {index + 1} <Users size={12} aria-hidden="true" /> {config.adults + config.children}:
                      </span>
                      <span className="text-xs text-foreground truncate min-w-0">
                        {sel ? sel.room.name : <span className="text-grey italic">Selecting now</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Price + button */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-grey text-xs">{totalPrice}€ per person, per night</span>
                  <span className="text-foreground font-bold text-base">Total for {nights} night{nights !== 1 ? 's' : ''}: {totalPrice * nights}€</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => allRoomsSelected && handleCompleteBooking()}
                      aria-disabled={!allRoomsSelected}
                      className={cn(
                        "inline-flex shrink-0 px-4 py-2.5 rounded-lg font-bold text-sm transition-all select-none items-center gap-2",
                        allRoomsSelected
                          ? "bg-primary hover:brightness-85 text-white cursor-pointer shadow-lg"
                          : "bg-border text-grey cursor-not-allowed"
                      )}
                    >
                      Book
                    </span>
                  </TooltipTrigger>
                  {!allRoomsSelected && (
                    <TooltipContent side="top" sideOffset={8}>
                      Please select a room for each guest configuration to proceed.
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>

            {/* Desktop layout: full detail side by side */}
            <div className="hidden sm:flex items-center justify-between gap-6">
              {/* Left: Per-room breakdown */}
              <div className="flex flex-col gap-2">
                <span className="text-grey text-xs font-semibold uppercase tracking-wide">Room Selection</span>
                {localRoomConfig.map((config, index) => {
                  const sel = roomSelections[config.id];
                  const cancelLabel = sel?.room.cancellationPolicies.find(p => p.id === sel.cancelOption)?.label;
                  const boardLabel  = sel?.room.extras.find(p => p.id === sel.extraOption)?.label;
                  return (
                    <div key={config.id} className="flex items-center gap-2 min-w-0">
                      {sel ? (
                        <div className="shrink-0 bg-foreground rounded-full p-0.5">
                          <Check size={12} className="text-white" aria-hidden="true" />
                        </div>
                      ) : (
                        <ArrowRight size={16} className="shrink-0 text-foreground" aria-hidden="true" />
                      )}
                      <span className="text-sm font-semibold text-foreground shrink-0 flex items-center gap-1">
                        Room {index + 1}
                        <Users size={14} aria-hidden="true" />
                        {config.adults + config.children}:
                      </span>
                      {sel ? (
                        <span className="text-sm font-semibold text-foreground truncate min-w-0">
                          {sel.room.name} · {cancelLabel} · {boardLabel}
                        </span>
                      ) : (
                        <span className="text-sm text-grey italic shrink-0">· Selecting now</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right: Price & CTA */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-grey text-xs">{totalPrice}€ per person, per night</span>
                  <span className="text-foreground font-bold text-2xl">Total for {nights} night{nights !== 1 ? 's' : ''}: {totalPrice * nights}€</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => allRoomsSelected && handleCompleteBooking()}
                      aria-disabled={!allRoomsSelected}
                      className={cn(
                        "inline-flex px-6 py-3 rounded-lg font-bold text-base transition-all select-none items-center gap-2",
                        allRoomsSelected
                          ? "bg-primary hover:brightness-85 text-white cursor-pointer shadow-lg"
                          : "bg-border text-grey cursor-not-allowed"
                      )}
                    >
                      Book
                    </span>
                  </TooltipTrigger>
                  {!allRoomsSelected && (
                    <TooltipContent side="top" sideOffset={8}>
                      Please select a room for each guest configuration to proceed.
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* All amenities modal — grouped by category */}
      <Dialog open={amenitiesOpen} onOpenChange={setAmenitiesOpen}>
        <DialogContent className="max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hotel amenities and facilities</DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-6">
            {HOTEL_AMENITY_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="text-xs font-bold uppercase tracking-wider text-grey mb-3">
                  {group.label}
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {group.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <Check size={14} className="text-primary shrink-0" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* About the hotel modal — full description text */}
      <Dialog open={descriptionOpen} onOpenChange={setDescriptionOpen}>
        <DialogContent className="max-w-[640px]">
          <DialogHeader>
            <DialogTitle>About {hotel.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2 text-base text-foreground leading-normal">
            <p>{desc.short} {desc.long}</p>
            <p>
              {hotel.name} is a {hotel.stars}-star property in {hotel.location}, with a guest rating of{" "}
              {hotel.rating.toFixed(1)}/10 based on {hotel.reviewCount.toLocaleString()} reviews.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Show on map modal — interactive LeafletMap centred on the hotel's coordinates */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3">
            <DialogTitle className="flex items-center gap-2">
              <MapPin size={16} className="text-primary shrink-0" aria-hidden="true" />
              {hotel.name} — {hotel.location}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[480px]">
            <LeafletMap
              center={coords}
              zoom={13}
              markers={[{ id: hotel.id, lat: coords[0], lng: coords[1], label: hotel.name }]}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* All photos modal — shows the main hotel image + ROOM_IMAGES gallery.
          Same two-column mosaic layout as PackageDetailPage. */}
      <Dialog open={photosOpen} onOpenChange={setPhotosOpen}>
        <DialogContent className="max-w-[1040px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{hotel.name} — All photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* Full-width hero at the top */}
            <div className="col-span-2">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full aspect-[16/7] object-cover rounded-xl"
              />
            </div>
            {/* Room photos fill the remaining grid cells */}
            {ROOM_IMAGES.map((url, i) => (
              <img
                key={url}
                src={url}
                alt={`Hotel photo ${i + 2}`}
                className="w-full aspect-[4/3] object-cover rounded-xl"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* All reviews modal — score summary + grid of review cards.
          Same layout as PackageDetailPage's reviews modal. */}
      <Dialog open={reviewsOpen} onOpenChange={setReviewsOpen}>
        <DialogContent className="max-w-[880px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Guest reviews</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {/* Score summary row at the top */}
            <div className="flex items-center gap-5 pb-5 border-b border-border mb-5">
              <div className="text-5xl font-bold text-foreground leading-none">
                {hotel.rating.toFixed(1)}
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">
                  {ratingLabel(hotel.rating)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Based on {hotel.reviewCount.toLocaleString()} verified reviews
                </div>
              </div>
            </div>
            {/* Review cards in a 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {HOTEL_MOCK_REVIEWS.map((review, i) => (
                <div
                  key={i}
                  className="border border-border rounded-lg p-4 flex flex-col gap-3"
                >
                  <div className="text-sm font-bold text-foreground">
                    {review.score} {review.label}
                  </div>
                  <p className="text-sm text-foreground leading-normal flex-1">
                    {review.text}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <span className="text-xs text-foreground">{review.date}</span>
                    <span className="text-xs text-muted-foreground">Verified review</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
