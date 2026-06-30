// AiCanvasCheckoutModal — two-stage booking modal.
//
//   stage = "open"      → review the trip + price → "Confirm & book"
//   stage = "confirmed" → success state with confirmation number + CTAs
//
// Driven by a stage prop owned by ConversationScreen so the modal can stay
// stateless.

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Check,
  ChevronLeft,
  Plus,
  Sparkles,
  Tag,
  Wallet,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../../shared/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Button } from "../../../../shared/components/ui/button";
import { ImageWithPlaceholder } from "../../../../shared/components/loading";
import { formatEuros, type PlanState } from "./useAiPlanState";
import type { TimelineItem } from "../../utils/seedTimeline";

// Pull a human-readable title out of any TimelineItem. The shape differs
// per `kind`, so we centralise the formatting here rather than scattering
// switches through the JSX.
function itemTitle(it: TimelineItem): string {
  if (it.kind === "flight") return `${it.flight.from} → ${it.flight.to} · ${it.flight.airline}`;
  if (it.kind === "accommodation") return `${it.hotel.name} · ${it.nights} night${it.nights !== 1 ? "s" : ""}`;
  if (it.kind === "activity") return it.title;
  return `${it.vehicle}: ${it.from} → ${it.to}`;
}

function itemPrice(it: TimelineItem): string {
  if (it.kind === "flight") return it.flight.price || "";
  if (it.kind === "accommodation") return it.hotel.price > 0 ? `€${it.hotel.price}/nt` : "";
  if (it.kind === "activity") return it.price ?? "";
  return "";
}

export type CheckoutStage = "closed" | "open" | "confirmed";

interface AiCanvasCheckoutModalProps {
  state: PlanState;
  spent: number;
  stage: CheckoutStage;
  onCancel: () => void;
  onConfirm: () => void;
  onNewTrip: () => void;
}

// Lisbon thumbnail — same as elsewhere in the canvas.
const LISBON_THUMB =
  "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=700&q=70";

export default function AiCanvasCheckoutModal({
  state,
  spent,
  stage,
  onCancel,
  onConfirm,
  onNewTrip,
}: AiCanvasCheckoutModalProps) {
  // Generate a stable confirmation number for the success state. Computed
  // in an effect when the modal transitions into "confirmed" so the random
  // value never runs in the render path and stays stable across re-renders.
  const [confirmationNumber, setConfirmationNumber] = useState("");
  useEffect(() => {
    if (stage === "confirmed") {
      setConfirmationNumber(
        "WB-" + (Math.floor(Math.random() * 900000) + 100000).toString(),
      );
    }
  }, [stage]);

  const allItems = state.items;
  const dateRange = `${format(state.trip.startDate, "EEE dd MMM")} – ${format(state.trip.endDate, "dd MMM")}`;
  const span = `${state.trip.nights + 1} days, ${state.trip.nights} nights · ${state.trip.travelersLabel}`;

  return (
    <Dialog
      open={stage !== "closed"}
      onOpenChange={(open) => {
        if (!open && stage !== "confirmed") onCancel();
      }}
    >
      <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden">
        {stage === "open" && (
          <>
            <div className="px-6 pt-5 pb-4 border-b border-border flex items-center gap-3">
              <DialogTitle className="text-xl font-extrabold tracking-tight flex-1">
                Confirm and book
              </DialogTitle>
              <VisuallyHidden.Root>
                <DialogDescription>
                  Review the items in your trip and confirm to book.
                </DialogDescription>
              </VisuallyHidden.Root>
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                onClick={onCancel}
                aria-label="Close"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center gap-3.5 p-3.5 bg-grey-lightest rounded-2xl mb-5">
                <ImageWithPlaceholder
                  src={LISBON_THUMB}
                  alt={state.trip.title}
                  containerClassName="size-[60px] shrink-0"
                  rounded="rounded-xl"
                  className="size-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-base font-extrabold truncate">
                    {state.trip.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {dateRange} · {span}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Total
                  </div>
                  <div className="text-xl font-extrabold">{formatEuros(spent)}</div>
                </div>
              </div>

              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Including
              </div>
              <div className="flex flex-col gap-1.5 mb-5">
                {allItems.slice(0, 6).map((it) => (
                  <div key={it.id} className="flex items-center gap-2.5 text-sm">
                    <Tag className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="flex-1 text-foreground truncate">
                      {itemTitle(it)}
                    </span>
                    <span className="text-muted-foreground shrink-0">{itemPrice(it)}</span>
                  </div>
                ))}
                {allItems.length > 6 && (
                  <div className="text-xs text-muted-foreground pl-5">
                    + {allItems.length - 6} more items
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-success/10 border border-success/30 rounded-lg text-success text-sm font-semibold">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Free cancellation until 5 days before departure.
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-between items-center gap-3">
              <Button variant="ghost" onClick={onCancel}>
                <ChevronLeft className="size-3.5" aria-hidden="true" />
                Keep editing
              </Button>
              <Button size="lg" onClick={onConfirm}>
                Confirm &amp; book · {formatEuros(spent)}
              </Button>
            </div>
          </>
        )}

        {stage === "confirmed" && (
          <div className="px-8 py-10 text-center">
            <VisuallyHidden.Root>
              <DialogTitle>Booking confirmed</DialogTitle>
              <DialogDescription>
                Your Lisbon trip is booked.
              </DialogDescription>
            </VisuallyHidden.Root>
            <div className="size-16 rounded-full bg-success text-white inline-flex items-center justify-center mx-auto mb-4 shadow-md">
              <Check className="size-8" strokeWidth={3} aria-hidden="true" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight mb-2">
              You're going to Lisbon.
            </div>
            <div className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              Confirmation{" "}
              <strong className="text-foreground font-semibold">
                #{confirmationNumber}
              </strong>{" "}
              is on its way to your inbox.
              <br />
              We'll send check-in details 7 days before you fly.
            </div>
            <div className="flex flex-col gap-2 items-stretch max-w-[340px] mx-auto text-left mb-7">
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-grey-lightest rounded-lg text-sm">
                <Calendar className="size-3.5" aria-hidden="true" />
                <span>{dateRange}</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-grey-lightest rounded-lg text-sm">
                <Wallet className="size-3.5" aria-hidden="true" />
                <span>{formatEuros(spent)} charged to your card</span>
              </div>
            </div>
            <div className="flex gap-2.5 justify-center">
              <Button variant="secondary" onClick={onCancel}>
                Back to itinerary
              </Button>
              <Button onClick={onNewTrip}>
                <Plus className="size-3.5" aria-hidden="true" />
                Plan another trip
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
