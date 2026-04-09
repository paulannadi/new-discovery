// ─────────────────────────────────────────────────────────────────────────────
// Toast — global notification container.
//
// Matches the real TripBuilder toast setup:
// - top-right position
// - 5 second auto-close
// - Lucide icons per type (success, warning, error, info)
// - Slide transition
//
// Add <Toast /> once at the root of the app (in App.tsx) and then call
// showToast.success("...") / showToast.warning("...") anywhere.
// ─────────────────────────────────────────────────────────────────────────────

import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import { Slide, ToastContainer } from "react-toastify";

export function Toast() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      pauseOnHover
      transition={Slide}
      // Custom Lucide icons — same as the real TripBuilder
      icon={({ type }) => {
        switch (type) {
          case "info":
            return <Info className="stroke-[var(--primary)]" />;
          case "error":
            return <CircleX className="stroke-[var(--destructive)]" />;
          case "success":
            return <CircleCheck className="stroke-[var(--success)]" />;
          case "warning":
            return <TriangleAlert className="stroke-[var(--warning)]" />;
          default:
            return null;
        }
      }}
    />
  );
}
