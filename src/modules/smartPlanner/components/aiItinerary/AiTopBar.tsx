// AiTopBar — the top chrome on the Conversation + Canvas screen.
//
// Just a back link — same `BackButton` and "Back to discovery" label used on
// every other page that returns to the AI Experience hero (HotelListPage,
// HolidayListPage, ActivityListPage, FlightListPage). Keeping it minimal so
// the conversation + canvas split below has all the visual real estate.

import { BackButton } from "../../../../shared/components/BackButton";

interface AiTopBarProps {
  onBack: () => void;
}

export default function AiTopBar({ onBack }: AiTopBarProps) {
  return (
    <div className="bg-card border-b border-border px-4 md:px-6 py-3 shrink-0">
      <BackButton label="Back to discovery" onClick={onBack} />
    </div>
  );
}
