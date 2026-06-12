// roomData.ts — shared room types + mock-data generators.
//
// These were originally defined inline inside HotelDetailPage.tsx. They've been
// moved here so the new StopoverRoomPage can reuse the EXACT same room data and
// pricing logic instead of keeping a second copy that could drift out of sync.
// Both pages now import from this one file, so a change to room types or pricing
// happens in a single place.

// --- Types ---

// A single selectable pricing line (a board option or a cancellation policy).
// `priceDelta` is the surcharge added on top of the room's base price (0 = no extra).
export type PricingOption = {
  id: string;
  label: string;
  priceDelta: number; // 0 for base
  subLabel?: string;
};

// A bookable room type, with its own image, sleeping details, base price, and
// the cancellation / board options the guest can pick from.
export type Room = {
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

// One "room" line from the search — how many adults/children share that room.
// The booking needs a Room selected for each RoomConfig.
export type RoomConfig = {
  id: number;
  adults: number;
  children: number;
};

// The guest's final choice for one RoomConfig: which room, plus the picked
// cancellation policy and board (extra) option ids.
export type RoomSelection = {
  room: Room;
  cancelOption: string;
  extraOption: string;
};

// The minimal slice of a hotel the generator needs. We deliberately DON'T require
// the full Hotel type here, because HotelListPage and HotelDetailPage describe
// their hotels slightly differently (e.g. coordinates). This keeps the generator
// usable from any page that has at least these fields.
export type RoomGenInput = {
  id: string;
  boardTypes: string[];
  cancellationPolicy: "Free cancellation" | "Non-refundable";
};

// --- Mock Data ---

export const ROOM_IMAGES = [
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

// Simple pseudo-random number generator seeded by a string. Returns the SAME
// value for the same seed every time, so a given hotel always produces the same
// rooms (no flicker between renders or pages).
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

// Build a deterministic list of 3–6 rooms for a hotel, priced off `basePrice`
// and honouring the hotel's board types + cancellation policy.
export const generateRoomsForHotel = (hotel: RoomGenInput, basePrice: number): Room[] => {
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
