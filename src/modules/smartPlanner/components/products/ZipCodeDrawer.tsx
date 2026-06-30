// ─────────────────────────────────────────────────────────────────────────────
// ZipCodeDrawer
//
// Right-side sheet that opens when the user clicks "Update ZIP code" on a
// door-to-door TransferCard (the "Individual" travel option on coach tours).
// There's no coach seat to pick — the traveller is collected from their own
// address — so instead of a seat chart this drawer just lets them edit the
// pickup ZIP code. Confirm fires `onConfirm` with the new value and closes.
//
// It mirrors SeatChartDrawer's layout (header / scrollable body / pinned
// footer, pulled into a comfortable reading column) so the two "edit this
// transfer" flows feel like siblings.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { MapPin, Check } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../../../shared/components/ui/button";
// Mock "ZIP code → city" resolver — confirms the typed ZIP back to the user.
import { lookupCityFromZip } from "../../utils/zipLookup";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../../../shared/components/ui/sheet";

interface ZipCodeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from: string;
  to: string;
  date: Date;
  // The ZIP code currently on file — pre-fills the input when the drawer
  // opens. Empty string is fine (shows the placeholder).
  currentZip?: string;
  // Fires with the new ZIP code when the user confirms. The drawer closes
  // itself afterwards.
  onConfirm?: (zip: string) => void;
}

export function ZipCodeDrawer({
  open,
  onOpenChange,
  from,
  to,
  date,
  currentZip = "",
  onConfirm,
}: ZipCodeDrawerProps) {
  // Local draft of the ZIP so the user can edit freely and only commit on
  // Confirm. We re-sync it from `currentZip` each time the drawer opens so
  // it always reflects the latest saved value.
  const [draft, setDraft] = useState(currentZip);
  useEffect(() => {
    if (open) setDraft(currentZip);
  }, [open, currentZip]);

  // City resolved from the draft ZIP (mock lookup). Null until a full, known
  // ZIP is entered.
  const city = lookupCityFromZip(draft);

  const handleConfirm = () => {
    onConfirm?.(draft.trim());
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Narrower than the seat chart (a single field needs far less room)
          but the same full-screen-on-mobile behaviour. */}
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl flex flex-col gap-0 p-0 bg-grey-lightest"
      >
        <SheetHeader className="px-5 sm:px-8 pt-6 sm:pt-8 pb-2">
          <div className="max-w-lg mx-auto w-full">
            <SheetTitle className="text-2xl md:text-3xl font-extrabold text-foreground">
              Update pickup ZIP code
            </SheetTitle>
            <SheetDescription className="sr-only">
              Edit the ZIP code where the door-to-door transfer will collect you.
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Scrollable body — trip context + the ZIP-code field. */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 pb-6">
          <div className="max-w-lg mx-auto space-y-4">
            {/* Trip context — same style as the seat drawer's header line. */}
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                Bus: {from} to {to}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(date, "EEE, dd MMM yyyy")}
              </p>
            </div>

            {/* ZIP card — white panel matching the seat-chart card. */}
            <div className="bg-card rounded-3xl shadow-md p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="size-5 text-primary" aria-hidden="true" />
                <span className="font-bold">Door-to-door pickup</span>
              </div>
              <p className="text-xs text-foreground">
                We'll collect you from your area on the morning of departure and
                drop you back here on your return. Your ZIP code helps us plan
                the pickup route.
              </p>

              <label
                htmlFor="pickup-zip"
                className="block text-xs font-bold uppercase tracking-wide text-foreground"
              >
                Pickup ZIP code
              </label>
              <input
                id="pickup-zip"
                type="text"
                inputMode="numeric"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Enter your ZIP code"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
              />

              {/* Resolved city — confirms the ZIP back to the traveller once it
                  matches a known location. */}
              {city && (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Check className="size-4 text-success" aria-hidden="true" />
                  {city}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer — primary action right-aligned, disabled until non-empty. */}
        <SheetFooter className="px-5 sm:px-8 pb-6 sm:pb-8 pt-4 bg-grey-lightest border-t border-border">
          <div className="max-w-lg mx-auto w-full flex justify-end">
            <Button
              onClick={handleConfirm}
              size="lg"
              className="min-w-40"
              disabled={draft.trim().length === 0}
            >
              Save ZIP code
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
