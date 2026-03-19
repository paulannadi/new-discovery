// BackButton — a consistent tertiary (text-only) navigation button used
// across all list and detail pages. No background, no border — just a
// labelled arrow link in the brand blue colour.
//
// Usage:
//   <BackButton label="Back to discovery" onClick={onBack} />
//   <BackButton label="Back to all hotels" onClick={onBack} />

import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  /** The text shown next to the arrow, e.g. "Back to discovery" */
  label: string;
  /** Called when the user clicks the button */
  onClick: () => void;
  /** Optional extra Tailwind classes — e.g. spacing overrides */
  className?: string;
}

export function BackButton({ label, onClick, className = "" }: BackButtonProps) {
  return (
    // `group` enables the child arrow to animate on hover via group-hover:
    <button
      onClick={onClick}
      className={`group flex items-center gap-1.5 text-[#2681FF] text-[13px] font-bold hover:underline w-fit transition-colors ${className}`}
    >
      {/* Arrow shifts left slightly on hover to feel interactive */}
      <ArrowLeft
        size={15}
        className="group-hover:-translate-x-0.5 transition-transform"
      />
      {label}
    </button>
  );
}
