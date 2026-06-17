// StopoverRoomPage — the room-selection step of the stopover flow.
//
// Sits between "pick your stopover hotel" and the Smart Planner:
//   flights → stopover hotel → THIS PAGE (pick a room) → Smart Planner
//
// The PRIMARY job is choosing a room, so the room grid leads the page. The
// SECONDARY job is showing off the hotel the traveller just picked, so a richer
// hotel "showcase" (photos, description, amenities, map, reviews) sits BELOW the
// rooms. This mirrors HotelDetailPage's look, but with the emphasis flipped:
// HotelDetailPage opens with a big hotel hero; here the rooms come first.

import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { differenceInCalendarDays, parseISO } from "date-fns";
// The SAME sticky trip-summary bar the Smart Planner uses, so the breakdown here
// looks identical — flights + stay grouped on the left, price breakdown on the right.
import { StickySummaryBar, type PriceBreakdownLine } from "../components/StickySummaryBar";
import { StopoverPackageLabel } from "../components/StopoverPackageLabel";
import type { TimelineItem } from "../utils/seedTimeline";
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
  onBack,
  onSelectRooms,
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
  // Exits the whole stopover flow back to Discovery. Stepping back to an
  // earlier step (flights / hotel) is handled by the FlightStepper in the
  // header, so this back button consistently says "Back to discovery".
  onBack: () => void;
  // Called once a room is chosen for every guest config — App.tsx then builds
  // the flight+stopover context and moves on to the Smart Planner.
  onSelectRooms: (roomSelections: { [key: number]: RoomSelection | null }) => void;
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

  // One selection slot per guest configuration (a single stopover room here).
  const [roomSelections, setRoomSelections] = useState<{ [id: number]: RoomSelection | null }>(() => {
    const initial: { [id: number]: RoomSelection | null } = {};
    roomConfiguration.forEach((c) => (initial[c.id] = null));
    return initial;
  });

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

  const allRoomsSelected = roomConfiguration.every((c) => roomSelections[c.id] != null);
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

  const handleContinue = () => {
    if (allRoomsSelected) {
      onSelectRooms(roomSelections);
    } else {
      showToast.error("Please select a room to continue");
    }
  };

  // ── Trip-summary data ──────────────────────────────────────────────────────
  // Cheapest room rate in this hotel (per person, per night). The cheapest room
  // sits exactly on the package floor; a pricier room adds its premium.
  const minRoomRate = rooms.length ? Math.min(...rooms.map((r) => r.basePrice)) : 0;
  // Trip total = package floor + the chosen room's premium over the cheapest
  // room, scaled by guests × nights. All-cheapest path stays at the anchor.
  const roomPremium = Math.max(0, (totalPrice - minRoomRate)) * totalGuests * nights;
  const tripTotal = packageFloor + roomPremium;

  // The stopover hotel checks in on the first flight's date. We derive the trip
  // span (for the bar's "X nights · Y adults" line) from the first/last legs.
  const firstLegDate = flightLegs[0]?.dateISO ? parseISO(flightLegs[0].dateISO) : new Date();
  const lastLegDate = flightLegs[flightLegs.length - 1]?.dateISO
    ? parseISO(flightLegs[flightLegs.length - 1].dateISO!)
    : firstLegDate;
  const tripNights = Math.max(1, differenceInCalendarDays(lastLegDate, firstLegDate));

  // Build the timeline items the bar renders on the left: one row per flight
  // leg, then the stopover stay. Same TimelineItem shape the Smart Planner uses.
  const summaryItems: TimelineItem[] = [
    ...flightLegs.map((leg, i) => ({
      kind: "flight" as const,
      id: `summary-flight-${i}`,
      direction: "leg" as const,
      date: leg.dateISO ? parseISO(leg.dateISO) : firstLegDate,
      flight: {
        from: leg.from,
        to: leg.to,
        stops: "",
        duration: leg.duration,
        airline: leg.airline,
        price: "",
      },
    })),
    {
      kind: "accommodation" as const,
      id: "summary-stay",
      checkIn: firstLegDate,
      nights,
      hotel: {
        name: hotel.name,
        image: hotel.image,
        stars: hotel.stars,
        rating: hotel.rating,
        reviewCount: hotel.reviewCount,
        location: city,
        price: totalPrice,
      },
    },
  ];

  // The right-hand "Price breakdown" column. We never itemise flights vs hotel —
  // it's a single bundled package — so this is the one total, labelled with the
  // shared "Stopover package" caption + info bubble.
  const priceBreakdown: PriceBreakdownLine[] = [
    { label: "Stopover package", labelNode: <StopoverPackageLabel />, value: `€${tripTotal.toLocaleString()}` },
  ];

  // Scroll the showcase into view from the "View hotel details" link.
  const scrollToShowcase = () =>
    document.getElementById("hotel-showcase")?.scrollIntoView({ behavior: "smooth" });

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

      {/* ── GREY SECTION — flight stepper + the chosen-hotel card ─────────────
          Both sit on the page's grey background (not inside a white card), just
          like the stepper + title block on the stopover-hotel step. */}
      <div className="bg-grey-lightest">
        <PageContainer tier="narrow" className="px-4 md:px-6 pt-4 pb-3">

          {/* The FlightStepper passed in from App.tsx (✓Flights › ✓Hotel › ● Room). */}
          {headerSlot}

          {/* Slim hotel card — a compact reminder of the hotel they chose, with a
              link down to the full showcase. Room selection is the focus, so the
              hotel stays small here. mt-10 mirrors the hotel step's title spacing. */}
          <div className="mt-10 flex items-center gap-4 rounded-xl border border-border bg-card p-3 sm:p-4">
            <div className="size-16 sm:size-20 shrink-0 overflow-hidden rounded-lg">
              <ImageWithPlaceholder
                src={hotel.image}
                alt={hotel.name}
                containerClassName="w-full h-full"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              {/* "Selected hotel" eyebrow — confirms this is the hotel the
                  traveller just picked, before they move on to choosing a room. */}
              <span className="flex items-center gap-1 text-sm font-bold text-primary">
                <Check size={14} className="shrink-0" aria-hidden="true" />
                Selected hotel
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold text-foreground truncate">{hotel.name}</h1>
                <AccommodationStar rating={hotel.stars} offerName={hotel.name} offerId={hotel.id} size={14} />
              </div>
              <div className="flex items-center gap-2 flex-wrap text-sm text-foreground">
                <RatingBlock reviewScore={hotel.rating} reviewCount={hotel.reviewCount} />
                <span className="flex items-center gap-1 text-grey">
                  <MapPin size={13} className="shrink-0" aria-hidden="true" />
                  {city}
                </span>
              </div>
            </div>
            {/* link variant = navigation action (jump to the showcase below) */}
            <Button
              variant="link"
              onClick={scrollToShowcase}
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary h-auto p-0 shrink-0"
            >
              View hotel details
              <ChevronDown size={14} aria-hidden="true" />
            </Button>
          </div>
        </PageContainer>
      </div>

      {/* ── ROOM SELECTION (primary focus) ───────────────────────────────────── */}
      <PageContainer tier="narrow" className="px-4 md:px-6 pt-8 flex flex-col gap-2">
        {/* "Room for 2 travellers" — totalGuests sums adults + children across
            the whole room configuration. The bed icon sits in the title now. */}
        <h2 className="flex items-center gap-2 font-extrabold text-foreground text-2xl">
          <Bed size={24} className="text-primary shrink-0" aria-hidden="true" />
          Room for {totalGuests} traveller{totalGuests !== 1 ? "s" : ""}
        </h2>
        {/* Context line — ties the room choice back to the stopover stay. */}
        <p className="text-sm text-foreground">
          {nights} night{nights !== 1 ? "s" : ""} in {city}
          {" · "}
          {totalAdults} adult{totalAdults !== 1 ? "s" : ""}
          {totalChildren > 0 && ` · ${totalChildren} child${totalChildren !== 1 ? "ren" : ""}`}
        </p>
      </PageContainer>

      <PageContainer tier="narrow" className="px-4 md:px-6 pt-6 flex flex-col gap-6">
        {roomConfiguration.map((config) => {
          const availableRooms = getAvailableRooms(config);
          const selectedRoom = roomSelections[config.id];
          return (
            <div key={config.id} className="flex flex-col gap-6">
              {isSearching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <SkeletonCard key={n} variant="vertical" />
                  ))}
                </div>
              ) : availableRooms.length > 0 ? (
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
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                  <p className="text-yellow-900 font-bold text-sm">
                    No rooms available for {getTotalGuests(config)} guest{getTotalGuests(config) > 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </PageContainer>

      {/* ══════════════════════════════════════════════════════════════════════
          HOTEL SHOWCASE (secondary) — everything below shows off the hotel.
      ══════════════════════════════════════════════════════════════════════ */}
      <div id="hotel-showcase" className="scroll-mt-4">

        {/* ── PHOTO GALLERY ──────────────────────────────────────────────────── */}
        <PageContainer tier="narrow" className="px-4 md:px-6 pt-12 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-foreground">About this hotel</h2>
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
                <div className="rounded-xl overflow-hidden h-[200px] relative border border-border">
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

      {/* ── STICKY TRIP-SUMMARY BAR ──────────────────────────────────────────
          The SAME bar the Smart Planner uses — flights + stay grouped on the
          left, price breakdown on the right — so the structure matches exactly.
          Here the primary action is "Continue" (with the running trip total),
          and the price breakdown itemises flights + the stopover hotel. Slides
          up once a room is selected (so we have a hotel price to add). */}
      <StickySummaryBar
        startDate={firstLegDate}
        endDate={lastLegDate}
        adults={totalGuests}
        nights={tripNights}
        totalPriceLabel={`€${tripTotal.toLocaleString()}`}
        items={summaryItems}
        priceBreakdown={priceBreakdown}
        actionLabel={`Continue · €${tripTotal.toLocaleString()}`}
        onAction={handleContinue}
        actionDisabled={!allRoomsSelected}
        show={someRoomsSelected}
      />

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
