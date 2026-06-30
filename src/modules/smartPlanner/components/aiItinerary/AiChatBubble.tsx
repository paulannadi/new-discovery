// AiChatBubble — one message in the conversation panel.
//
// Two visual variants:
//   • role = "user"  → dark filled bubble on the right, "You" avatar.
//   • role = "ai"    → white outlined bubble on the left, Sparkles avatar.
//
// Bold markdown (`**…**`) and italic (`*…*`) render inline. AI bubbles can
// also show an optional "Updated on canvas: …" footer chip that links the
// reply to a change visible on the right-hand canvas.

import { MapPin, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../../../shared/components/ui/utils";
import type { PlanMessage } from "./useAiPlanState";

interface AiChatBubbleProps {
  message: PlanMessage;
}

export default function AiChatBubble({ message }: AiChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex gap-2.5 mb-4", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar — small round pill. Both roles use the brand primary so the
          conversation reads as one accent; the icon/label distinguishes them. */}
      <div
        className="size-7 shrink-0 rounded-full inline-flex items-center justify-center text-xs font-extrabold bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        {isUser ? "You" : <Sparkles className="size-3.5" />}
      </div>

      {/* Bubble — fills the column, max-width keeps the bubble from running
          edge-to-edge on wide screens. */}
      <div
        className={cn(
          "rounded-xl px-3.5 py-3 text-sm leading-relaxed border max-w-[92%]",
          isUser
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-foreground border-border",
        )}
      >
        {/* Body — split on newlines so paragraphs stack. */}
        {message.text.split("\n").map((paragraph, i) => (
          <p
            key={i}
            className={i > 0 ? "mt-2 first:mt-0" : "first:mt-0"}
          >
            {renderInlineMarkdown(paragraph)}
          </p>
        ))}

        {/* Ref footer — small grey card pointing the user at the canvas
            change this reply triggered. AI bubbles only. */}
        {!isUser && message.refCard && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-grey-lightest rounded-md text-xs text-muted-foreground">
            <MapPin className="size-3" aria-hidden="true" />
            Updated on canvas:{" "}
            <strong className="text-foreground font-semibold">
              {message.refCard}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}

// Tiny inline-markdown renderer. Splits on `**…**` (bold) and `*…*` (italic)
// chunks, with everything else passed through verbatim. Not full markdown —
// just enough for the prototype's bold + italic call-outs.
function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*"))
      return (
        <em key={i} className="opacity-85">
          {p.slice(1, -1)}
        </em>
      );
    return <span key={i}>{p}</span>;
  });
}
