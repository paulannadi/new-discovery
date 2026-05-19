// ─────────────────────────────────────────────────────────────────────────────
// ItineraryBuildLoader
//
// Fullscreen loading screen shown while Smart Planner is being prepared.
// Visual: the word "DISCOVER" in heavy display type, with each letter filled
// by a looping destination video. On desktop the word is one row; on mobile
// it breaks into three stacked rows (DIS / CO / VER) keeping the fill effect.
//
// Technique: the video is a plain DOM <video> behind a white SVG overlay,
// and the overlay has the text shape PUNCHED OUT of it using an SVG <mask>.
// We avoid <foreignObject>+<video> because Chrome/Safari/Firefox each have
// quirks where the video freezes or fails to paint inside SVG content.
// The <text> inside <mask> still renders with the Oi @font-face because
// it lives in the same document as the page styles.
//
// Accessibility:
//   • role="status" + aria-busy + aria-live announces the loading state.
//   • Hidden <span> gives a full sentence to screen readers.
//   • prefers-reduced-motion swaps the <video> for a static poster image
//     inside the same clip — same visual layout, no motion.
// ─────────────────────────────────────────────────────────────────────────────

import { useReducedMotion } from "framer-motion";
import { Button } from "../../../shared/components/ui/button";

// Default video lives in /public/videos/ so Vite serves it from the site root.
// Path is destination-agnostic (DISCOVER is the wordmark, not the clip's
// subject) — swap the file or pass a `videoSrc` prop to change destinations.
//
// We prepend import.meta.env.BASE_URL because vite.config sets `base` to
// "/new-discovery/" for GitHub Pages. Without that prefix the browser
// would request "/videos/…" instead of "/new-discovery/videos/…" → 404.
const BASE = import.meta.env.BASE_URL;
const DEFAULT_VIDEO_SRC = `${BASE}videos/discover.mp4`;
const DEFAULT_POSTER_SRC = `${BASE}videos/discover-poster.jpg`;

type ItineraryBuildLoaderProps = {
  /** Path to the destination video (default: /videos/thailand.mp4). */
  videoSrc?: string;
  /** Static poster used as the reduced-motion fallback. */
  posterSrc?: string;
  /** Called when the user clicks "Skip" — wires the wrapper to dismiss early. */
  onSkip?: () => void;
};

