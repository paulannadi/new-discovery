import { useState, useMemo, useRef, useEffect } from "react";
import { BackButton } from "../../../shared/components/BackButton";
import {
  MapPin,
  Star,
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
  Search
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, parseISO, addDays } from "date-fns";
import "react-day-picker/dist/style.css";
import { toast, Toaster } from "sonner";
import svgPaths from "../components/svg-ttlkwt9m93";
import PoliciesSection from "../components/PoliciesSection";

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

// Converts a 0–10 rating score to a label (matching the style in PackageDetailPage)
function ratingLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 8.5) return "Outstanding";
  if (score >= 8) return "Excellent";
  if (score >= 7) return "Very Good";
  return "Good";
}

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
    <div className={`bg-white rounded-[12px] overflow-hidden border-2 ${isSelected ? 'border-[#2681ff] shadow-lg' : 'border-[#e0e2e8]'} flex flex-col shadow-sm hover:shadow-md transition-all`}>
      {/* Image Carousel */}
      <div className="h-[200px] relative bg-gray-100 group">
        <img 
          src={room.image} 
          alt={room.name} 
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-3 right-3 bg-[#2681ff] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Check size={14} />
            Selected
          </div>
        )}
        
        {/* Carousel Controls */}
        {/* On mobile (touch screens) buttons are always visible; on desktop they appear on hover */}
        <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white text-[#2681ff]">
          <ChevronLeft size={16} />
        </button>
        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white text-[#2681ff]">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-[#191e3b] font-bold text-[18px] leading-tight mb-3">{room.name}</h3>

        {/* Room Details */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-2 text-[#191e3b]">
            <Bed size={16} />
            <span className="text-[14px]">{room.details.bedrooms} bedroom{room.details.bedrooms > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-[#191e3b]">
            <Users size={16} />
            <span className="text-[14px]">Sleeps {room.details.sleeps}</span>
          </div>
          <div className="flex items-center gap-2 text-[#191e3b]">
            <Armchair size={16} />
            <span className="text-[14px]">{room.details.bedType}</span>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[12px] font-bold text-[#333743]">Cancellation policy</span>
            <span className="text-[10px] text-[#9598a4]">per person, per night</span>
          </div>
          <div className="flex flex-col gap-2">
            {room.cancellationPolicies.map((opt) => (
              <label key={opt.id} className="flex items-center justify-between cursor-pointer group" onClick={() => handleCancelChange(opt.id)}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedCancel === opt.id ? 'border-[#2681ff]' : 'border-[#e0e2e8]'}`}>
                    {selectedCancel === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#2681ff]" />}
                  </div>
                  <span className="text-[12px] text-[#333743]">{opt.label}</span>
                </div>
                {opt.priceDelta > 0 && <span className="text-[12px] text-[#333743]">+ ${opt.priceDelta}</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[12px] font-bold text-[#333743]">Extras</span>
            <span className="text-[10px] text-[#9598a4]">per person, per night</span>
          </div>
          <div className="flex flex-col gap-2">
            {room.extras.map((opt) => (
              <label key={opt.id} className="flex items-center justify-between cursor-pointer group" onClick={() => handleExtraChange(opt.id)}>
                <div className="flex items-center gap-2">
                   <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedExtra === opt.id ? 'border-[#2681ff]' : 'border-[#e0e2e8]'}`}>
                    {selectedExtra === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#2681ff]" />}
                  </div>
                  <span className="text-[12px] text-[#333743]">{opt.label}</span>
                </div>
                {opt.priceDelta > 0 && <span className="text-[12px] text-[#333743]">+ ${opt.priceDelta}</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-[#f3f5f6] flex flex-col gap-2">
          {/* Total for the full stay — calculated as per-night price × number of nights */}
          <div className="text-right text-[14px] font-bold text-[#333743]">
            Total for {nights} night{nights !== 1 ? 's' : ''}: {totalPrice * nights}€
          </div>
          <div className="text-right text-[10px] text-[#9598a4]">per person, per night</div>
          <button
            onClick={handleBookClick}
            className={`w-full font-bold h-[40px] rounded-[8px] transition-colors flex items-center justify-center text-[15px] ${
              isSelected
                ? 'bg-[#19a974] hover:bg-[#158a5d] text-white'
                : 'bg-[#2681ff] hover:bg-[#1a6fd9] text-white'
            }`}
          >
            {isSelected ? `Selected - ${totalPrice}€` : `Select for ${totalPrice}€`}
          </button>
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
    
    toast.success(`Room selected for ${roomConfiguration.find(r => r.id === roomConfigId)?.adults || 0} adults`);
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
  // Use localRoomConfig so that after the user edits guests and hits Update Search,
  // all-rooms-selected checks against the new configuration.
  const allRoomsSelected = localRoomConfig.every(config => roomSelections[config.id] !== null);
  const someRoomsSelected = Object.values(roomSelections).some(sel => sel !== null);

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
      toast.success(`Booking confirmed for ${roomConfiguration.length} room(s) - Total: ${totalPrice}€`);
      // Navigate to SmartPlanner — App.tsx handles the actual page switch
      onBook(hotel, roomSelections);
    } else {
      toast.error(`Please select a room for each guest configuration`);
    }
  };

  return (
    <div className="bg-[#F3F5F6] min-h-screen">
      <Toaster position="bottom-right" />
      
      {/* Top Info Section - White Background */}
      <div className="w-full bg-white">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-[60px] py-[40px] flex flex-col gap-8">
        
        {/* Back to all hotels */}
        <BackButton label="Back to all hotels" onClick={onBack} />

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-[220px] sm:h-[300px] lg:h-[400px]">
          {/* Left: Large Image */}
          <div className="h-full rounded-[24px] overflow-hidden relative">
             <img 
               src={hotel.image}
               className="w-full h-full object-cover"
               alt="Exterior"
             />
          </div>
          
          {/* Right: Split Column — hidden on smaller screens, only shown on lg+ */}
          <div className="hidden lg:grid grid-cols-2 gap-2 h-full">
            {/* Middle Column: Stacked Images */}
            <div className="flex flex-col gap-2 h-full">
               <div className="flex-1 rounded-[24px] overflow-hidden relative">
                 <img 
                   src="https://images.unsplash.com/photo-1763207291832-819499e261dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc3RhdXJhbnQlMjBicmVha2Zhc3QlMjBidWZmZXR8ZW58MXx8fHwxNzY5NzgxMzM2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                   className="w-full h-full object-cover"
                   alt="Interior"
                 />
               </div>
               <div className="flex-1 rounded-[24px] overflow-hidden relative">
                 <img 
                   src="https://images.unsplash.com/photo-1729605411476-defbdab14c54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGJhbGklMjBwb29sJTIwaW5maW5pdHl8ZW58MXx8fHwxNzY5NzgxMzM2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                   className="w-full h-full object-cover"
                   alt="Pool"
                 />
               </div>
            </div>
            
            {/* Right Column: Map */}
            <div className="h-full rounded-[8px] overflow-hidden relative border border-[#e0e2e8]">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.1.0&auto=format&fit=crop&w=600&q=80"
                className="w-full h-full object-cover"
                alt="Map"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-white p-2 rounded-full shadow-lg">
                   <MapPin className="text-[#2681ff]" size={24} />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Info Header */}
        <div className="flex flex-col gap-4 pb-8">
          {/* On mobile this stacks vertically; on sm+ it's side-by-side */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
            <div className="flex flex-col gap-1.5">
              {/* Rating badge row — matches PackageDetailPage style */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="bg-[#19A974] text-white text-[12px] font-bold px-2 py-0.5 rounded-[8px] leading-tight">
                    {hotel.rating}
                  </div>
                  <span className="text-[13px] font-bold text-[#333743]">
                    {ratingLabel(hotel.rating)}
                  </span>
                </div>
                <span className="text-[13px] text-[#333743] underline">
                  {hotel.reviewCount.toLocaleString()} reviews
                </span>
              </div>

              {/* Hotel name + stars */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-[#333743] font-black text-[32px] leading-[46px]">{hotel.name}</h1>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${i < hotel.stars ? 'fill-[#FFB700] text-[#FFB700]' : 'fill-[#e0e2e8] text-[#e0e2e8]'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="w-[40px] h-[40px] flex items-center justify-center border border-[#e0e2e8] rounded-[8px] text-[#333743] hover:bg-gray-50">
                 <Share size={20} />
              </button>
              <button className="bg-[#2681ff] text-white font-bold px-4 py-2 rounded-[8px] text-[15px] h-[40px] w-[152px]">
                Book for ${hotel.price}
              </button>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-2 text-[#333743]">
            <MapPin size={20} />
            <span className="text-[16px]">{hotel.location}</span>
          </div>

          {/* Amenities */}
          <div className="flex flex-col gap-4 mt-2">
            <h3 className="font-bold text-[#333743] text-[18px]">Hotel amenities and facilities</h3>
            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              {hotel.amenities.slice(0, 4).map((amenity, i) => (
                <div key={i} className="flex items-center gap-2">
                  {amenity === "Pet friendly" && <Dog size={20} className="text-[#333743]" />}
                  {amenity === "Free Wifi" && <Wifi size={20} className="text-[#333743]" />}
                  {amenity === "Indoor pool" && <Waves size={20} className="text-[#333743]" />}
                  {amenity === "Gym" && <Dumbbell size={20} className="text-[#333743]" />}
                  {/* Fallback icon for others */}
                  {["Pet friendly", "Free Wifi", "Indoor pool", "Gym"].indexOf(amenity) === -1 && <Check size={20} className="text-[#333743]" />}
                  <span className="text-[#333743] text-[16px]">{amenity}</span>
                </div>
              ))}
              {hotel.amenities.length > 4 && (
                 <button className="text-[#2681ff] font-bold text-[14px]">See all</button>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Select Rooms Section - Grey Background */}
      <div className="w-full bg-[#F3F5F6]">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-[60px] py-[40px] flex flex-col gap-6">
          <h2 className="font-black text-[#333743] text-[28px]">Select rooms</h2>

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
                className={`h-[48px] rounded-[8px] border px-4 flex items-center gap-3 transition-colors cursor-pointer ${
                  openSearchPanel === "checkIn"
                    ? "border-[#2681FF] ring-2 ring-[#2681FF]/20 bg-white"
                    : "border-[#e0e2e8] bg-[#f9fafb] hover:border-[#2681FF]"
                }`}
                onClick={() => setOpenSearchPanel(openSearchPanel === "checkIn" ? null : "checkIn")}
              >
                <CalendarDays size={16} className="text-[#2681FF] shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">Check-in</span>
                  {/* format() converts the ISO string ("2026-04-10") to "Apr 10, 2026" */}
                  <span className={`text-[13px] font-semibold truncate ${searchDates.checkIn ? "text-[#333743]" : "text-[#9598a4] font-normal"}`}>
                    {searchDates.checkIn ? format(parseISO(searchDates.checkIn), "MMM d, yyyy") : "Add date"}
                  </span>
                </div>
                <ChevronDown size={14} className="text-[#9598a4] shrink-0" />
              </div>

              {/* DayPicker popup — same pattern as PackageSearchForm's dates panel */}
              {openSearchPanel === "checkIn" && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-[16px] shadow-2xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-150">
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
                className={`h-[48px] rounded-[8px] border px-4 flex items-center gap-3 transition-colors cursor-pointer ${
                  openSearchPanel === "checkOut"
                    ? "border-[#2681FF] ring-2 ring-[#2681FF]/20 bg-white"
                    : "border-[#e0e2e8] bg-[#f9fafb] hover:border-[#2681FF]"
                }`}
                onClick={() => setOpenSearchPanel(openSearchPanel === "checkOut" ? null : "checkOut")}
              >
                <CalendarDays size={16} className="text-[#2681FF] shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">Check-out</span>
                  <span className={`text-[13px] font-semibold truncate ${searchDates.checkOut ? "text-[#333743]" : "text-[#9598a4] font-normal"}`}>
                    {searchDates.checkOut ? format(parseISO(searchDates.checkOut), "MMM d, yyyy") : "Add date"}
                  </span>
                </div>
                <ChevronDown size={14} className="text-[#9598a4] shrink-0" />
              </div>

              {openSearchPanel === "checkOut" && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-[16px] shadow-2xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-150">
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
                className={`h-[48px] rounded-[8px] border px-4 flex items-center gap-3 transition-colors cursor-pointer ${
                  openSearchPanel === "guests"
                    ? "border-[#2681FF] ring-2 ring-[#2681FF]/20 bg-white"
                    : "border-[#e0e2e8] bg-[#f9fafb] hover:border-[#2681FF]"
                }`}
                onClick={() => setOpenSearchPanel(openSearchPanel === "guests" ? null : "guests")}
              >
                <Users size={16} className="text-[#2681FF] shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">Guests & Rooms</span>
                  <span className="text-[13px] font-semibold text-[#333743] truncate">
                    {localRoomConfig.reduce((sum, r) => sum + r.adults, 0)} Adult{localRoomConfig.reduce((sum, r) => sum + r.adults, 0) !== 1 ? 's' : ''}
                    {localRoomConfig.reduce((sum, r) => sum + r.children, 0) > 0 &&
                      ` · ${localRoomConfig.reduce((sum, r) => sum + r.children, 0)} Child${localRoomConfig.reduce((sum, r) => sum + r.children, 0) !== 1 ? 'ren' : ''}`
                    }
                    {' · '}{localRoomConfig.length} Room{localRoomConfig.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ChevronDown size={14} className="text-[#9598a4] shrink-0" />
              </div>

              {/* Guests dropdown panel */}
              {openSearchPanel === "guests" && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-[16px] shadow-2xl border border-[#e0e2e8] p-4 w-[300px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                  {localRoomConfig.map((config, index) => (
                    <div key={config.id} className="flex flex-col gap-3">
                      {/* Room header row */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-[#333743]">Room {index + 1}</span>
                        {/* Remove button — only shown when there's more than 1 room */}
                        {localRoomConfig.length > 1 && (
                          <button
                            onClick={() => setLocalRoomConfig(prev => prev.filter(r => r.id !== config.id))}
                            className="text-[11px] text-[#e53935] font-bold hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Adults counter */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[13px] text-[#333743]">Adults</div>
                          <div className="text-[11px] text-[#9598a4]">Age 18+</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setLocalRoomConfig(prev => prev.map(r =>
                              r.id === config.id ? { ...r, adults: Math.max(1, r.adults - 1) } : r
                            ))}
                            className="w-7 h-7 rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] font-bold text-[16px] hover:border-[#2681FF] hover:text-[#2681FF] disabled:opacity-30"
                            disabled={config.adults <= 1}
                          >−</button>
                          <span className="text-[14px] font-bold text-[#333743] w-4 text-center">{config.adults}</span>
                          <button
                            onClick={() => setLocalRoomConfig(prev => prev.map(r =>
                              r.id === config.id ? { ...r, adults: Math.min(6, r.adults + 1) } : r
                            ))}
                            className="w-7 h-7 rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] font-bold text-[16px] hover:border-[#2681FF] hover:text-[#2681FF] disabled:opacity-30"
                            disabled={config.adults >= 6}
                          >+</button>
                        </div>
                      </div>

                      {/* Children counter */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[13px] text-[#333743]">Children</div>
                          <div className="text-[11px] text-[#9598a4]">Age 2–17</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setLocalRoomConfig(prev => prev.map(r =>
                              r.id === config.id ? { ...r, children: Math.max(0, r.children - 1) } : r
                            ))}
                            className="w-7 h-7 rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] font-bold text-[16px] hover:border-[#2681FF] hover:text-[#2681FF] disabled:opacity-30"
                            disabled={config.children <= 0}
                          >−</button>
                          <span className="text-[14px] font-bold text-[#333743] w-4 text-center">{config.children}</span>
                          <button
                            onClick={() => setLocalRoomConfig(prev => prev.map(r =>
                              r.id === config.id ? { ...r, children: Math.min(6, r.children + 1) } : r
                            ))}
                            className="w-7 h-7 rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] font-bold text-[16px] hover:border-[#2681FF] hover:text-[#2681FF] disabled:opacity-30"
                            disabled={config.children >= 6}
                          >+</button>
                        </div>
                      </div>

                      {/* Divider between rooms */}
                      {index < localRoomConfig.length - 1 && (
                        <div className="border-t border-[#f3f5f6]" />
                      )}
                    </div>
                  ))}

                  {/* Add room button — max 6 rooms */}
                  {localRoomConfig.length < 6 && (
                    <button
                      onClick={() => {
                        const newId = Math.max(...localRoomConfig.map(r => r.id)) + 1;
                        setLocalRoomConfig(prev => [...prev, { id: newId, adults: 2, children: 0 }]);
                      }}
                      className="w-full h-[36px] rounded-[8px] border border-dashed border-[#2681FF] text-[#2681FF] font-bold text-[13px] hover:bg-[#f0f6ff] transition-colors"
                    >
                      + Add another room
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Update Search button — matches PackageSearchForm's search button style ── */}
            <button
              onClick={() => { setOpenSearchPanel(null); handleSearchUpdate(); }}
              className="shrink-0 bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-black text-[14px] h-[48px] px-5 rounded-[8px] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Search size={16} />
              {isSearching ? 'Searching...' : 'Update Search'}
            </button>
          </div>

          {/* Tabs for Multiple Rooms */}
          {localRoomConfig.length > 1 ? (
            <>
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-[#e0e2e8]">
                {localRoomConfig.map((config, index) => {
                  const selectedRoom = roomSelections[config.id];
                  const isActive = activeRoomTab === config.id;

                  return (
                    <button
                      key={config.id}
                      onClick={() => setActiveRoomTab(config.id)}
                      className={`flex items-center gap-2 px-6 py-3 font-bold text-[14px] border-b-2 transition-colors relative ${
                        isActive
                          ? 'border-[#2681ff] text-[#2681ff]'
                          : 'border-transparent text-[#9598a4] hover:text-[#333743]'
                      }`}
                    >
                      <span>Room {index + 1}</span>
                      <div className="flex items-center gap-1 text-[12px] font-normal">
                        <Users size={14} />
                        <span>{config.adults + config.children}</span>
                      </div>
                      {selectedRoom && (
                        <div className="absolute -top-1 -right-1 bg-[#19a974] rounded-full p-0.5">
                          <Check size={12} className="text-white" />
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
                          <div key={n} className="bg-white rounded-[12px] border-2 border-[#e0e2e8] h-[420px] animate-pulse" />
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
                      <div className="bg-[#fff9ea] border border-[#ffebc2] rounded-[12px] p-6 text-center">
                        <p className="text-[#92400e] font-bold text-[14px]">
                          No rooms available for {getTotalGuests(config)} guest{getTotalGuests(config) > 1 ? 's' : ''}
                        </p>
                        <p className="text-[#b45309] text-[12px] mt-2">
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
                          <div key={n} className="bg-white rounded-[12px] border-2 border-[#e0e2e8] h-[420px] animate-pulse" />
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
                      <div className="bg-[#fff9ea] border border-[#ffebc2] rounded-[12px] p-6 text-center">
                        <p className="text-[#92400e] font-bold text-[14px]">
                          No rooms available for {getTotalGuests(config)} guest{getTotalGuests(config) > 1 ? 's' : ''}
                        </p>
                        <p className="text-[#b45309] text-[12px] mt-2">
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
      </div>

      {/* Hotel Policies Section - Grey Background */}
      <div className="w-full bg-[#F3F5F6]">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-[60px] py-[40px] flex flex-col gap-6">
          <h2 className="font-black text-[#333743] text-[24px]">Hotel information</h2>
          
          <PoliciesSection />
        </div>
      </div>

      {/* Guest Reviews Section - Grey Background */}
      <div className="w-full bg-[#F3F5F6]">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-[60px] py-[40px] flex flex-col gap-6">
          <h2 className="font-black text-[#333743] text-[24px]">Guest Reviews</h2>
          
          <div className="bg-white rounded-[16px] shadow-[0px_0px_4px_0px_rgba(125,130,147,0.4)] p-[24px] flex flex-col md:flex-row gap-6 md:gap-[72px] items-start overflow-hidden">
            {/* Left Side - Rating Summary */}
            <div className="flex flex-col items-start gap-[4px] min-w-[200px]">
              <div className="flex flex-col items-start w-full">
                <p className="text-[24px] leading-[32px]">
                  <span className="text-[#2681ff] font-black">{hotel.rating}</span>
                  <span className="text-[#333743] font-bold">/10</span>
                </p>
              </div>
              <div className="text-[#191e3b] font-bold text-[16px] leading-[24px]">
                Exceptional
              </div>
              <div className="pt-[4px]">
                <button className="flex items-center gap-[4px] text-[#333743] text-[12px] leading-[16px] hover:underline">
                  <span>{hotel.reviewCount} verified reviews</span>
                  <div className="relative size-[18px]">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                      <g>
                        <path d={svgPaths.p37960400} fill="#191E3B" />
                        <path clipRule="evenodd" d={svgPaths.p36227e00} fill="#191E3B" fillRule="evenodd" />
                      </g>
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Side - Reviews */}
            <div className="flex-1 flex flex-col gap-[24px] min-w-0">
              {/* Reviews Container */}
              <div className="flex gap-[16px] overflow-x-auto pb-2 scrollbar-hide">
                {/* Review 1 */}
                <div className="flex flex-col h-[230px] w-[294.66px] p-[16px] rounded-[16px] border border-[#e0e2e8] flex-shrink-0">
                  <div className="text-[#191e3b] font-bold text-[16px] leading-[24px] mb-2">
                    8/10 Good
                  </div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-[#191e3b] text-[16px] leading-[24px] mb-2">
                      The staff were friendly and helpful. Great location.
                    </p>
                    <button className="text-[#2681ff] font-bold text-[12px] leading-[16px] py-[4px] hover:underline text-left">
                      See details
                    </button>
                  </div>
                  <div className="text-[#191e3b] text-[16px] leading-[24px]">
                    Feb 22, 2026
                  </div>
                  <div className="text-[#9598a4] text-[12px] leading-[16px]">
                    Verified review
                  </div>
                </div>

                {/* Review 2 */}
                <div className="flex flex-col h-[230px] w-[294.66px] p-[16px] rounded-[16px] border border-[#e0e2e8] flex-shrink-0">
                  <div className="text-[#191e3b] font-bold text-[16px] leading-[24px] mb-2">
                    9/10 Excellent
                  </div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-[#191e3b] text-[16px] leading-[24px] mb-2">
                      Amazing pool and beautiful rooms. Highly recommend!
                    </p>
                    <button className="text-[#2681ff] font-bold text-[12px] leading-[16px] py-[4px] hover:underline text-left">
                      See details
                    </button>
                  </div>
                  <div className="text-[#191e3b] text-[16px] leading-[24px]">
                    Feb 12, 2026
                  </div>
                  <div className="text-[#9598a4] text-[12px] leading-[16px]">
                    Verified review
                  </div>
                </div>

                {/* Review 3 */}
                <div className="flex flex-col h-[230px] w-[294.66px] p-[16px] rounded-[16px] border border-[#e0e2e8] flex-shrink-0">
                  <div className="text-[#191e3b] font-bold text-[16px] leading-[24px] mb-2">
                    10/10 Perfect
                  </div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-[#191e3b] text-[16px] leading-[24px] mb-2">
                      Perfect in every way! Will definitely come back.
                    </p>
                    <button className="text-[#2681ff] font-bold text-[12px] leading-[16px] py-[4px] hover:underline text-left">
                      See details
                    </button>
                  </div>
                  <div className="text-[#191e3b] text-[16px] leading-[24px]">
                    Jan 26, 2026
                  </div>
                  <div className="text-[#9598a4] text-[12px] leading-[16px]">
                    Verified review
                  </div>
                </div>

                {/* Review 4 */}
                <div className="flex flex-col h-[230px] w-[294.66px] p-[16px] rounded-[16px] border border-[#e0e2e8] flex-shrink-0">
                  <div className="text-[#191e3b] font-bold text-[16px] leading-[24px] mb-2">
                    8/10 Good
                  </div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-[#191e3b] text-[16px] leading-[24px] mb-2">
                      Good size room. Nice breakfast.
                    </p>
                    <button className="text-[#2681ff] font-bold text-[12px] leading-[16px] py-[4px] hover:underline text-left">
                      See details
                    </button>
                  </div>
                  <div className="text-[#191e3b] text-[16px] leading-[24px]">
                    Jan 14, 2026
                  </div>
                  <div className="text-[#9598a4] text-[12px] leading-[16px]">
                    Verified review
                  </div>
                </div>
              </div>

              {/* See All Reviews Button */}
              <button className="text-[#2681ff] font-bold text-[16px] leading-[24px] py-[4px] hover:underline text-center">
                See all {hotel.reviewCount} reviews
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Booking Bar */}
      {someRoomsSelected && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e2e8] shadow-[0px_-4px_12px_rgba(0,0,0,0.1)] z-50">
          <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-[60px] py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
              {/* Left: Booking Summary */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <div className="flex flex-col">
                  <span className="text-[#9598a4] text-[12px]">Booking Summary</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#333743] font-bold text-[16px]">
                      {Object.values(roomSelections).filter(s => s !== null).length} of {roomConfiguration.length} room{roomConfiguration.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                </div>

                {/* Selected Rooms */}
                <div className="flex items-center gap-2 flex-wrap">
                  {roomConfiguration.map((config, index) => {
                    const selection = roomSelections[config.id];
                    return (
                      <div
                        key={config.id}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1 ${
                          selection
                            ? 'bg-[#19a974] text-white'
                            : 'bg-[#f3f5f6] text-[#9598a4]'
                        }`}
                      >
                        {selection && <Check size={12} />}
                        Room {index + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Price & CTA */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[#9598a4] text-[12px]">Total Price</span>
                  <span className="text-[#333743] font-black text-[24px]">{totalPrice}€</span>
                </div>
                
                <button
                  onClick={handleCompleteBooking}
                  disabled={!allRoomsSelected}
                  className={`px-6 py-3 rounded-[8px] font-bold text-[16px] transition-all ${
                    allRoomsSelected
                      ? 'bg-[#2681ff] hover:bg-[#1a6fd9] text-white cursor-pointer'
                      : 'bg-[#e0e2e8] text-[#9598a4] cursor-not-allowed'
                  }`}
                >
                  {allRoomsSelected ? 'Complete Booking' : 'Select All Rooms'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}