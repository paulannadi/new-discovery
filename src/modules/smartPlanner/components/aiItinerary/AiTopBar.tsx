// AiTopBar — the top chrome on the Conversation + Canvas screen.
//
// Holds the back-out CTA, an "AI Experience" decorative pill (matches the
// toggle on Discovery so the user never feels they've left "AI mode"), the
// current trip title, and the Share + New trip actions on the right.

import { ArrowLeft, Compass, Plus, Share2, Sparkles } from "lucide-react";

import { Button } from "../../../../shared/components/ui/button";

interface AiTopBarProps {
  tripTitle: string;
  onNewTrip: () => void;
  onShare: () => void;
  onBack: () => void;
}

export default function AiTopBar({
  tripTitle,
  onNewTrip,
  onShare,
  onBack,
}: AiTopBarProps) {
  return (
    <div className="bg-card border-b border-border px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4 shrink-0">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        <span className="hidden md:inline">Back</span>
      </Button>

      <div className="hidden md:block w-px h-5 bg-border" />

      {/* Decorative AI pill — matches the one on Discovery so the user
          knows they're still in AI Experience. */}
      <div className="hidden md:inline-flex items-center gap-2 bg-grey-lightest border border-border rounded-full pl-3 pr-3 py-1.5 text-xs font-bold text-foreground">
        <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
        AI Experience
      </div>

      <div className="hidden md:block w-px h-5 bg-border" />

      {/* Trip title chip */}
      <div className="flex items-center gap-2 text-xs text-grey min-w-0">
        <Compass className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">
          <strong className="text-foreground font-extrabold">
            {tripTitle}
          </strong>
        </span>
      </div>

      <div className="flex-1" />

      <Button variant="ghost" size="sm" onClick={onNewTrip}>
        <Plus className="size-3.5" aria-hidden="true" />
        <span className="hidden md:inline">New trip</span>
      </Button>

      <Button variant="ghost" size="sm" onClick={onShare}>
        <Share2 className="size-3.5" aria-hidden="true" />
        <span className="hidden md:inline">Share</span>
      </Button>
    </div>
  );
}
