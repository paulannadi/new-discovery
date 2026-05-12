# Loading & Transition Patterns — TripBuilder Design Recommendation

> A unified approach to loading states, skeleton screens, streaming results, and transitions for **New Discovery** and **Smart Planner** (Discovery & Planning phases).
>
> *Checkout and Booking Confirmation patterns (progress indicators, multi-step operations) will be covered in a future phase.*

---

## Why This Matters

Loading states are one of the most overlooked parts of a product's experience, but users encounter them constantly. In TripBuilder especially — where hotel searches, flight queries, and supplier lookups can take several seconds — how we handle waiting directly affects whether a travel agent or traveller feels confident or frustrated.

A consistent loading strategy across Discovery and Smart Planner means:

- **Agents working fast** never feel like the UI is broken or frozen
- **Travellers browsing tours** stay engaged instead of bouncing
- **Engineers** have clear patterns to implement instead of ad-hoc spinners
- **The product feels unified** even though different teams build different parts

---

## The Core Principle: Match the Pattern to the Wait Time

Research (Jakob Nielsen, Google, Nielsen Norman Group) consistently shows that humans perceive wait times in distinct tiers. Each tier calls for a different UI response:

| Wait Time | User Perception | What to Show |
|---|---|---|
| **< 100ms** | Feels instant | Nothing — just update the UI |
| **100ms – 1s** | Noticeable but tolerable | Subtle indicator (skeleton or fade) |
| **1s – 3s** | Feels like a real wait | Skeleton screen with pulse animation |
| **3s – 10s** | Feels slow | Skeleton + status message explaining what's happening |

> **Note:** Operations longer than 10 seconds (booking confirmation, PDF generation) will need a progress indicator pattern. That will be defined in a future phase covering Checkout & Booking.

This is the single most important decision framework for loading UX. When in doubt, ask: *"How long will this take?"* and pick the matching pattern.

### A Key Insight: There Is Always Something to Show

In Discovery and Smart Planner, the user is never staring at a blank screen. Every page has structure that can render immediately — navigation, headers, filters, sidebars, the page layout itself. The content areas *within* that structure are what get skeletons.

This means we don't need decorative "entertainment" animations (spinning globes, illustrated scenes) to fill time. The page structure *is* the loading state. Skeletons within it tell the user exactly what's coming and where it will appear. Adding an animation on top of that just creates competing layers of "loading" that fight for attention.

Our approach is therefore: **render structure immediately, skeleton the dynamic content, show a status message if the wait gets long.** No blank screens, no decorative loaders.

---

## How to Determine Wait Times

You don't need precise instrumentation to make good pattern decisions:

### Quick methods
1. **Ask engineers** — they'll know rough ranges: "Hotel search takes 2–5s, flight search up to 8s, toggling a filter is instant." Even rough buckets are enough.
2. **Watch the Network tab** — open DevTools, perform the action, read the Time column. Do it several times to get the range.
3. **Check monitoring dashboards** — if Nezasa uses Datadog, Grafana, or similar, look at the **p95 response time** (the 95th percentile). Design for the p95, not the average.

### Design for the range, not a single number
Some wait times vary dramatically by query — "Paris, July" hits more suppliers than a niche destination in low season. The smartest approach is **escalating loading**: start with a skeleton, add a status message if 2 seconds pass, show a more reassuring message with cancel if 10 seconds pass. The UI adapts without needing to predict the exact duration.

### The gut-check shortcut
- *"Does it feel instant when I click?"* → Optimistic UI
- *"Is there a brief pause?"* → Skeleton
- *"Am I wondering if it's still working?"* → Skeleton + status message

---

## The Five Patterns

### 1. Optimistic UI (< 100ms perceived)

**What it is:** Update the UI immediately as if the action succeeded, then quietly confirm with the server in the background. If it fails (rare), roll back.

**When to use it in TripBuilder:**
- Toggling a filter in Discovery (show/hide results instantly)
- Adding a tour to a wishlist or shortlist
- Collapsing/expanding an itinerary day
- Toggling "include breakfast" on a hotel option

**Design rules:**
- The UI change happens on click — no spinner, no delay
- If the server confirms, do nothing (the UI is already correct)
- If the server rejects, revert the UI and show a subtle toast: *"Couldn't save that change. Please try again."*
- Use a brief micro-animation (scale or opacity) to acknowledge the action

**Why it works:** Most user actions succeed. Making the user wait for confirmation of something that almost always works is unnecessary friction.

---

### 2. Skeleton Screen (100ms – 3s)

**What it is:** Grey placeholder shapes that mirror the layout of the content that's loading. They pulse gently to show activity.

**When to use it in TripBuilder:**
- Loading the tour list in Discovery
- Loading hotel cards in Smart Planner search results
- Loading itinerary day details
- Loading the tour detail page
- Any card-based or list-based content

