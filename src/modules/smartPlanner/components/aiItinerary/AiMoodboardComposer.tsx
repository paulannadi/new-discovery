// AiMoodboardComposer — the entry-screen composer shown on Discovery when
// "AI Experience" mode is on. Replaces the old textarea + 4 suggestion chips.
//
// Translated from prototype-start.jsx (Claude Design handoff, May 2026):
//   • A pill-shaped composer with [+] / textarea / mic / Send.
//   • Selected vibes, places, and inspirations stack as chips inside the
//     pill above the typing row.
//   • Three "suggestion bubbles" below the pill open progressive-disclosure
//     panels for picking vibes or trending places, or open a modal for
//     pasting a link.
//   • Drag-and-drop anywhere on the screen adds an image inspiration.
//
// Submit composes a single brief string (`summary`) and hands it to the
// parent via `onSubmit(summary)` — that's the seed prompt fed into the
// conversation screen.

import { useState, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Send,
  Mic,
  X,
  Check,
  Link as LinkIcon,
  Compass,
  Sparkles,
  Sun,
  Mountain,
  Building,
  Heart,
  Utensils,
  Users,
  Coffee,
  Image as ImageIcon,
  Video,
  Paperclip,
  Play,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../shared/components/ui/dialog";
import { Button } from "../../../../shared/components/ui/button";
import { ImageWithPlaceholder } from "../../../../shared/components/loading";

// ─── Static data ──────────────────────────────────────────────────────────
// Vibes — eight travel-style themes, each backed by a lucide icon component.
// Component references (not strings) so TypeScript can verify them at import
// time and we never accidentally ship a missing icon.
const VIBES: Array<{ key: string; label: string; Icon: typeof Sun }> = [
  { key: "Beach", label: "Beach", Icon: Sun },
  { key: "Mountain", label: "Mountain", Icon: Mountain },
  { key: "City", label: "City", Icon: Building },
  { key: "Romance", label: "Romance", Icon: Heart },
  { key: "Foodie", label: "Foodie", Icon: Utensils },
  { key: "Adventure", label: "Adventure", Icon: Compass },
  { key: "Family", label: "Family", Icon: Users },
  { key: "Wellness", label: "Wellness", Icon: Coffee },
];

// Trending places — nine destinations, each with a flag emoji (used only as
// a tiny ornament — not as the primary icon) and an Unsplash thumbnail URL.
// Flags are allowed because they're metadata, not UI icons; per the design
// system rule, lucide-react still owns every actual icon on the screen.
const PLACES: Array<{
  key: string;
  label: string;
  flag: string;
  image: string;
}> = [
  { key: "lisbon", label: "Lisbon", flag: "🇵🇹", image: "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=700&q=70" },
  { key: "bali", label: "Bali", flag: "🇮🇩", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=700&q=70" },
  { key: "santorini", label: "Santorini", flag: "🇬🇷", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=700&q=70" },
  { key: "tokyo", label: "Tokyo", flag: "🇯🇵", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=700&q=70" },
  { key: "iceland", label: "Iceland", flag: "🇮🇸", image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=700&q=70" },
  { key: "morocco", label: "Morocco", flag: "🇲🇦", image: "https://images.unsplash.com/photo-1539020140153-e479b8c5fec0?auto=format&fit=crop&w=700&q=70" },
  { key: "patagonia", label: "Patagonia", flag: "🇦🇷", image: "https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?auto=format&fit=crop&w=700&q=70" },
  { key: "capetown", label: "Cape Town", flag: "🇿🇦", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=700&q=70" },
  { key: "newyork", label: "New York", flag: "🇺🇸", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=700&q=70" },
];

const placeLabel = (key: string) =>
  PLACES.find((p) => p.key === key)?.label ?? key;
const placeImage = (key: string) =>
  PLACES.find((p) => p.key === key)?.image ?? PLACES[0].image;

// One image/video/link "inspiration" the user has attached. Stored locally;
// summarised into the brief on submit.
interface Inspiration {
  id: string;
  name: string;
  kind: "image" | "video" | "link";
  // Image URL — for link inspirations we still want a thumb, so we pick a
  // random place image; for images/videos we likewise stand in.
  imageKey: string;
}

// What the composer hands up to the parent on submit. The `summary` string
// is the one-line brief fed into the conversation as the seed user message;
// the other fields are kept around so a future iteration could re-hydrate
// the composer from the brief if the user comes back.
export interface AiMoodboardBrief {
  themes: string[];
  places: string[];
  inspirations: Inspiration[];
  note: string;
  summary: string;
}

interface AiMoodboardComposerProps {
  onSubmit: (brief: AiMoodboardBrief) => void;
  // Optional initial note — preserves anything Paula may have typed before
  // the redesign existed. Defaults to empty.
  initialNote?: string;
}

// ─── Component ───────────────────────────────────────────────────────────
export default function AiMoodboardComposer({
  onSubmit,
  initialNote = "",
}: AiMoodboardComposerProps) {
  // Selections
  const [themes, setThemes] = useState<string[]>([]);
  const [places, setPlaces] = useState<string[]>([]);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [note, setNote] = useState<string>(initialNote);

  // Progressive disclosure for the suggestion bubbles below the pill.
  const [openPanel, setOpenPanel] = useState<"vibes" | "places" | null>(null);

  // [+] popover anchored below the input pill.
  const [plusOpen, setPlusOpen] = useState(false);

  // Paste-a-link modal.
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");

  // Drag-and-drop full-page overlay. The ref tracks how deep the cursor is
  // nested so leaves on child elements don't dismiss the overlay early.
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  const totalChips =
    themes.length + places.length + inspirations.length;
  const hasChips = totalChips > 0;
  const canSubmit = totalChips > 0 || note.trim().length > 0;

  // ─── Mutation helpers ──────────────────────────────────────────────────
  const toggleTheme = (t: string) =>
    setThemes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  const togglePlace = (k: string) =>
    setPlaces((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
    );
  const removeInspiration = (id: string) =>
    setInspirations((prev) => prev.filter((i) => i.id !== id));

  const addInspiration = (
    name: string,
    imageKey: string,
    kind: Inspiration["kind"] = "image",
  ) => {
    const id = "i" + Math.random().toString(36).slice(2, 9);
    setInspirations((prev) => [...prev, { id, name, kind, imageKey }]);
    setPlusOpen(false);
  };

  // ─── Submit ────────────────────────────────────────────────────────────
  // Builds a single-line brief out of the selections + note so the
  // downstream conversation hook gets a meaningful first user message.
  const submit = () => {
    if (!canSubmit) return;
    const parts: string[] = [];
    if (places.length) parts.push(places.map(placeLabel).join(", "));
    if (themes.length) parts.push(themes.join(", ").toLowerCase());
    if (inspirations.length)
      parts.push(
        `${inspirations.length} inspiration${inspirations.length === 1 ? "" : "s"} attached`,
      );
    if (note.trim()) parts.push(note.trim());
    const summary = parts.join(" · ");
    onSubmit({ themes, places, inspirations, note, summary });
  };

  // ─── Drag-and-drop ─────────────────────────────────────────────────────
  // Track nesting depth so leaving a child doesn't kill the overlay.
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current += 1;
    if (dragDepth.current === 1) setDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    // We don't actually upload anything — stand in with a place image so
    // the inspiration thumb has something to show.
    addInspiration("dropped-photo.jpg", "santorini", "image");
  };

  const submitLink = () => {
    const v = linkValue.trim();
    if (!v) {
      setLinkOpen(false);
      return;
    }
    const name = v.length > 40 ? v.slice(0, 40) + "…" : v;
    // Pick a deterministic place thumbnail based on the URL length so the
    // inspiration thumb varies a bit between pastes.
    const guess = ["santorini", "bali", "iceland", "tokyo"][v.length % 4];
    addInspiration(name, guess, "link");
    setLinkValue("");
    setLinkOpen(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div
      className="w-full flex flex-col items-center"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* ── Pill composer ────────────────────────────────────────────── */}
      <div className="relative w-full max-w-[860px]">
        <div
          className={[
            // rounded-2xl — softer corners that suit this large composer
            // surface, especially when chips stack inside and the height
            // grows. We keep the same radius whether or not chips are
            // present — only the padding changes to accommodate the chip
            // row above the typing row.
            "bg-card rounded-2xl shadow-2xl transition-all duration-200",
            hasChips
              ? "px-3 pt-3 pb-2.5"
              : "px-4 py-2.5",
          ].join(" ")}
        >
          {/* Chip row — only renders when something is selected */}
          {hasChips && (
            <div className="flex flex-wrap gap-2 items-center px-1 pb-3">
              {/* Inspirations: 56x56 image thumbs with kind badge + remove */}
              {inspirations.map((ins) => (
                <ChipThumb
                  key={ins.id}
                  imageKey={ins.imageKey}
                  kind={ins.kind}
                  onRemove={() => removeInspiration(ins.id)}
                  title={ins.name}
                />
              ))}

              {/* Selected places */}
              {places.map((k) => {
                const place = PLACES.find((p) => p.key === k);
                if (!place) return null;
                return (
                  <ChipPill key={k} onRemove={() => togglePlace(k)}>
                    <span className="text-sm leading-none">{place.flag}</span>
                    <span>{place.label}</span>
                  </ChipPill>
                );
              })}

              {/* Selected vibes */}
              {themes.map((t) => {
                const vibe = VIBES.find((v) => v.key === t);
                if (!vibe) return null;
                const VibeIcon = vibe.Icon;
                return (
                  <ChipPill key={t} onRemove={() => toggleTheme(t)}>
                    <VibeIcon className="size-3" aria-hidden="true" />
                    <span>{vibe.label}</span>
                  </ChipPill>
                );
              })}
            </div>
          )}

          {/* Typing row */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPlusOpen((o) => !o)}
              aria-label="Attach"
              className={[
                "size-9 shrink-0 text-foreground",
                plusOpen ? "bg-grey-lightest" : "",
              ].join(" ")}
            >
              <Plus className="size-5" aria-hidden="true" />
            </Button>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Tell us anything — destination, dates, the vibe…"
              className="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-grey py-2"
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Voice (coming soon)"
              className="size-9 shrink-0 text-foreground"
            >
              <Mic className="size-5" aria-hidden="true" />
            </Button>
            <Button
              onClick={submit}
              disabled={!canSubmit}
              aria-label="Plan my trip"
              size="icon"
              className="size-10 shrink-0"
            >
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* [+] popover — anchored bottom-left of the pill */}
        {plusOpen && (
          <>
            <div
              onClick={() => setPlusOpen(false)}
              className="fixed inset-0 z-40"
              aria-hidden="true"
            />
            <div className="absolute left-0 top-full mt-2 bg-card border border-border rounded-xl shadow-2xl min-w-[220px] z-50 p-1.5">
              <PlusItem
                icon={<ImageIcon className="size-4" aria-hidden="true" />}
                label="Add a photo"
                hint="From your library"
                onClick={() => addInspiration("photo.jpg", "tokyo", "image")}
              />
              <PlusItem
                icon={<Video className="size-4" aria-hidden="true" />}
                label="Add a video"
                hint="Reel, TikTok, clip"
                onClick={() => addInspiration("reel.mp4", "iceland", "video")}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Suggestion actions ────────────────────────────────────────── */}
      {/* Three inverted buttons that open the vibes/places panels or the
          link modal. The "inverted" variant is a frosted-glass style
          (translucent white + backdrop blur) designed to sit on top of an
          image or coloured background — it picks up the gradient behind it
          rather than fighting it. The count badge inside each button
          surfaces the current number of selections for that category. */}
      <div className="mt-4 flex flex-wrap gap-2.5 justify-center">
        <Button
          type="button"
          variant="inverted"
          aria-pressed={openPanel === "vibes"}
          onClick={() =>
            setOpenPanel((p) => (p === "vibes" ? null : "vibes"))
          }
        >
          <Sparkles className="size-3.5" aria-hidden="true" />
          Pick a vibe
          {themes.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-white text-primary text-[11px] font-extrabold rounded-full ml-0.5">
              {themes.length}
            </span>
          )}
        </Button>
        <Button
          type="button"
          variant="inverted"
          onClick={() => setLinkOpen(true)}
        >
          <LinkIcon className="size-3.5" aria-hidden="true" />
          Paste a link for inspiration
        </Button>
        <Button
          type="button"
          variant="inverted"
          aria-pressed={openPanel === "places"}
          onClick={() =>
            setOpenPanel((p) => (p === "places" ? null : "places"))
          }
        >
          <Compass className="size-3.5" aria-hidden="true" />
          Show me trending places
          {places.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-white text-primary text-[11px] font-extrabold rounded-full ml-0.5">
              {places.length}
            </span>
          )}
        </Button>
      </div>

      {/* ── Disclosure panels ─────────────────────────────────────────── */}
      <AnimatePresence>
        {openPanel === "vibes" && (
          <motion.div
            key="vibes-panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-[860px] mt-5 flex flex-wrap gap-2 justify-center"
          >
            {VIBES.map(({ key, label, Icon: VibeIcon }) => {
              const on = themes.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleTheme(key)}
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors border shadow-xs",
                    on
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-foreground",
                  ].join(" ")}
                >
                  <VibeIcon className="size-3.5" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </motion.div>
        )}

        {openPanel === "places" && (
          <motion.div
            key="places-panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-[680px] mt-5 grid grid-cols-3 sm:grid-cols-5 gap-2"
          >
            {PLACES.map((place) => {
              const on = places.includes(place.key);
              return (
                <button
                  key={place.key}
                  type="button"
                  onClick={() => togglePlace(place.key)}
                  className={[
                    "relative h-20 rounded-xl overflow-hidden cursor-pointer transition-all",
                    on ? "ring-2 ring-primary ring-offset-1" : "",
                  ].join(" ")}
                >
                  <ImageWithPlaceholder
                    src={place.image}
                    alt={place.label}
                    containerClassName="absolute inset-0 size-full"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1.5">
                    <div className="text-white text-[11px] font-extrabold inline-flex items-center gap-1">
                      <span>{place.flag}</span>
                      <span>{place.label}</span>
                    </div>
                  </div>
                  {on && (
                    <div className="absolute top-1.5 right-1.5 size-[18px] rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center shadow-sm">
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Paste-a-link modal ────────────────────────────────────────── */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <LinkIcon className="size-[18px]" aria-hidden="true" />
              Paste a link
            </DialogTitle>
            <DialogDescription>
              Instagram Reel, TikTok, Pinterest pin, blog post — we'll
              extract the place.
            </DialogDescription>
          </DialogHeader>
          <input
            autoFocus
            type="text"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitLink();
            }}
            placeholder="https://instagram.com/reel/..."
            className="w-full px-3.5 py-3 border border-border rounded-lg text-sm outline-none focus:border-foreground"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLinkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitLink}>Import link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Full-page drag-and-drop overlay ───────────────────────────── */}
      {dragging && (
        <div className="fixed inset-6 rounded-3xl bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center z-40 pointer-events-none text-primary">
          <span className="inline-flex items-center gap-3 bg-card px-6 py-4 rounded-2xl shadow-2xl text-base font-extrabold">
            <Paperclip className="size-5" aria-hidden="true" />
            Drop a photo or short video to inspire your trip
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

function ChipPill({
  children,
  onRemove,
}: {
  children: ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-card text-foreground border border-border rounded-full pl-3 pr-1.5 py-1.5 text-xs font-semibold h-8 shadow-xs">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="size-5 rounded-full inline-flex items-center justify-center bg-grey-lightest text-grey ml-0.5 hover:bg-grey-light"
      >
        <X className="size-2.5" aria-hidden="true" />
      </button>
    </span>
  );
}

function ChipThumb({
  imageKey,
  kind,
  onRemove,
  title,
}: {
  imageKey: string;
  kind: "image" | "video" | "link";
  onRemove: () => void;
  title: string;
}) {
  return (
    <div className="relative size-14 shrink-0" title={title}>
      <ImageWithPlaceholder
        src={placeImage(imageKey)}
        alt={title}
        containerClassName="size-14 border border-border shadow-xs"
        rounded="rounded-lg"
        className="size-full object-cover"
      />
      {kind === "video" && (
        <div className="absolute bottom-1 left-1 size-[18px] rounded-full bg-black/65 text-white inline-flex items-center justify-center pointer-events-none">
          <Play className="size-2.5 fill-current" aria-hidden="true" />
        </div>
      )}
      {kind === "link" && (
        <div className="absolute bottom-1 left-1 size-[18px] rounded-full bg-black/65 text-white inline-flex items-center justify-center pointer-events-none">
          <LinkIcon className="size-2.5" aria-hidden="true" />
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-foreground text-background border-2 border-card inline-flex items-center justify-center shadow-sm"
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </div>
  );
}

function PlusItem({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 hover:bg-grey-lightest transition-colors text-left"
    >
      <div className="size-7 rounded-lg bg-grey-lightest inline-flex items-center justify-center text-foreground shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold leading-tight">{label}</div>
        <div className="text-[11px] text-grey mt-0.5">{hint}</div>
      </div>
    </button>
  );
}
