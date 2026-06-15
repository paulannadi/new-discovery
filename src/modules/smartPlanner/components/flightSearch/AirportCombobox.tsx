// AirportCombobox — searchable city/airport picker used by the Flights tab.
//
// Why a custom combobox instead of a plain <input>?
//   • Users almost always want to pick from a known list, not type free text
//   • We want to show the city name (familiar) AND the IATA code (precise)
//   • Storing the IATA code keeps it tidy on the result cards' times bar
//
// HOW IT'S BUILT
// ──────────────
// shadcn pattern: a Popover (the floating panel) wrapping a Command (cmdk's
// keyboard-friendly searchable list). The trigger is a styled button that
// looks identical to the existing form inputs so dropping it into the form
// is a visual no-op.
//
// The control is fully controlled:
//   • `value`     — the IATA code currently chosen (e.g. "LHR"), or "" if none
//   • `onChange`  — fires with the new code when the user picks an option
//
// We render the trigger to match the existing inline-label input style:
//   ┌────────────────────────────────────┐
//   │ ✈  FROM                            │
//   │    London (LHR)                    │
//   └────────────────────────────────────┘

import { useState } from "react";
import { Plane, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../shared/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../../shared/components/ui/command";
import { cn } from "../../../../shared/components/ui/utils";
import {
  AIRPORTS,
  REGION_ORDER,
  airportDisplayLabel,
  type AirportRegion,
} from "./airports";

export type AirportComboboxProps = {
  // The IATA code currently selected ("LHR") or "" if none.
  value: string;
  onChange: (code: string) => void;
  // Top-line micro-label inside the trigger ("FROM" / "TO").
  label: string;
  // Empty-state placeholder shown when no city is chosen.
  placeholder?: string;
  // Whether the plane icon should be flipped (down-arrow) for the destination.
  iconRotated?: boolean;
  // Smaller styling for the multi-city rows.
  size?: "default" | "compact";
  // Optional whitelist of IATA codes. When provided, the picker only offers
  // these airports (used by the Stopover tab to restrict to Fiji's network).
  // Omitted everywhere else, so the full catalogue shows as before.
  allowedCodes?: string[];
};

export function AirportCombobox({
  value,
  onChange,
  label,
  placeholder = "Select city",
  iconRotated = false,
  size = "default",
  allowedCodes,
}: AirportComboboxProps) {
  const [open, setOpen] = useState(false);

  // When a whitelist is passed, narrow the catalogue to just those codes first.
  // Otherwise use the full list.
  const catalogue = allowedCodes
    ? AIRPORTS.filter((a) => allowedCodes.includes(a.code))
    : AIRPORTS;

  // We pre-group airports by region so the user sees big regional headings
  // (Europe, Middle East, …) instead of one long flat list. Computed once
  // up-top so the JSX below stays readable.
  const byRegion = REGION_ORDER.map((region) => ({
    region,
    airports: catalogue.filter((a) => a.region === region),
  })).filter((g) => g.airports.length > 0);

  const display = airportDisplayLabel(value);
  const isCompact = size === "compact";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          // Matches the existing inline-label input wrapper used on the Flights
          // form. We swap focus styling for an `aria-expanded` state so the
          // trigger reads as a button, not a text field.
          className={cn(
            "w-full flex items-center gap-3 rounded-xl border bg-white text-left transition-all hover:border-primary",
            "data-[state=open]:border-primary",
            isCompact ? "h-[52px] px-4" : "h-[52px] px-4",
            open ? "border-primary" : "border-border",
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
          data-state={open ? "open" : "closed"}
        >
          <Plane
            size={isCompact ? 16 : 18}
            className={cn("text-primary shrink-0", iconRotated && "rotate-90")}
            aria-hidden="true"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
              {label}
            </span>
            <span
              className={cn(
                "text-sm font-semibold truncate",
                value ? "text-foreground" : "text-grey font-normal",
              )}
            >
              {display || placeholder}
            </span>
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[320px]"
        align="start"
        sideOffset={6}
      >
        <Command>
          <CommandInput placeholder="Search city, airport or code…" />
          <CommandList className="max-h-[320px]">
            <CommandEmpty>No airports match that search.</CommandEmpty>

            {byRegion.map(({ region, airports }) => (
              <AirportGroup
                key={region}
                region={region}
                airports={airports}
                selected={value}
                onPick={(code) => {
                  onChange(code);
                  setOpen(false);
                }}
              />
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// One region heading + its airports. Split out only because it cleans up
// the main JSX — has no state of its own.
function AirportGroup({
  region,
  airports,
  selected,
  onPick,
}: {
  region: AirportRegion;
  airports: typeof AIRPORTS;
  selected: string;
  onPick: (code: string) => void;
}) {
  return (
    <CommandGroup heading={region}>
      {airports.map((a) => (
        <CommandItem
          key={a.code}
          // cmdk filters items by matching this `value` string against the
          // search query. Including city, airport, country AND code means a
          // user can find "Heathrow" by typing the name OR "LHR" OR "London"
          // — whichever they remember.
          value={`${a.city} ${a.airport ?? ""} ${a.country} ${a.code}`}
          onSelect={() => onPick(a.code)}
          className="flex items-center justify-between gap-2"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {a.city}
              <span className="text-muted-foreground font-normal"> · {a.country}</span>
            </span>
            {a.airport && (
              <span className="text-xs text-muted-foreground truncate">
                {a.airport}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-extrabold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {a.code}
            </span>
            {selected === a.code && (
              <Check size={14} className="text-primary" aria-hidden="true" />
            )}
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
