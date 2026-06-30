import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:brightness-85",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "border border-primary bg-background text-primary shadow-xs hover:bg-primary hover:text-primary-foreground dark:bg-input/30 dark:border-primary dark:hover:bg-primary",
        // tertiary — quieter still than secondary. Neutral grey border
        // (the default `border` colour token) with primary text, no shadow,
        // and a soft grey-light fill on hover. Spec'd in
        // DESIGN_SYSTEM.md §2.1 — was previously referenced in code
        // (e.g. <Button variant="tertiary">) but never implemented, so it
        // rendered as unstyled plain text.
        tertiary:
          "border bg-background text-primary hover:bg-grey-light hover:border-transparent dark:bg-input/30",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        inverted:
          "bg-white/15 backdrop-blur-md text-white border border-white/20 hover:bg-white/25",
      },
      size: {
        // Regular — the default for most actions. 40px · 14px · semibold · 10px radius · 16px icons.
        default:
          "h-10 rounded-lg px-5 text-sm font-semibold has-[>svg]:px-4 [&_svg:not([class*='size-'])]:size-4",
        // Small — compact / inline. 32px · 12px · medium · 8px radius.
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-4",
        // Smallest — dense / inline. 24px · 12px · medium · 8px radius · 14px icons.
        xs: "h-6 rounded-md gap-1 px-2.5 has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3.5",
        // Biggest CTA — hero search & primary commit. Scales up: 52px · 16px · bold · 14px radius · 20px icons.
        lg: "h-13 rounded-xl px-7 gap-2.5 text-base font-bold has-[>svg]:px-6",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
