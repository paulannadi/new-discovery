// AiSuggestionChips — the row of round suggestion pills that sits between
// the chat transcript and the composer. Driven by `pendingActions` in the
// plan state, so the available chips rotate as the user accepts options.
//
// A final fixed "Continue to checkout" chip is always rendered at the end
// so the user can short-circuit to checkout from any state. It's styled
// with the primary variant so it visually reads as the commit action,
// distinct from the neutral AI-suggestion chips next to it.

import type { ReactNode } from "react";

import type { ActionId } from "./useAiPlanState";
import { getActionLabel } from "./useAiPlanState";

interface AiSuggestionChipsProps {
  actions: ActionId[];
  onPickAction: (id: ActionId) => void;
  onCheckout: () => void;
}

export default function AiSuggestionChips({
  actions,
  onPickAction,
  onCheckout,
}: AiSuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 px-5 py-2.5">
      {actions.map((id) => (
        <SuggestionChip key={id} onClick={() => onPickAction(id)}>
          {getActionLabel(id)}
        </SuggestionChip>
      ))}
      <SuggestionChip onClick={onCheckout} variant="primary">
        Continue to checkout
      </SuggestionChip>
    </div>
  );
}

// One pill. `neutral` matches AI suggestions; `primary` highlights the
// commit-to-checkout action so the user can spot it among the suggestions.
function SuggestionChip({
  children,
  onClick,
  variant = "neutral",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "neutral" | "primary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-xs font-semibold rounded-full px-3 py-1.5 transition-colors border",
        variant === "primary"
          ? "bg-primary text-primary-foreground border-primary hover:brightness-90"
          : "bg-card text-foreground border-border hover:border-primary hover:text-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
