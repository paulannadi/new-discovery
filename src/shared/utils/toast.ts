// ─────────────────────────────────────────────────────────────────────────────
// showToast — thin wrapper around react-toastify.
//
// Matches the real TripBuilder's showToast utility exactly:
// each method applies the correct background + border colour for its type.
// ─────────────────────────────────────────────────────────────────────────────

import { toast, type Id } from "react-toastify";

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        borderColor: "var(--success)",
        backgroundColor: "var(--toastify-toast-background-success)",
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      style: {
        borderColor: "var(--destructive)",
        backgroundColor: "var(--toastify-toast-background-error)",
      },
    });
  },

  warning: (message: string) => {
    toast.warning(message, {
      style: {
        borderColor: "var(--warning)",
        backgroundColor: "var(--toastify-toast-background-warning)",
      },
    });
  },

  info: (message: string): Id => {
    return toast.info(message, {
      style: {
        borderColor: "var(--primary)",
        backgroundColor: "var(--toastify-toast-background-info)",
      },
    });
  },

  dismiss: (toastId: Id) => {
    toast.dismiss(toastId);
  },
};
