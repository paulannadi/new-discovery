// StopoverRoomPage — the room-selection step of the stopover flow.
//
// Sits between "pick your stopover hotel" and the booking summary:
//   flights → stopover hotel → THIS PAGE (pick a room) → booking summary
//
// The PRIMARY job is choosing a room, so the room grid leads the page. The
// SECONDARY job is showing off the hotel the traveller just picked, so a richer
// hotel "showcase" (photos, description, amenities, map, reviews) sits BELOW the
// rooms. This mirrors HotelDetailPage's look, but with the emphasis flipped:
// HotelDetailPage opens with a big hotel hero; here the rooms come first.

import { useState, useMemo, useEffect, useRef } from "react";
import { BackButton } from "../../../shared/components/BackButton";
import AccommodationStar from "../../../shared/components/AccommodationStar";
import RatingBlock from "../../../shared/components/RatingBlock";
import {
  MapPin,
  Wifi,
  Waves,
  Dumbbell,
  Check,
  Info,
  MapPinned,
  Bed,
  ChevronDown,
  Users,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
// cn = a tiny helper that joins Tailwind class strings together and lets us
// switch classes on/off conditionally (used for the field's active/hover state).
import { cn } from "../../../shared/components/ui/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
// Tooltip explains why the bottom-bar CTA is disabled (rooms not all chosen yet).
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../shared/components/ui/tooltip";
// The "Stopover package" caption + info bubble, shown beside the bottom-bar total.
import { StopoverPackageLabel } from "../components/StopoverPackageLabel";
import LeafletMap from "../../../shared/components/LeafletMap";
import { showToast } from "../../../shared/utils/toast";
import { hotelDescription, nearbyPOIs, locationCoords } from "../../../shared/utils/hotelUtils";
import { ImageWithPlaceholder, SkeletonCard } from "../../../shared/components/loading";
import { PageContainer } from "../../../shared/components/PageContainer";
// Shared room building blocks — the SAME data + card the hotel detail page uses.
import {
  type RoomConfig,
  type RoomSelection,
  ROOM_IMAGES,
  generateRoomsForHotel,
} from "../components/rooms/roomData";
import { RoomCard } from "../components/rooms/RoomCard";

// The slice of a hotel this page needs. The stopover hotel comes straight from
// HotelListPage's mock data, which always carries these fields.
type StopoverHotel = {
  id: string;
  name: string;
  image: string;
  stars: number;
  rating: number;
  reviewCount: number;
  price: number;
  amenities: string[];
  boardTypes: string[];
  cancellationPolicy: "Free cancellation" | "Non-refundable";
};

// A few extra showcase photos (paired with the hotel's own image + ROOM_IMAGES)
// so the gallery and "all photos" modal feel like a real hotel listing.
const SHOWCASE_PHOTOS = [
  "https://images.unsplash.com/photo-1763207291832-819499e261dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc3RhdXJhbnQlMjBicmVha2Zhc3QlMjBidWZmZXR8ZW58MXx8fHwxNzY5NzgxMzM2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1729605411476-defbdab14c54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGJhbGklMjBwb29sJTIwaW5maW5pdHl8ZW58MXx8fHwxNzY5NzgxMzM2fDA&ixlib=rb-4.1.0&q=80&w=1080",
];

const MOCK_REVIEWS = [
  { score: "9/10", label: "Excellent", text: "Perfect for a one-night stopover — close to the airport and a smooth check-in.", date: "Feb 18, 2026" },
  { score: "8/10", label: "Good",      text: "Comfortable room and a great breakfast before our onward flight.",               date: "Feb 03, 2026" },
  { score: "9/10", label: "Excellent", text: "Lovely pool to relax by while we waited for our connection.",                    date: "Jan 21, 2026" },
];

export default function StopoverRoomPage({
  hotel,
  city,
  nights,
  roomConfiguration = [{ id: 1, adults: 2, children: 0 }],
  packageFloor = 0,
  flightLegs = [],
  headerSlot,
  initialRoomSelections,
  initialRoomConfig,
  onBack,
  onGoToBookingSummary,
}: {
  hotel: StopoverHotel | null;
  // The stopover city — used for the location line + map (the hotel's own
  // location field points at its original city, not the stopover hub).
  city: string;
  nights: number;
  // The running package floor for this hotel (flights + hotel premium, €). The
  // cheapest room sits exactly on this floor; pricier rooms add their premium.
  packageFloor?: number;
  // The flight legs the traveller already chose — listed under "Flights" in the
  // trip summary (one row per leg, with its date), exactly like the Smart Planner.
  flightLegs?: Array<{
    from: string;
    to: string;
    dateISO?: string;
    airline: string;
    duration: string;
  }>;
  // How many guests the room is for — derived from the flight passengers.
  roomConfiguration?: RoomConfig[];
  // The FlightStepper, rendered in the page header so the stopover progress is visible.
  headerSlot?: React.ReactNode;
  // When the traveller returns here from the booking summary, App passes their
  // previous choices back so we can re-seed the page (otherwise this page
  // unmounts on navigation and the selections would reset). Optional — absent
  // on the first visit.
  initialRoomSelections?: { [id: number]: RoomSelection | null };
  initialRoomConfig?: RoomConfig[];
  // Exits the whole stopover flow back to Discovery. Stepping back to an
  // earlier step (flights / hotel) is handled by the FlightStepper in the
  // header, so this back button consistently says "Back to discovery".
  onBack: () => void;
  // Called once a room is chosen for every guest config and all travellers are
  // allocated — App.tsx stores the choices and moves on to the booking summary.
  onGoToBookingSummary: (
    roomSelections: { [key: number]: RoomSelection | null },
    roomConfig: RoomConfig[],
    tripTotal: number,
  ) => void;
}) {
  if (!hotel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-xl font-bold">Hotel not found</h1>
        <BackButton label="Back to discovery" onClick={onBack} />
      </div>
    );
  }

  // Build the room list once per hotel (stable across re-renders).
  const rooms = useMemo(() => generateRoomsForHotel(hotel, hotel.price), [hotel]);

  // Fixed traveller totals, derived from the configuration we arrived with.
  const totalAdults = roomConfiguration.reduce((sum, c) => sum + c.adults, 0);
  const totalChildren = roomConfiguration.reduce((sum, c) => sum + c.children, 0);

  // Editable room allocation. The TOTAL number of travellers is fixed here (it
  // comes from the flights the traveller already booked and can't change on this
  // step). What the user CAN do is split those same travellers across one or more
  // rooms — so this is a local, editable copy of the config we arrived with.
  // Seed from the user's previous choices when returning from the booking
  // summary; otherwise start from the config we arrived with.
  const seedConfig = initialRoomConfig ?? roomConfiguration;
  const [localRoomConfig, setLocalRoomConfig] = useState<RoomConfig[]>(seedConfig);

  // When the user books more than one room, we show a tab per room (same as the
  // hotel flow) so each room is picked separately. This tracks the open tab.
  const [activeRoomTab, setActiveRoomTab] = useState(seedConfig[0]?.id ?? 1);

  // Whether the "Guests & Rooms" dropdown is open, plus a ref on its wrapper so
  // we can close it when the user clicks anywhere outside (same pattern the hotel
  // detail page uses for its search-bar popups).
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) {
        setGuestsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // How many travellers are already placed into rooms, and how many still need a
  // home. The "+" buttons in the dropdown are only enabled while there are still
  // unplaced travellers, so the user can never exceed the locked totals.
  const allocatedAdults = localRoomConfig.reduce((sum, r) => sum + r.adults, 0);
  const allocatedChildren = localRoomConfig.reduce((sum, r) => sum + r.children, 0);
  const remainingAdults = totalAdults - allocatedAdults;
  const remainingChildren = totalChildren - allocatedChildren;
  // True once every traveller sits in a room (and no room is left empty).
  const allAllocated =
    remainingAdults === 0 &&
    remainingChildren === 0 &&
    localRoomConfig.every((r) => r.adults + r.children > 0);

  // One selection slot per guest configuration (one per room). Re-seeded from
  // the traveller's previous choices when they come back from the summary.
  const [roomSelections, setRoomSelections] = useState<{ [id: number]: RoomSelection | null }>(() => {
    if (initialRoomSelections) return initialRoomSelections;
    const initial: { [id: number]: RoomSelection | null } = {};
    seedConfig.forEach((c) => (initial[c.id] = null));
    return initial;
  });

  // Keep the selection slots in sync with the rooms: whenever rooms are added or
  // removed in the dropdown, make sure every current room has a slot (new rooms
  // start unselected) and drop slots for rooms that no longer exist.
  useEffect(() => {
    setRoomSelections((prev) => {
      const next: { [id: number]: RoomSelection | null } = {};
      localRoomConfig.forEach((c) => {
        next[c.id] = prev[c.id] ?? null;
      });
      return next;
    });
    // If the room whose tab is open got removed, fall back to the first room.
    setActiveRoomTab((current) =>
      localRoomConfig.some((c) => c.id === current) ? current : localRoomConfig[0]?.id ?? 1
    );
  }, [localRoomConfig]);

  // Brief loading shimmer is unused here (no search bar), but kept simple: rooms
  // are ready immediately.
  const isSearching = false;

  // Showcase modals
  const [photosOpen, setPhotosOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // Description / POIs / map coords derived from the STOPOVER city.
  const desc = useMemo(() => hotelDescription(hotel.name, city), [hotel.name, city]);
  const pois = useMemo(() => nearbyPOIs(city), [city]);
  const coords = useMemo(() => locationCoords(city), [city]);

  const allRoomsSelected = localRoomConfig.every((c) => roomSelections[c.id] != null);
  const someRoomsSelected = Object.values(roomSelections).some((s) => s !== null);

  // Toast once everything's chosen — same friendly confirmation as the detail page.
  useEffect(() => {
    if (allRoomsSelected) {
      showToast.success("Room selected — ready to continue your trip!");
    }
  }, [allRoomsSelected]);

  const getTotalGuests = (c: RoomConfig) => c.adults + c.children;
  // Total travellers across the whole configuration — used to scale the sticky
  // bar's stay total, since the room rate is quoted "per person, per night".
  const totalGuests = totalAdults + totalChildren;
  const getAvailableRooms = (c: RoomConfig) =>
    rooms.filter((room) => room.details.sleeps >= getTotalGuests(c));

  const handleRoomSelect = (configId: number, roomId: string, cancelOption: string, extraOption: string) => {
    const room = rooms.find((r) => r.id === roomId)!;
    setRoomSelections((prev) => ({ ...prev, [configId]: { room, cancelOption, extraOption } }));

    // Auto-advance to the next room's tab so the user flows naturally through
    // each room (stays put if this was the last room).
    const currentIndex = localRoomConfig.findIndex((c) => c.id === configId);
    if (currentIndex < localRoomConfig.length - 1) {
      setActiveRoomTab(localRoomConfig[currentIndex + 1].id);
    }
  };

  // Per-night total across all selected rooms (matches RoomCard's maths).
  const totalPrice = useMemo(() => {
    let total = 0;
    Object.values(roomSelections).forEach((sel) => {
      if (sel) {
        const cancelOpt = sel.room.cancellationPolicies.find((o) => o.id === sel.cancelOption);
        const extraOpt = sel.room.extras.find((o) => o.id === sel.extraOption);
        total += sel.room.basePrice + (cancelOpt?.priceDelta || 0) + (extraOpt?.priceDelta || 0);
      }
    });
    return total;
  }, [roomSelections]);

  // Renders the room grid (or skeleton / empty state) for a single room config.
  // Shared by both the single-room view and each tab in the multi-room view.
  const renderRoomGrid = (config: RoomConfig) => {
    const availableRooms = getAvailableRooms(config);
    const selectedRoom = roomSelections[config.id];
    if (isSearching) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <SkeletonCard key={n} variant="vertical" />
          ))}
        </div>
      );
    }
    if (availableRooms.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              nights={nights}
              // The room is for this config's travellers — pass the head
              // count so the card's total reflects the per-person rate.
              guests={getTotalGuests(config)}
              // Bundled package: each room card shows ONE total for the
              // whole trip. Cheapest room = the floor; pricier rooms add
              // their premium over the cheapest room.
              bundleBase={packageFloor}
              minRoomRate={minRoomRate}
              onSelect={(cancelOption, extraOption) =>
                handleRoomSelect(config.id, room.id, cancelOption, extraOption)
              }
              isSelected={selectedRoom?.room.id === room.id}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-yellow-900 font-bold text-sm">
          No rooms available for {getTotalGuests(config)} guest{getTotalGuests(config) > 1 ? "s" : ""}
        </p>
      </div>
    );
  };

  // Shared guard for BOTH summary CTAs: every traveller must be allocated to a
  // room, and every room must have a room type chosen. Returns true when the
  // trip is ready to move forward, otherwise shows the relevant error toast.
  const tripReady = () => {
    if (!allAllocated) {
      showToast.error("Please allocate all travellers to a room");
      return false;
    }
    if (!allRoomsSelected) {
      showToast.error("Please select a room to continue");
      return false;
    }
    return true;
  };

  // CTA — "Go to booking summary": once everything's chosen, hand the selections
  // (plus the room config and the computed package total) up to App, which stores
  // them and advances to the booking-summary review step.
  const handleGoToBookingSummary = () => {
    if (tripReady()) onGoToBookingSummary(roomSelections, localRoomConfig, tripTotal);
  };

  // ── Trip-summary data ──────────────────────────────────────────────────────
  // Cheapest room rate in this hotel (per person, per night). The cheapest room
  // sits exactly on the package floor; a pricier room adds its premium.
  const minRoomRate = rooms.length ? Math.min(...rooms.map((r) => r.basePrice)) : 0;
  // Trip total = package floor + the chosen room's premium over the cheapest
  // room, scaled by guests × nights. All-cheapest path stays at the anchor.
  const roomPremium = Math.max(0, (totalPrice - minRoomRate)) * totalGuests * nights;
  const tripTotal = packageFloor + roomPremium;

  // The bottom-bar CTA is enabled only once every room is chosen AND every
  // traveller is allocated to a room. When disabled, the tooltip explains why.
  const ctaDisabled = !allRoomsSelected || !allAllocated;
  const ctaDisabledReason = !allAllocated
    ? "Allocate all travellers to a room to continue."
    : "Select a room for each traveller to continue.";

  return (
    <div className="bg-grey-lightest min-h-screen pb-28">

      {/* ── WHITE HEADER STRIP — back button only ───────────────────────────
          Matches the stopover-hotel step: a white strip with the back button,
          using the same "narrow" content width as the rest of the flight flow. */}
      <div className="bg-card border-b border-border z-30 relative">
        <PageContainer tier="narrow" className="px-4 md:px-6 py-4">
          <BackButton label="Back to discovery" onClick={onBack} />
        </PageContainer>
      </div>

      {/* ── GREY SECTION — flight stepper ────────────────────────────────────
          Sits on the page's grey background (not inside a white card), just
          like the stepper on the stopover-hotel step. */}
      <div className="bg-grey-lightest">
        <PageContainer tier="narrow" className="px-4 md:px-6 pt-4 pb-3">

          {/* The FlightStepper passed in from App.tsx (✓Flights › ✓Hotel › ● Room). */}
          {headerSlot}
        </PageContainer>
      </div>

      {/* ── ROOM SELECTION (primary focus) ───────────────────────────────────── */}
      <PageContainer tier="narrow" className="px-4 md:px-6 pt-8 flex flex-col gap-2">
        {/* "Room for 2 travellers in Hotel Palazzo Doglio" — totalGuests sums
            adults + children across the whole room configuration, and we name the
            chosen hotel right in the title now that the top card is gone. */}
        <h2 className="flex items-center gap-2 font-extrabold text-foreground text-2xl">
          <Bed size={24} className="text-primary shrink-0" aria-hidden="true" />
          Room for {totalGuests} traveller{totalGuests !== 1 ? "s" : ""} in {hotel.name}
        </h2>
        {/* Context line — ties the room choice back to the stopover stay. */}
        <p className="text-sm text-foreground">
          {nights} night{nights !== 1 ? "s" : ""} in {city}
          {" · "}
          {totalAdults} adult{totalAdults !== 1 ? "s" : ""}
          {totalChildren > 0 && ` · ${totalChildren} child${totalChildren !== 1 ? "ren" : ""}`}
        </p>

        {/* ── Guests & Rooms field ───────────────────────────────────────────
            The SAME field + dropdown the hotel detail page uses, but with one
            rule changed: the total traveller count is locked (it comes from the
            flights), so the user can only SPLIT those travellers across rooms —
            they can't add or remove travellers, only place them. The "+" buttons
            below switch off once everyone has been allocated. */}
        <div ref={guestsRef} className="relative mt-2 w-full sm:max-w-[360px]">
          {/* Clickable field box — active state adds a blue ring, matching the
              hotel page's field style. */}
          <div
            className={cn(
              "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors cursor-pointer",
              guestsOpen
                ? "border-primary ring-2 ring-primary/20 bg-card"
                : "border-border bg-card hover:border-primary"
            )}
            onClick={() => setGuestsOpen((open) => !open)}
          >
            <Users size={16} className="text-primary shrink-0" aria-hidden="true" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                Guests &amp; Rooms
              </span>
              <span className="text-sm font-semibold text-foreground truncate">
                {totalAdults} Adult{totalAdults !== 1 ? "s" : ""}
                {totalChildren > 0 &&
                  ` · ${totalChildren} Child${totalChildren !== 1 ? "ren" : ""}`}
                {" · "}
                {localRoomConfig.length} Room{localRoomConfig.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ChevronDown size={14} className="text-grey shrink-0" aria-hidden="true" />
          </div>

          {/* Dropdown panel */}
          {guestsOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-card rounded-xl shadow-2xl border border-border p-4 w-full sm:w-[320px] max-w-[calc(100vw-2rem)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">

              {/* Helper line — reminds the user the total is fixed and shows how
                  many travellers still need placing into a room. */}
              <p className="text-xs text-grey leading-snug">
                {allAllocated ? (
                  "All travellers are allocated to a room."
                ) : (
                  <>
                    Allocate all travellers across your rooms.
                    {remainingAdults > 0 &&
                      ` ${remainingAdults} adult${remainingAdults !== 1 ? "s" : ""} left to place.`}
                    {remainingChildren > 0 &&
                      ` ${remainingChildren} child${remainingChildren !== 1 ? "ren" : ""} left to place.`}
                  </>
                )}
              </p>

              {localRoomConfig.map((config, index) => (
                <div key={config.id} className="flex flex-col gap-3">
                  {/* Room header row */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Room {index + 1}</span>
                    {/* Remove button — only when there's more than 1 room. Its
                        travellers return to the "left to place" pool. */}
                    {localRoomConfig.length > 1 && (
                      <Button
                        variant="ghost"
                        onClick={() => setLocalRoomConfig((prev) => prev.filter((r) => r.id !== config.id))}
                        className="text-xs text-danger font-bold h-auto p-0 hover:bg-transparent hover:underline"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Adults counter — "+" is disabled once no adults are left to
                      place, so the locked total can't be exceeded. */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-foreground">Adults</div>
                      <div className="text-xs text-grey">Age 18+</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setLocalRoomConfig((prev) => prev.map((r) =>
                          r.id === config.id ? { ...r, adults: Math.max(0, r.adults - 1) } : r
                        ))}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground font-bold text-base hover:border-primary hover:text-primary disabled:opacity-30"
                        disabled={config.adults <= 0}
                      >−</button>
                      <span className="text-sm font-bold text-foreground w-4 text-center">{config.adults}</span>
                      <button
                        onClick={() => setLocalRoomConfig((prev) => prev.map((r) =>
                          r.id === config.id ? { ...r, adults: r.adults + 1 } : r
                        ))}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground font-bold text-base hover:border-primary hover:text-primary disabled:opacity-30"
                        disabled={remainingAdults <= 0}
                      >+</button>
                    </div>
                  </div>

                  {/* Children counter — same locked-total rule. */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-foreground">Children</div>
                      <div className="text-xs text-grey">Age 2–17</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setLocalRoomConfig((prev) => prev.map((r) =>
                          r.id === config.id ? { ...r, children: Math.max(0, r.children - 1) } : r
                        ))}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground font-bold text-base hover:border-primary hover:text-primary disabled:opacity-30"
                        disabled={config.children <= 0}
                      >−</button>
                      <span className="text-sm font-bold text-foreground w-4 text-center">{config.children}</span>
                      <button
                        onClick={() => setLocalRoomConfig((prev) => prev.map((r) =>
                          r.id === config.id ? { ...r, children: r.children + 1 } : r
                        ))}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground font-bold text-base hover:border-primary hover:text-primary disabled:opacity-30"
                        disabled={remainingChildren <= 0}
                      >+</button>
                    </div>
                  </div>

                  {/* Divider between rooms */}
                  {index < localRoomConfig.length - 1 && (
                    <div className="border-t border-muted" />
                  )}
                </div>
              ))}

              {/* Add room — starts empty; the user then moves travellers into it
                  from the "left to place" pool. Capped at 6 rooms. */}
              {localRoomConfig.length < 6 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const newId = Math.max(...localRoomConfig.map((r) => r.id)) + 1;
                    setLocalRoomConfig((prev) => [...prev, { id: newId, adults: 0, children: 0 }]);
                  }}
                  className="w-full h-[36px] border-dashed border-primary text-primary hover:bg-primary/10"
                >
                  + Add another room
                </Button>
              )}
            </div>
          )}
        </div>
      </PageContainer>

      <PageContainer tier="narrow" className="px-4 md:px-6 pt-6 flex flex-col gap-6">
        {localRoomConfig.length > 1 ? (
          /* ── Multiple rooms → one tab per room ──────────────────────────────
              The user picks each room separately. A tab is locked until every
              earlier room has a selection, so they're chosen in order. */
          <>
            {/* Tab navigation */}
            <div className="sticky top-0 z-40 bg-grey-lightest flex items-center -mx-1 px-1 pt-2 border-b border-border overflow-x-auto whitespace-nowrap">
              {localRoomConfig.map((config, index) => {
                const selectedRoom = roomSelections[config.id];
                const isActive = activeRoomTab === config.id;
                // Disabled until all previous rooms have a selection.
                const isDisabled = localRoomConfig.slice(0, index).some((prev) => !roomSelections[prev.id]);
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
                    {/* A checkmark badge once this room has a selection. */}
                    {selectedRoom && (
                      <div className="absolute top-0 right-0 bg-foreground rounded-full p-0.5">
                        <Check size={12} className="text-white" aria-hidden="true" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active tab content — only the open room's grid is shown. */}
            {localRoomConfig.map((config) =>
              activeRoomTab === config.id ? (
                <div key={config.id} className="flex flex-col gap-6">
                  {renderRoomGrid(config)}
                </div>
              ) : null
            )}
          </>
        ) : (
          /* ── Single room → no tabs ── */
          <div className="flex flex-col gap-6">{renderRoomGrid(localRoomConfig[0])}</div>
        )}
      </PageContainer>

      {/* ══════════════════════════════════════════════════════════════════════
          HOTEL SHOWCASE (secondary) — everything below shows off the hotel.
      ══════════════════════════════════════════════════════════════════════ */}
      <div id="hotel-showcase" className="scroll-mt-4">

        {/* ── PHOTO GALLERY ──────────────────────────────────────────────────── */}
        <PageContainer tier="narrow" className="px-4 md:px-6 pt-12">
          {/* One white card wrapping the hotel header + photos, matching the
              "About + Highlights + Map" card below so the showcase reads as a
              consistent stack of white sections. */}
          <div className="bg-card rounded-xl shadow-sm p-6 flex flex-col gap-4">
            {/* Hotel header — the name + star class + rating + location, moved
                down here from the (now removed) top card so the room choice leads
                the page and the hotel's own details live with the rest of its info. */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">{hotel.name}</h2>
                <AccommodationStar rating={hotel.stars} offerName={hotel.name} offerId={hotel.id} size={16} />
              </div>
              <div className="flex items-center gap-3 flex-wrap text-sm text-foreground">
                <RatingBlock reviewScore={hotel.rating} reviewCount={hotel.reviewCount} />
                <span className="flex items-center gap-1 text-grey">
                  <MapPin size={14} className="shrink-0" aria-hidden="true" />
                  {city}
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] h-[260px] md:h-[360px] gap-2">
                <div
                  className="relative overflow-hidden rounded-xl group cursor-pointer"
                  onClick={() => setPhotosOpen(true)}
                >
                  <ImageWithPlaceholder
                    src={hotel.image}
                    alt={hotel.name}
                    containerClassName="w-full h-full"
                    className="group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
                  {[SHOWCASE_PHOTOS[0], SHOWCASE_PHOTOS[1], ROOM_IMAGES[0], ROOM_IMAGES[1]].map((src, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-xl cursor-pointer group"
                      onClick={() => setPhotosOpen(true)}
                    >
                      <ImageWithPlaceholder
                        src={src}
                        alt="Hotel photo"
                        containerClassName="w-full h-full"
                        className="group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="secondary" onClick={() => setPhotosOpen(true)} className="absolute bottom-4 right-4">
                ⊞ See all photos
              </Button>
            </div>
          </div>
        </PageContainer>

        {/* ── ABOUT + HIGHLIGHTS + MAP ───────────────────────────────────────── */}
        <PageContainer tier="narrow" className="px-4 md:px-6 pt-8 flex flex-col gap-4">
          <div className="bg-card rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

              {/* LEFT: description + amenity highlights */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-border h-[200px] overflow-hidden">
                  <div className="flex items-center gap-2 text-foreground">
                    <Info size={18} className="shrink-0" aria-hidden="true" />
                    <span className="font-bold text-sm">About the hotel</span>
                  </div>
                  <p className="text-sm text-foreground leading-normal flex-1 overflow-hidden">
                    {desc.short} {desc.long}
                  </p>
                  <Button
                    variant="link"
                    onClick={() => setDescriptionOpen(true)}
                    className="text-xs font-semibold h-auto p-0 self-start shrink-0"
                  >
                    Read more about the hotel
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3.5 py-2"
                      >
                        {amenity === "Free Wifi" || amenity === "Free WiFi" ? (
                          <Wifi size={14} className="text-primary shrink-0" aria-hidden="true" />
                        ) : amenity === "Indoor pool" || amenity === "Outdoor pool" || amenity === "Beachfront" ? (
                          <Waves size={14} className="text-primary shrink-0" aria-hidden="true" />
                        ) : amenity === "Gym" ? (
                          <Dumbbell size={14} className="text-primary shrink-0" aria-hidden="true" />
                        ) : (
                          <Check size={14} className="text-primary shrink-0" aria-hidden="true" />
                        )}
                        <span className="text-sm text-foreground font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: map + getting around */}
              <div className="flex flex-col gap-4">
                {/* `isolate` creates a stacking context so Leaflet's high
                    internal z-indexes (map panes/controls go up to ~1000) stay
                    trapped inside this box and can't paint over the sticky
                    summary bar (z-30) when you scroll. */}
                <div className="isolate rounded-xl overflow-hidden h-[200px] relative border border-border">
                  <LeafletMap
                    center={coords}
                    zoom={13}
                    markers={[{ id: hotel.id, lat: coords[0], lng: coords[1], label: hotel.name }]}
                    className="w-full h-full"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMapOpen(true)}
                    className="absolute top-2 right-2 z-[400] bg-card/95 backdrop-blur-sm shadow-sm text-primary hover:bg-card"
                  >
                    <MapPinned size={12} aria-hidden="true" />
                    Show on map
                  </Button>
                </div>

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
        </PageContainer>

        {/* ── REVIEWS ────────────────────────────────────────────────────────── */}
        <PageContainer tier="narrow" className="px-4 md:px-6 py-8 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-foreground">Guest reviews</h2>
          <div className="bg-card rounded-xl shadow-md flex flex-col md:flex-row gap-5 md:gap-10 p-4 md:py-6 md:pl-6 md:pr-0">
            <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1 md:shrink-0 md:w-[100px]">
              <RatingBlock reviewScore={hotel.rating} reviewCount={hotel.reviewCount} />
            </div>
            <div className="flex flex-col gap-6 flex-1 min-w-0 overflow-hidden">
              <div className="flex flex-row gap-4 overflow-x-auto pb-1 pr-6" style={{ scrollbarWidth: "none" }}>
                {MOCK_REVIEWS.map((review, i) => (
                  <div
                    key={i}
                    className="flex flex-col border border-border rounded-xl p-4 shrink-0 w-[78vw] sm:w-[280px] md:w-[295px] h-[180px]"
                  >
                    <div className="text-base font-bold text-foreground mb-2">
                      {review.score} {review.label}
                    </div>
                    <p className="text-base text-foreground leading-normal flex-1 overflow-hidden">{review.text}</p>
                    <div className="text-sm text-foreground">{review.date}</div>
                    <div className="text-xs text-grey">Verified review</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* ── STICKY BOTTOM SUMMARY ────────────────────────────────────────────
          Same footer style the hotel room-selection page uses: a per-room
          breakdown on the left, the running total on the right, and a single
          CTA. Here the total is the bundled STOPOVER PACKAGE total (tripTotal),
          and the CTA advances to the booking-summary review step. Appears once
          any room is selected; the CTA stays disabled (with an explanatory
          tooltip) until every room is chosen and every traveller allocated. */}
      {someRoomsSelected && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
          <PageContainer tier="standard" className="px-4 md:px-8 lg:px-[60px] py-3 md:py-4">

            {/* Mobile layout: compact room pills, then total + button */}
            <div className="flex flex-col gap-2 sm:hidden">
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
                        Room {index + 1} <Users size={12} aria-hidden="true" /> {getTotalGuests(config)}:
                      </span>
                      <span className="text-xs text-foreground truncate min-w-0">
                        {sel ? sel.room.name : <span className="text-grey italic">Selecting now</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <StopoverPackageLabel />
                  <span className="text-foreground font-bold text-base">€{tripTotal.toLocaleString()}</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => !ctaDisabled && handleGoToBookingSummary()}
                      aria-disabled={ctaDisabled}
                      className={cn(
                        "inline-flex shrink-0 px-4 py-2.5 rounded-lg font-bold text-sm transition-all select-none items-center gap-2",
                        !ctaDisabled
                          ? "bg-primary hover:brightness-85 text-white cursor-pointer shadow-lg"
                          : "bg-border text-grey cursor-not-allowed"
                      )}
                    >
                      Go to booking summary
                    </span>
                  </TooltipTrigger>
                  {ctaDisabled && (
                    <TooltipContent side="top" sideOffset={8}>
                      {ctaDisabledReason}
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>

            {/* Desktop layout: per-room breakdown left, total + CTA right */}
            <div className="hidden sm:flex items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-grey text-xs font-semibold uppercase tracking-wide">Room selection</span>
                {localRoomConfig.map((config, index) => {
                  const sel = roomSelections[config.id];
                  const cancelLabel = sel?.room.cancellationPolicies.find((p) => p.id === sel.cancelOption)?.label;
                  const boardLabel = sel?.room.extras.find((p) => p.id === sel.extraOption)?.label;
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
                        {getTotalGuests(config)}:
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

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <StopoverPackageLabel />
                  <span className="text-foreground font-bold text-2xl">€{tripTotal.toLocaleString()}</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => !ctaDisabled && handleGoToBookingSummary()}
                      aria-disabled={ctaDisabled}
                      className={cn(
                        "inline-flex px-6 py-3 rounded-lg font-bold text-base transition-all select-none items-center gap-2",
                        !ctaDisabled
                          ? "bg-primary hover:brightness-85 text-white cursor-pointer shadow-lg"
                          : "bg-border text-grey cursor-not-allowed"
                      )}
                    >
                      Go to booking summary
                    </span>
                  </TooltipTrigger>
                  {ctaDisabled && (
                    <TooltipContent side="top" sideOffset={8}>
                      {ctaDisabledReason}
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          </PageContainer>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* All photos */}
      <Dialog open={photosOpen} onOpenChange={setPhotosOpen}>
        <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{hotel.name} — photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {[hotel.image, ...SHOWCASE_PHOTOS, ...ROOM_IMAGES].map((url, i) => (
              <div key={i} className="overflow-hidden rounded-xl aspect-[4/3]">
                <ImageWithPlaceholder src={url} alt={`Photo ${i + 1}`} containerClassName="w-full h-full" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* About the hotel */}
      <Dialog open={descriptionOpen} onOpenChange={setDescriptionOpen}>
        <DialogContent className="max-w-[640px]">
          <DialogHeader>
            <DialogTitle>About {hotel.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2 text-base text-foreground leading-normal">
            <p>{desc.short} {desc.long}</p>
            <p>
              {hotel.name} is a {hotel.stars}-star property in {city}, with a guest rating of{" "}
              {hotel.rating.toFixed(1)}/10 based on {hotel.reviewCount.toLocaleString()} reviews.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{hotel.name} — {city}</DialogTitle>
          </DialogHeader>
          <div className="h-[460px] w-full mt-2">
            <LeafletMap
              center={coords}
              zoom={14}
              markers={[{ id: hotel.id, lat: coords[0], lng: coords[1], label: hotel.name }]}
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
