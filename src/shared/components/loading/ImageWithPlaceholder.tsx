// ─────────────────────────────────────────────────────────────────────────────
// ImageWithPlaceholder
//
// Wrapper around <img> that implements the doc's "Lazy Loading" pattern:
//
//   • Reserves space using aspect-ratio so the layout never jumps when the
//     real image loads (Core Web Vital: CLS < 0.1).
//   • Shows a bg-muted placeholder until the image is ready.
//   • Fades the image in over 300ms once it's loaded.
//   • Uses native loading="lazy" by default — browser handles the actual
//     viewport-based loading with zero JS cost.
//   • Allows priority loading (above-the-fold) by passing `priority`.
//     Per the doc: "the first 2-3 images on any page should NOT be lazy".
//
// Usage:
//   <ImageWithPlaceholder src={hotel.image} alt={hotel.name} aspectRatio="4/3" />
//   <ImageWithPlaceholder src={hero} alt="hero" priority className="..." />
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { cn } from "../ui/utils";

interface ImageWithPlaceholderProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "loading"> {
  // CSS aspect-ratio string ("4/3", "16/9", "1/1"). Use this OR explicit
  // width/height — either approach reserves space.
  aspectRatio?: string;
  // Eager-load above-the-fold images (hero, first 2-3 cards). Per the doc,
  // lazy loading the hero image hurts perceived performance.
  priority?: boolean;
  // CSS classes applied to the wrapping <div>. The image inside stretches
  // to fill the wrapper.
  containerClassName?: string;
  // Optional rounded corners on the wrapping div + image. Convenience prop
  // since most of our images are inside rounded cards.
  rounded?: string;
}

export function ImageWithPlaceholder({
  src,
  alt,
  aspectRatio,
  priority = false,
  containerClassName,
  rounded,
  className,
  onLoad,
  ...rest
}: ImageWithPlaceholderProps) {
  // Track load state locally so we can crossfade. Starts false (placeholder
  // visible), flips to true on the img's onLoad event.
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        rounded,
        containerClassName,
      )}
      // Inline style for aspect-ratio because Tailwind's aspect-ratio
      // utilities require enumeration; a string prop is more flexible.
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <img
        src={src}
        alt={alt}
        // Native browser lazy-loading. Eager for above-the-fold images.
        loading={priority ? "eager" : "lazy"}
        // decoding="async" lets the browser decode off the main thread —
        // small but free perf win for image-heavy pages like Discovery.
        decoding="async"
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={cn(
          "w-full h-full object-cover",
          // Crossfade: hidden while loading, fade in over 300ms once ready.
          // Using opacity + transition is GPU-cheap and respects reduced
          // motion (a 300ms opacity fade is below the perceptible threshold).
          "transition-opacity duration-300 ease-out",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        {...rest}
      />
    </div>
  );
}