export function ItineraryBuildLoader({
  videoSrc = DEFAULT_VIDEO_SRC,
  posterSrc = DEFAULT_POSTER_SRC,
  onSkip,
}: ItineraryBuildLoaderProps) {
  // Framer Motion's hook reads the OS-level "Reduce motion" preference and
  // re-renders if it changes. We pass the value down so the masked element
  // chooses between <video> (animated) and <img> (static).
  const reducedMotion = useReducedMotion();

  return (
    <section
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Building your itinerary"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6"
    >
      {/* Hidden full-sentence description for screen readers. The visible
          tagline is presentational; this is the announced text. */}
      <span className="sr-only">
        We&rsquo;re building the itinerary of your dreams. This usually takes a few seconds.
      </span>

      {/* ── DESKTOP: one row, full word ──────────────────────────────────── */}
      {/* viewBox height (480) drives how TALL the letters render; the
          aspect-ratio of the row = viewBox.w / viewBox.h. We keep the width
          at 1000 so DISCOVER still fits horizontally, and a narrower
          viewBox-height-to-width ratio makes the rubber-banded letters
          appear taller. */}
      <div className="hidden w-full max-w-6xl md:block">
        <MaskedVideoWord
          word="DISCOVER"
          maskId="discover-mask-desktop"
          viewBox="0 0 1000 480"
          fontSize={480}
          videoSrc={videoSrc}
          posterSrc={posterSrc}
          reducedMotion={Boolean(reducedMotion)}
        />
      </div>

      {/* ── MOBILE: three rows, DIS / CO / VER ──────────────────────────── */}
      {/* viewBox here is 400×320 (aspect 1.25), so at max-w-xs (320px wide)
          each row renders ~256px tall. -space-y-4 (-16px) overlaps the rows
          into each other's top/bottom whitespace so the three words read as
          one tightly-stacked wordmark. The upper limit before we start
          clipping letters is ~19px (whitespace ≈ 25px minus 6px of cover-rect
          overflow that paints solid white above the next row's viewBox); we
          stay just under that with 3px of safety. */}
      <div className="flex w-full max-w-xs flex-col items-center -space-y-4 md:hidden">
        <MaskedVideoWord
          word="DIS"
          maskId="dis-mask-mobile"
          viewBox="0 0 400 320"
          fontSize={320}
          videoSrc={videoSrc}
          posterSrc={posterSrc}
          reducedMotion={Boolean(reducedMotion)}
        />
        <MaskedVideoWord
          word="CO"
          maskId="co-mask-mobile"
          viewBox="0 0 300 320"
          fontSize={320}
          videoSrc={videoSrc}
          posterSrc={posterSrc}
          reducedMotion={Boolean(reducedMotion)}
          // Slightly narrower row — "CO" is two letters so it shouldn't span
          // the full width or it would look much bigger than DIS/VER.
          className="w-3/4"
        />
        <MaskedVideoWord
          word="VER"
          maskId="ver-mask-mobile"
          viewBox="0 0 400 320"
          fontSize={320}
          videoSrc={videoSrc}
          posterSrc={posterSrc}
          reducedMotion={Boolean(reducedMotion)}
        />
      </div>

      {/* Tagline — body font (Mulish), bold-ish weight, scales with viewport.
          Very tight top margin so it reads as part of the wordmark, not a
          separate block. Sized up one step so it reads more like a headline
          paired with the wordmark than supporting copy below it. */}
      {/* relative + z-10 is intentional: the masked rows above are
          position: relative (to anchor their video + SVG layers), which
          makes them paint AFTER static siblings. Without this z-index, the
          white cover-rect overflow at the bottom of the last row would
          paint over the top of this tagline once the negative margin pulls
          it up into that zone. */}
      <p className="relative z-10 -mt-4 max-w-md text-center text-2xl font-bold text-foreground md:-mt-8 md:text-3xl">
        We&rsquo;re building the itinerary of your dreams&hellip;
      </p>

      {/* Dev / demo escape hatch. Hidden when no onSkip is wired. */}
      {onSkip && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="absolute bottom-4 right-4 text-muted-foreground"
        >
          Skip
        </Button>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MaskedVideoWord — internal helper, one masked row of the loader.
//
// Technique (rewrite): the video is a REAL DOM <video> element behind a
// white overlay; the overlay has the text shape PUNCHED OUT of it using an
// SVG <mask> that uses <text> as the cut-out. This avoids the unreliable
// foreignObject+video combination that doesn't paint in every browser.
//
// Layers (bottom to top):
//   1. <video> (or <img> for reduced motion) — fills the row.
//   2. An SVG <rect> filled with the page background colour, masked so that
//      everywhere the text is, the rect is transparent → video shows through.
//
// The text inside <mask> is rendered in the same document so it picks up
// the Oi @font-face loaded via fonts.css.
// ─────────────────────────────────────────────────────────────────────────────

type MaskedVideoWordProps = {
  word: string;
  /** Unique mask id for this row — must not collide with other rows. */
  maskId: string;
  /** SVG viewBox (e.g. "0 0 1000 240"). Defines the coordinate space the
   *  text is rendered into. The container's aspect-ratio should match. */
  viewBox: string;
  fontSize: number;
  videoSrc: string;
  posterSrc: string;
  reducedMotion: boolean;
  /** Tailwind width override — used to make "CO" slightly narrower. */
  className?: string;
};

// Parses "0 0 W H" → { w, h } so we can size the masking <rect>.
function parseViewBox(viewBox: string): { w: number; h: number } {
  const parts = viewBox.split(/\s+/).map(Number);
  return { w: parts[2] || 1000, h: parts[3] || 240 };
}

function MaskedVideoWord({
  word,
  maskId,
  viewBox,
  fontSize,
  videoSrc,
  posterSrc,
  reducedMotion,
  className = "w-full",
}: MaskedVideoWordProps) {
  const { w, h } = parseViewBox(viewBox);

  return (
    <div
      // Aspect ratio mirrors the SVG viewBox so the row sizes correctly.
      // The video and the SVG overlay are both 100% of this container.
      className={`relative block ${className}`}
      style={{ aspectRatio: `${w} / ${h}` }}
      aria-hidden="true"
    >
      {/* Bottom layer: the actual video (or static poster for reduced motion).
          Plain DOM <video> autoplays normally — no SVG sandboxing in play. */}
      {reducedMotion ? (
        <img
          src={posterSrc}
          alt=""
          className="absolute inset-0 block h-full w-full object-cover"
        />
      ) : (
        <video
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 block h-full w-full object-cover"
        />
      )}

      {/* Top layer: an SVG that draws a background-coloured rect covering the
          whole area, with a mask that REMOVES the rect where the text sits.
          Result: the video is only visible inside letter shapes.

          overflow="visible" + cover rect drawn 8 viewBox-units larger than
          the viewBox on every side eliminates the thin video sliver that
          otherwise shows at the bottom edge when CSS aspect-ratio and the
          SVG viewport disagree by a subpixel after rounding. */}
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        overflow="visible"
        className="absolute inset-0 block h-full w-full"
      >
        <defs>
          {/* In an SVG <mask>: white = keep, black = remove. So we start
              with a fully-white rect (keep the cover rect everywhere) and
              draw the text in black (remove the cover rect at the letters).
              The white rect is also oversized to match the cover rect — if
              the mask itself were viewBox-sized, the oversized cover rect
              outside the viewBox would be UNMASKED (default black) and
              disappear, defeating the purpose. */}
          <mask id={maskId}>
            <rect x={-8} y={-8} width={w + 16} height={h + 16} fill="white" />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="black"
              // Force the word to fit the viewBox width exactly. Without this,
              // "DISCOVER" at a tall fontSize naturally extends wider than
              // viewBox width and gets clipped at the sides. We leave a tiny
              // inset (10 viewBox units total = ~1%) so the round bowls of
              // O/C don't get anti-aliased against the edge — but the word
              // still reads as edge-to-edge in the container.
              textLength={Math.max(w - 10, 1)}
              // spacingAndGlyphs scales the actual glyph shapes — not just
              // letter spacing — so the word looks evenly proportioned rather
              // than just rubber-banded.
              lengthAdjust="spacingAndGlyphs"
              style={{
                fontFamily: "'Oi', serif",
                fontSize: `${fontSize}px`,
                fontWeight: 400,
              }}
            >
              {word}
            </text>
          </mask>
        </defs>
        {/* The masked cover rect. fill uses the page background token so the
            seam with the surrounding <section> is invisible. Drawn 8 units
            larger than viewBox on every side — combined with overflow="visible"
            on the parent <svg>, this means the rect always extends past the
            rendered SVG element's edges, so subpixel rounding can never leave
            a sliver of video uncovered. */}
        <rect
          x={-8}
          y={-8}
          width={w + 16}
          height={h + 16}
          fill="var(--color-background, #ffffff)"
          mask={`url(#${maskId})`}
        />
      </svg>
    </div>
  );
}