**Design rules:**
- **Match the layout exactly.** A skeleton for a hotel card should have the same height, the same image-to-text ratio, and the same spacing as the real card. This prevents layout shift (CLS) when content loads.
- **Use rounded rectangles**, not text-shaped wiggly lines. Simpler shapes are easier to maintain and look cleaner.
- **Pulse animation** using `animate-pulse` (already in your Skeleton component). The pulse should be subtle — `bg-accent` fading between 40% and 100% opacity.
- **Show the right number** of skeleton items. If a typical search returns 6 hotel cards, show 6 skeletons. Don't show 1, don't show 20.
- **Never skeleton interactive elements.** Buttons, filters, tabs, and inputs should either be hidden or shown in a disabled state — not skeletonised. A skeleton button looks clickable and confuses people.
- **Keep container chrome visible.** Page headers, navigation, sidebars, and filters should render immediately. Only the dynamic content area gets skeletons.

**What you already have:** Your `skeleton.tsx` component is a great foundation. It just needs to be composed into specific skeleton layouts for each content type (hotel card skeleton, tour card skeleton, itinerary day skeleton, etc.).

---

### 3. Streaming Results with Status Banner (3s – 10s)

**What it is:** Results arrive in batches from multiple sources. Show results as they come in, with a banner explaining that more are on the way.

**When to use it in TripBuilder:**
- Hotel search (multiple suppliers respond at different speeds)
- Flight search across carriers
- Any multi-supplier query in Smart Planner

**Design rules:**
- **Show the first batch immediately** — even 2-3 results are better than a blank screen
- **New results animate in** at the end of the list (fade + slide up, 200ms)
- **Status banner** sits below the results: *"Searching more suppliers… (2 of 3 complete)"* — you already have this pattern in `LiveSearchProgressBanner.tsx`
- **Don't re-sort the list** while results are streaming. If the user is reading result #3 and you re-sort, they lose their place. Sort once when all results are in, or let the user trigger a re-sort.
- **When streaming completes**, the banner fades out (300ms) and optionally a subtle toast confirms: *"All results loaded"*
- **Let users interact immediately** — they should be able to click, filter, and compare the results that are already visible

**What you already have:** `LiveSearchProgressBanner` is exactly this pattern. It should become the standard streaming indicator across both Discovery and Smart Planner.

---

### 4. Lazy Loading (Images & Heavy Content)

**What it is:** Defer loading of images and heavy content until they're about to enter the viewport (as the user scrolls).

**When to use it in TripBuilder:**
- Tour photos in Discovery grid
- Hotel gallery images
- Map tiles
- Itinerary day photos further down the page

**Design rules:**
- **Always reserve the exact space** for images before they load. Set explicit `width` and `height` (or use `aspect-ratio` in CSS). This is the single most important thing for preventing layout shift.
- **Use a placeholder** while loading:
  - **Option A — Colour placeholder:** A light grey box (`bg-muted`) the same size as the image. Simple, clean.
  - **Option B — Blur-up:** Show a tiny (20px wide) version of the image, blurred, then crossfade to the full image. More polished but requires generating thumbnails.
  - Recommendation: **Start with Option A** (simpler to implement). Move to Option B for hero images and gallery views later.
- **Use `loading="lazy"`** on `<img>` tags — this is native browser lazy loading and requires zero JavaScript
- **For the first 2-3 images on any page** (above the fold), do NOT lazy load. Load them eagerly so the initial view is fast.

---

### 5. Staggered Card Reveal (Transition Animation)

**What it is:** When content loads, cards or list items don't all appear at once — they fade in one by one with a slight delay between each.

**When to use it in TripBuilder:**
- Tour cards appearing in Discovery search results
- Hotel options loading in Smart Planner
- Itinerary days rendering on the planner page

**Design rules:**
- **Stagger delay:** 50–80ms between each item (fast enough to feel fluid, slow enough to notice)
- **Animation per item:** Fade in (opacity 0→1) + slight upward slide (translateY 8px→0), duration 200ms, ease-out
- **Cap the stagger** at ~6-8 items. If 20 results load, stagger the first 6 and then show the rest instantly. Otherwise the animation takes too long.
- **Use Framer Motion's `staggerChildren`** — it's already in your stack and handles this elegantly
- **Don't stagger on subsequent loads.** If the user changes a filter and the list refreshes, a quick crossfade is better than re-staggering every card.

---

## Layout Shift Prevention (Critical for Both Products)

Layout shift — when content jumps around as things load — is one of the most disorienting UX problems and one of Google's Core Web Vitals (CLS). Target: **CLS < 0.1**.

Rules that apply everywhere:

1. **Images:** Always set dimensions or aspect-ratio before load
2. **Fonts:** Use `font-display: swap` for Mulish and include a system font fallback with similar metrics
3. **Dynamic content:** Reserve space with skeletons that match final dimensions
4. **Injected banners/toasts:** Animate them in from the edge (slide or fade) rather than pushing content down

