// EditableFlightSearch — the collapsed "search at a glance" row that expands
// into the full search form *in place*, then folds back.
//
// The three states, and what each control does:
//   1. Collapsed → <FlightTripSummary> with an "Edit search" button. Clicking
//      Edit ONLY reveals the form below — it never re-runs the search.
//   2. Expanded  → <FlightSearchForm>, pre-filled from the current criteria.
//        • "Update search" submits the form and re-runs the search (via
//          onUpdateSearch). This is the only control that retriggers a search.
//        • the folding chevron (▲) collapses back to the summary WITHOUT
//          changing anything — any unsaved edits are discarded because the form
//          re-seeds from `criteria` the next time it opens.
//
// Used both on the flight results page and on every stopover-flow step, so the
// edit experience is identical everywhere.

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { FlightSearchForm } from "./FlightSearchForm";
import { FlightTripSummary } from "./FlightTripSummary";
import type { FlightSearchCriteria } from "../../../../App";

type EditableFlightSearchProps = {
  criteria: FlightSearchCriteria;
  // Fired only when the user clicks "Update search" in the expanded form —
  // the parent commits the new criteria and re-runs the search.
  onUpdateSearch: (next: FlightSearchCriteria) => void;
};

export function EditableFlightSearch({ criteria, onUpdateSearch }: EditableFlightSearchProps) {
  // Whether the editable form is showing. Starts collapsed — the page lands on
  // the at-a-glance summary, and the user opts into editing.
  const [expanded, setExpanded] = useState(false);

  // ── Collapsed ──────────────────────────────────────────────────────────
  // The read-only summary. Its "Edit search" button just flips `expanded`; it
  // does NOT call onUpdateSearch, so nothing is re-run yet.
  if (!expanded) {
    return (
      <FlightTripSummary criteria={criteria} onEditSearch={() => setExpanded(true)} />
    );
  }

  // ── Expanded ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {/* Header row: a label on the left, and the folding chevron on the right
          that collapses back to the summary without changing the criteria. */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold text-foreground">Edit search</span>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label="Collapse search criteria"
          className="flex items-center justify-center size-8 rounded-lg text-grey hover:bg-grey-lightest hover:text-foreground transition-colors"
        >
          <ChevronUp size={18} aria-hidden="true" />
        </button>
      </div>

      {/* The full search form, pre-filled from the live criteria. Submitting it
          ("Update search") is what actually re-runs the search. */}
      <FlightSearchForm
        initialCriteria={criteria}
        // Keep the stopover-only form when this search came from the Stopover
        // tab, so an edit can't drop back to the normal flights form.
        stopoverMode={!!criteria.stopoverOnly}
        submitLabel="Update search"
        onSearch={(next) => {
          setExpanded(false);
          onUpdateSearch(next);
        }}
      />
    </div>
  );
}
