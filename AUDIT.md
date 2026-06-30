# Visual Consistency Audit — Smart Planner Prototype

_Audited 2026-06-26. Source of truth: `DesignLint_Skill/DESIGN_SYSTEM.md` + tokens in `src/styles/theme.css`._

This audit checks the whole app (13 pages, ~45 domain components, 48 shared UI primitives) against the design system, both by reading the code and by viewing the rendered app at mobile (375px) and desktop (1280px). It records concrete file:line evidence, a severity for each finding, and a prioritized fix list.

> **How to read severity**
> - **HIGH** — breaks theming or the design-system contract; visible inconsistency. Fix first.
> - **MED** — real divergence that erodes consistency but is contained. Fix in a follow-up.
> - **LOW** — polish; safe to batch later.

---

## Executive summary

| # | Finding | Severity | Spread |
|---|---|---|---|
| 1 | Hardcoded hex colors in live code (not comments) | **HIGH** | 5 files |
| 2 | Raw Tailwind palette classes (`bg-blue-600`, `text-red-*`, `bg-yellow-*`, `bg-gray-*`…) instead of tokens | **HIGH** | ~12 files |
| 3 | Bespoke `<button>`s in feature code bypass the shared `Button` | **MED→HIGH** | 10 hot files |
| 4 | `text-grey` used for default body/caption text (should be `text-foreground`) | **MED** | ~220 occurrences, 20+ files |
| 5 | Divergent radius/shadow on equivalent product cards | **MED** | products/* vs list cards |
| 6 | Duplicate components serving the same purpose | **MED** | ActivityCard ×2; chips/pills |
| 7 | Custom chip/pill re-implementations duplicate `Badge`/`Button` | **MED** | 3 patterns |
| 8 | Hardcoded font sizes (`text-[10px]`) for roles that have a scale | **LOW** | a few cards/forms |
| 9 | Repeated inline progress-bar / placeholder styles | **LOW** | 3 list pages |

**Already healthy (no action):** Icon set is 100% `lucide-react` — no mixed libraries. Semantic border tokens (`border-input`, `border-ring`, `border-destructive`) are used consistently. The shared `ui/` primitives (`button`, `card`, `input`, `dialog`) match the spec. `rounded-xs` (flagged in early recon) is valid Tailwind v4 and used correctly in shadcn primitives — **not** a defect.

---

## The rubric (allowed values)

**Colors** — use semantic token classes only; never hex/rgb literals or raw palette scales:
`bg-primary` `text-primary-foreground` `bg-card` `text-foreground` `text-muted-foreground` `bg-muted` `bg-accent` `text-destructive`/`bg-destructive` `text-success` `text-warning` `border-border` `border-input` `border-ring` `bg-grey-light` `bg-grey-lightest`. (Defined in `src/styles/theme.css`.)

**Radius** — `--radius` 10px base → `rounded-sm` (6) · `rounded-md` (8, buttons) · `rounded-lg` (10, inputs) · `rounded-xl` (14, cards) · `rounded-full` (pills/icon buttons) · `rounded-3xl` (dialogs). Avoid arbitrary `rounded-[Npx]`.

**Buttons** — use the shared `Button` (`src/shared/components/ui/button.tsx`). Variants: `default, destructive, outline, secondary, tertiary, ghost, link, inverted`. Sizes: `default, sm, lg, icon`. Base text `text-xs`, default icon `size-5`.

**Typography** — Mulish; size via the scale (`text-xs … text-3xl`), weight `font-normal/medium/semibold/bold/extrabold`. No arbitrary `text-[Npx]`.

**Text color** — default body/caption/helper to `text-foreground`; `text-muted-foreground` only for genuinely de-emphasised text; `text-grey` is not a hierarchy tool ([[feedback_text_foreground_not_grey]]).

---

## Findings by category

### 1. Color palette — hardcoded hex (HIGH)

Hex literals bypass tokens, so they don't respond to `ThemeContext` (light/dark or a customer's custom primary). Confirmed in **live code** (Figma-reference comments excluded):

| File:line | Code | Should be |
|---|---|---|
| `src/shared/components/ui/tooltip.tsx:49,55` | `bg-[#333743]` / `fill-[#333743]` | a token (e.g. add a `--tooltip` token or use `bg-foreground`) |
| `src/shared/components/LeafletMap.tsx:147,179` | `"#2681FF"` / `"#333743"` marker fills | read `--primary` via CSS var (pattern already exists in `TourRouteMap.tsx`) |
| `src/modules/smartPlanner/pages/ActivityDetailPage.tsx:76` | `const CRUISE_ACCENT = "#0e4d92"` | a token or documented accent |
| `src/modules/smartPlanner/pages/DiscoveryPage.tsx:868-872` | 5 hardcoded `linear-gradient(...)` hero gradients | acceptable as decorative art, but centralize as named constants |
| `src/modules/smartPlanner/pages/PackageDetailPage.tsx:282` | `bg-[#003399]` airline badge circle | token / `bg-primary` |
| `src/modules/smartPlanner/components/TourRouteMap.tsx:28` | fallback `\|\| "#2681ff"` | fallback to `var(--primary)` |

### 2. Color palette — raw Tailwind palette classes (HIGH)

Same theming problem as hex. Confirmed locations:

- **Sliders** `bg-blue-600` → `bg-primary/90`: `HotelListPage.tsx:847,848,1574,1575`
- **Destructive text** `text-red-600/500/400` → `text-destructive`: `HotelListPage.tsx:982`, `DiscoveryPage.tsx:1234`, `InfoList.tsx:34`, `FlightSearchForm.tsx:918` (`hover:text-red-400`, `hover:border-red-300`)
- **"Sold/included" greens** `text-green-700 bg-green-50` → `text-success` + a success-tint token: `ActivityDetailPage.tsx:1301`
- **Warning blocks** `bg-yellow-50 border-yellow-200 text-yellow-900/700` → map to `--warning`: `StopoverRoomPage.tsx:325-326`, `HotelDetailPage.tsx:830-834,877-881` (repeated 3×)
- **"Fastest" flight badge** `bg-purple-50 text-purple-700 border-purple-100`: `FlightResultCard.tsx:61` (no token equivalent — needs a decision: add an accent token or reuse `secondary`)
- **Neutral greys** `bg-gray-50`, `bg-gray-100`, `bg-gray-200/50`, `text-gray-300/500/700`, `border-gray-200` → `bg-muted`, `text-muted-foreground`, `border-border`: `HotelListPage.tsx:1352,1363,1375,1430,1489-1492`, `HolidayListPage.tsx:657`, `FlightListPage.tsx:363`, `RoomCard.tsx:89`

### 3. Buttons — bespoke `<button>` in feature code (MED→HIGH)

The shared `Button` exists and is used in many places, but these feature files hand-roll `<button>` with inline class strings, so design-system changes won't propagate and styling drifts. Highest concentrations:

`DiscoveryPage.tsx` (33), `TourDetailPage.tsx` (25), `flightSearch/FlightSearchForm.tsx` (23), `ActivityDetailPage.tsx` (21), `PackageDetailPage.tsx` (19), `HotelListPage.tsx` (19), `PackageSearchForm.tsx` (13), `ActivitySearchForm.tsx` (12), `HolidayListPage.tsx` (10), `flightSearch/FlightFilterBar.tsx` (9).

> **Nuance:** not every raw `<button>` is wrong — tabs, toggles, chips, and the search-form pill triggers are legitimately custom. The target is buttons that look like primary/secondary/ghost actions but skip the component. Triage per file; don't blanket-convert.

**Note on "variants":** early recon flagged `hero/compact/vertical/horizontal/highlight/check/cross/guide` as rogue Button variants. They are **not** — they're legitimate props on `PackageSearchForm`/`ActivitySearchForm` (`hero`/`compact`), `SkeletonCard` (`vertical`/`horizontal`), `InfoList` (`highlight`/`check`/`cross`), and `SeatShape` (`guide`). No action needed. The one genuine smell is `AiSuggestionChips.tsx:33` `variant="primary"` on a **custom** `SuggestionChip` (see §7).

### 4. Typography & text color — `text-grey` for default text (MED)

~220 `text-grey` occurrences across 20+ files; heaviest in `PackageDetailPage.tsx` (23), `TourDetailPage.tsx` (22), `HotelDetailPage.tsx` (21), `ActivityDetailPage.tsx` (19), `PackageSearchForm.tsx` (19), `StopoverRoomPage.tsx` (14), `DiscoveryPage.tsx` (14). Per [[feedback_text_foreground_not_grey]], body/caption/helper text should default to `text-foreground`; grey should be reserved for truly muted UI. This is the single largest consistency theme. Recommend a guided sweep (not blind replace) page by page, deciding per instance between `text-foreground` and `text-muted-foreground`.

**Hardcoded sizes (LOW):** `text-[10px]` appears for some form labels/badges (e.g. `ActivityDetailPage.tsx:1301`, `ActivitySearchForm` labels) — use `text-xs` from the scale.

### 5. Cards — divergent radius & shadow on equivalent surfaces (MED)

Cards that play the same role render with different corners and elevation:

- List result cards (`ActivityCard.tsx`, `TourCard.tsx`, `PackageCard.tsx`): `rounded-xl` + `shadow-sm` → `shadow-lg` on hover.
- Itinerary product cards (`products/AccommodationCard.tsx`, `products/ActivityCard.tsx`): `rounded-lg md:rounded-3xl` + `shadow-sm`, **no** hover elevation.
- `rooms/RoomCard.tsx`: arbitrary `rounded-[28px]`.

Pick one card radius (`rounded-xl`) and one elevation rule per role and apply uniformly. Shadow usage overall is spread thin (`shadow-sm` 53, `shadow-lg` 45, `shadow-md` 37, `shadow-xl` 30) — worth confirming each matches the spec's role mapping (cards=sm, popovers=md, dialogs=lg).

### 6. Duplicate components serving the same purpose (MED)

- **Two `ActivityCard`s:** `components/ActivityCard.tsx` (search result) and `components/products/ActivityCard.tsx` (itinerary). Same name, different styling — high drift risk. Rename for clarity (e.g. `ActivityResultCard` vs `ActivityProductCard`) and share the visual shell.
- Across the product family there are 10 card-like components; consider a shared `<ProductCardShell>` providing the agreed radius/shadow/padding, with role-specific content inside.

### 7. Chips / pills / badges re-implemented (MED)

- `aiItinerary/AiSuggestionChips.tsx` — custom `SuggestionChip` with its own `variant="primary"`; duplicates `Button`/`Badge`.
- `flightSearch/secondaryPill.tsx` — `PILL_CLASS` constant (`rounded-xl md:rounded-lg border border-border`); a one-off pill style.
- `flightSearch/FlightResultCard.tsx:61-72` — inline `ResultBadge` with palette colors (also §2).

Consolidate onto `Badge` (+ a shared `chip` className) so chip styling lives in one place.

### 8. Spacing & layout (LOW–MED)

Equivalent surfaces use varied padding/gap (cards `p-4` vs `p-6`; mobile containers `px-4` vs `px-5` vs `px-6`; `gap-2` vs `gap-3`). Not broken, but the rhythm reads slightly off between flows. Recommend agreeing a card padding (`p-4 md:p-6`) and section gap scale and aligning the outliers.

---

## Additional aspects checked (beyond the original list)

1. **Interaction states** — hover/focus/active/disabled. The shared `Button` has a correct `focus-visible` ring; bespoke `<button>`s (§3) mostly lack it → an accessibility + consistency gap.
2. **Empty / loading / error states** — list pages share `bg-gray-200/50` progress bars (§2/§9) and an `EmptyState` component, but the "no results" block in `HotelListPage.tsx:1489-1492` is hand-rolled with `text-gray-*` instead of reusing `EmptyState`.
3. **Responsive** — verified mobile (375) and desktop (1280); forms, tabs, and the sticky summary bar adapt correctly. No breakage found; the product-card radius difference is the main responsive inconsistency (`rounded-lg md:rounded-3xl`).
4. **Microcopy / CTA wording** — spot-checked; verbs and sentence case look consistent. Worth a dedicated pass against the spec's CTA table later.
5. **Accessibility surface** — icon-only bespoke buttons need `aria-label`; `sr-only` usage is sparse. Ties to the WCAG 2.1 AA goal.
6. **Theming integrity** — directly compromised by §1 and §2; fixing those is what makes dark mode / custom primary actually work.

---

## Prioritized remediation backlog

**Phase 1 — HIGH (do now, low risk, high payoff)**
1. Replace raw palette classes with tokens (§2): sliders `bg-blue-600`→`bg-primary/90`; `text-red-*`→`text-destructive`; gray neutrals→`muted`/`border`/`muted-foreground`; yellow blocks→`warning`.
2. Replace live hardcoded hex (§1): tooltip, LeafletMap, PackageDetail badge, TourRouteMap fallback, CRUISE_ACCENT.
3. Reuse `EmptyState` for the HotelList "no results" block.

**Phase 2 — MED**
4. Triage bespoke `<button>`s in the 10 hot files; convert action-style ones to `Button` (§3).
5. Unify product-card radius/shadow and add a shared card shell (§5/§6); rename the duplicate `ActivityCard`s.
6. Consolidate chips/pills onto `Badge` (§7).
7. Guided `text-grey` → `text-foreground`/`text-muted-foreground` sweep, page by page (§4).

**Phase 3 — LOW**
8. Replace `text-[10px]` with `text-xs`; align card padding/section gaps; centralize the Discovery hero gradients.

---

## Verification plan

- After each fix batch, re-view the affected page at 375/1280 and confirm no visual regression.
- Toggle `ThemeContext` (dark / custom primary) to prove the color fixes actually re-theme.
- `npm run build` (runs `tsc -b`) must stay green.
- Walk one full flow (Stopover) end-to-end to confirm interactions are intact.

_Screenshots captured during this audit: `discovery-desktop.png`, `discovery-mobile.png`, `tour-detail-desktop.png` (repo root)._