---

## Putting It All Together: TripBuilder-Specific Scenarios

### Discovery — Tour List Page
| Element | Pattern |
|---|---|
| Page chrome (header, filters, breadcrumbs) | Render immediately |
| Tour cards | Skeleton (3-6 cards) → Staggered reveal |
| Tour images | Lazy load with `bg-muted` placeholder |
| Filter interactions | Optimistic UI |
| Sorting | Brief skeleton flash (< 500ms) or crossfade |
| If search takes 3s+ | Add status message below filters: *"Searching tours…"* |

### Discovery — Tour Detail Page
| Element | Pattern |
|---|---|
| Hero image | Eager load (above fold) with blur-up placeholder |
| Page structure | Skeleton for text blocks + sidebar |
| Gallery images | Lazy load as user scrolls |
| "Book Now" button | Render immediately (even before content loads) |
| Price calculation | Inline spinner next to price, not full-page block |

### Smart Planner — Search Results
| Element | Pattern |
|---|---|
| Hotel/flight cards | Skeleton (matching card layout) → Streaming reveal |
| Supplier status | `LiveSearchProgressBanner` pattern |
| Map pins | Appear as results stream in |
| Filter changes | Optimistic UI + brief skeleton transition |
| If search takes 3s+ | Add status message via `StreamingStatusBanner` |

### Smart Planner — Itinerary View
| Element | Pattern |
|---|---|
| Day structure | Skeleton for each day card |
| Activity/hotel within a day | Inline skeleton within the day card |
| Changing a hotel | Inline spinner inside that card only — rest of page stays interactive |
| Adding a day | Optimistic UI (day appears immediately with skeleton content) |

---

## What to Build: A Shared Component Kit

To keep things consistent, I'd recommend creating these shared loading components that both Discovery and Smart Planner can use:

### Must-have (build first)
1. **`<Skeleton />`** — Already exists ✅ (your `skeleton.tsx`)
2. **`<SkeletonCard />`** — A pre-composed skeleton matching your standard card layout (image + title + subtitle + metadata row)
3. **`<StreamingStatusBanner />`** — Generalise your `LiveSearchProgressBanner` to work for any streaming context, not just supplier searches
4. **`<StaggeredList />`** — A wrapper component that applies staggered fade-in to its children using Framer Motion
5. **`<ImageWithPlaceholder />`** — An `<img>` wrapper that handles lazy loading + placeholder + fade-in on load

### Nice-to-have (build later)
6. **`<InlineSpinner />`** — A tiny spinner (16px) for inline loading states (price recalculation, single-field updates)
7. **`<ContentTransition />`** — A wrapper that crossfades between old and new content when data changes

---

## Anti-Patterns to Avoid

These are common mistakes we should explicitly avoid:

| Don't Do This | Do This Instead |
|---|---|
| Full-page spinner blocking everything | Skeleton screens in the content area only |
| Spinner on a button that was just clicked | Disable button + show spinner inside it |
| Loading indicator with no context ("Loading...") | Explain what's loading ("Finding hotels near Rome...") |
| Re-sorting a list while the user is reading it | Sort once when all results are in |
| Skeleton that doesn't match the real layout | Measure and match dimensions exactly |
| Lazy loading above-the-fold images | Eager load the first 2-3 images |
| Blocking the whole page during a single-card update | Inline loading in just that card |
| No cancel option for operations > 10 seconds | Always provide a way out |
| Decorative loading animation over skeletons | Let the page structure + skeletons do the work |
| A blank page with only a spinner | Always render page chrome immediately |

---

## Accessibility Considerations

Loading states need to be accessible too:

- **`aria-busy="true"`** on containers that are loading — screen readers will announce "busy" and wait
- **`aria-live="polite"`** on the streaming status banner — screen readers announce updates without interrupting
- **Respect `prefers-reduced-motion`** — replace pulse animations and staggered reveals with simple opacity fades (no movement) for users who've requested reduced motion
- **Skeleton contrast** — ensure skeleton shapes have enough contrast against the background (the `bg-accent` you're using should be fine, but verify)

---

## Summary: The Decision Checklist

When you're designing a new feature and need to decide on a loading pattern, ask these questions in order:

1. **Will it take less than 100ms?** → Optimistic UI, no indicator needed
2. **Is it loading structured content (cards, lists, pages)?** → Skeleton screen matching the final layout
3. **Is the wait 3s+ ?** → Add a status message explaining what's happening
4. **Do results come from multiple sources over time?** → Streaming with status banner
5. **Are there images involved?** → Lazy load with reserved space
6. **Is it a list of items appearing at once?** → Add staggered reveal animation

---

*This document should be treated as a living reference. As we implement these patterns, we'll refine the details and may discover edge cases specific to TripBuilder's workflows.*
