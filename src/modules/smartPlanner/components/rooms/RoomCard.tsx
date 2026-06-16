// RoomCard.tsx — a single bookable-room card.
//
// Moved out of HotelDetailPage.tsx so both the hotel detail page and the new
// stopover room-selection step render rooms identically. Behaviour is unchanged
// from the original: it shows the room image, sleeping details, a cancellation
// radio group, a board (extras) radio group, the live total price, and a
// Select / Selected button.

import { useState } from "react";
import { cn } from "../../../../shared/components/ui/utils";
import { Button } from "../../../../shared/components/ui/button";
import { ImageWithPlaceholder } from "../../../../shared/components/loading";
import { ChevronLeft, ChevronRight, Bed, Users, Armchair, Check } from "lucide-react";
import type { Room } from "./roomData";

export const RoomCard = ({ room, initialBoard, initialCancellation, onSelect, isSelected, nights, guests = 1, bundleBase }: {
  room: Room,
  initialBoard?: string[],
  initialCancellation?: string[],
  onSelect: (cancelOption: string, extraOption: string) => void,
  isSelected: boolean,
  // How many nights the stay covers — used to show the total price
  nights: number,
  // How many travellers the room is for. The displayed rate is "per person, per
  // night", so the stay total = rate × guests × nights. Defaults to 1 so existing
  // callers that don't pass it keep their previous (per-person) total.
  guests?: number,
  // Stopover flow only: the rest of the package's price (the flights) in euros.
  // When provided, the card shows ONE bundled PACKAGE total
  // (bundleBase + stay total) instead of a standalone per-person hotel rate —
  // because in this flow we never show individual flight/hotel prices. The
  // normal hotel-detail page leaves it undefined and keeps its own pricing.
  bundleBase?: number
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
        <ImageWithPlaceholder
          src={room.image}
          alt={room.name}
          containerClassName="absolute inset-0 w-full h-full"
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
          {bundleBase !== undefined ? (
            // Stopover/package flow — show ONE bundled total for the whole trip
            // (flights + this room), never a separate hotel price.
            <>
              <div className="text-right text-xs text-grey">Package total · {guests} guest{guests !== 1 ? 's' : ''} · {nights} night{nights !== 1 ? 's' : ''}</div>
              <div className="text-right text-lg font-bold text-foreground">
                {bundleBase + totalPrice * guests * nights}€
              </div>
            </>
          ) : (
            // Standalone hotel-detail flow — unchanged per-person rate + stay total.
            <>
              <div className="text-right text-xs text-grey">{totalPrice}€ per person, per night</div>
              {/* Total for the full stay — the rate is per person, per night, so we
                  multiply by both the number of guests AND the number of nights. */}
              <div className="text-right text-sm font-bold text-foreground">
                Total for {guests} guest{guests !== 1 ? 's' : ''} · {nights} night{nights !== 1 ? 's' : ''}: {totalPrice * guests * nights}€
              </div>
            </>
          )}
          {/* default = main action, secondary = already-selected confirmation state */}
          <Button
            onClick={handleBookClick}
            variant={isSelected ? "secondary" : "default"}
            // Selected = solid light-gray bg + dark text (the secondary token's
            // own colours), pinned across hover so it stays stable.
            className={cn(
              "w-full",
              isSelected &&
                "bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            {isSelected && <Check size={16} />}
            {isSelected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  );
};
