# SmartPlanner Design System

> **Purpose**: This document is the single source of truth for all UX/UI patterns in the SmartPlanner frontend. It serves as both a reference for front-end engineers and the ruleset for the Design System Consistency Agent.
>
> **Last audited**: 2026-04-06 · **Stack**: React 19, TypeScript 5.7+, Tailwind CSS v4, Radix UI, Framer Motion, Vite 6

> **How to use this document with AI**: Paste this file together with the relevant existing component or hook before describing your task. For example: *"Here is our design system [paste], and here is the existing `HotelCard` component [paste]. Add a 'recommended' badge to it following our patterns."* The more existing code context you provide alongside this document, the more accurately an AI assistant can match the project's conventions. For new features, also include the nearest existing similar component so the AI can mirror the structure rather than inventing one.

---

## Table of Contents

1. [Visual Design](#1-visual-design)
2. [Interaction Patterns](#2-interaction-patterns)
3. [Navigation](#3-navigation)
4. [Terminology & Content](#4-terminology--content)
5. [Components & UI Elements](#5-components--ui-elements)
6. [Forms & Data Input](#6-forms--data-input)
7. [Feedback & System Status](#7-feedback--system-status)
8. [Motion & Animation](#8-motion--animation)
9. [Layout & Structure](#9-layout--structure)
10. [Accessibility](#10-accessibility)
11. [Cross-Platform Behavior](#11-cross-platform-behavior)
12. [Edge & Rare States](#12-edge--rare-states)

**Appendices**
- [Appendix A: File Reference](#appendix-a-file-reference)
- [Appendix B: Technology Stack Reference](#appendix-b-technology-stack-reference)
- [Appendix C: Quick Reference Tables](#appendix-c-quick-reference-tables)
- [Appendix D: Discovery App (Next.js 15)](#appendix-d-discovery-app-nextjs-15)
- [Appendix E: Code Architecture Patterns](#appendix-e-code-architecture-patterns)

---

## 1. Visual Design

### 1.1 Color System

Colors are defined as CSS custom properties in `src/styles/tailwind.css` and bridged to Tailwind via `@theme`. The `ThemeContext` (`src/shared/contexts/ThemeContext.tsx`) can dynamically override `--primary`, `--secondary`, and `--theme-font` from the API, with automatic contrast checking via `ColorContrastChecker`.

#### Semantic Color Tokens

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--primary` | `#2681ff` | `#2681ff` | Primary actions, active states, links |
| `--primary-foreground` | `#ffffff` | `#ffffff` | Text on primary backgrounds |
| `--secondary` | `#333743` | `#e0e2e8` | Secondary actions, body text |
| `--secondary-foreground` | `#ffffff` | `#333743` | Text on secondary backgrounds |
| `--accent` | `#0264ed` | `#0264ed` | Selected/active accent states |
| `--accent-foreground` | `#ffffff` | `#ffffff` | Text on accent backgrounds |
| `--foreground` | `#333743` | `#f3f5f6` | Default body text |
| `--background` | `#f3f5f6` | `#333743` | Page background |
| `--card` | `#ffffff` | `#333743c0` | Card surfaces |
| `--card-foreground` | `#333743` | `#f3f5f6` | Card text |
| `--popover` | `#ffffff` | `#333743c0` | Popover/dropdown surfaces |
| `--popover-foreground` | `#333743` | `#f3f5f6` | Popover text |
| `--border` | `#e0e2e8` | `oklch(0.922 0 0)` | Borders, dividers |
| `--input` | `#e0e2e8` | `#33374379` | Input borders |
| `--ring` | `#9598a4` | `oklch(0.708 0 0)` | Focus rings |

#### Status Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--danger` | `#ff4136` | Errors, destructive actions, removal |
| `--success` | `#19a974` | Success states, confirmations |
| `--warning` | `#ffb700` | Warnings, caution states |
| `--info` | `#2681ff` | Informational messages |

#### Neutral Greys

| Token | Value | Usage |
|-------|-------|-------|
| `--grey` | `#9598a4` | Muted text, placeholders |
| `--grey-light` | `#e0e2e8` | Borders, disabled backgrounds, hover on ghost buttons |
| `--grey-lightest` | `#f3f5f6` | Subtle backgrounds |
| `--white` | `#ffffff` | Pure white surfaces |

#### Toast Background Colors (CSS)

| Token | Value |
|-------|-------|
| `--toastify-background-info` | `#d4e6ff` |
| `--toastify-background-success` | `#d1eee3` |
| `--toastify-background-warning` | `#fff1cc` |
| `--toastify-background-error` | `#ffd9d7` |

**Rule**: Never hardcode hex/rgb values in components. Always use CSS variables via Tailwind classes (`text-primary`, `bg-card`, `border-border`) or `var(--token)`.

### 1.2 Typography

#### Font Family

- **Primary font**: Mulish (Google Fonts), variable weight 200–1000
- **CSS variable**: `--theme-font: "Mulish", sans-serif`
- **Import**: `https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap`
- **Fallback**: `sans-serif`

The `ThemeContext` can override the font family dynamically with any Google Font or custom font URL.

#### Type Scale (Tailwind classes)

| Class | Approx. Size | Usage |
|-------|-------------|-------|
| `text-xs` | 12px | Badges, card descriptions, button text, small labels |
| `text-sm` | 14px | Field descriptions, helper text, error messages, form labels |
| `text-base` | 16px | Body text, field legends |
| `text-lg` | 18px | Subheadings |
| `text-xl` | 20px | Dialog titles |
| `text-2xl` | 24px | Section headers |
| `text-3xl` | 30px | Drawer headers (desktop) |

#### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text, descriptions |
| `font-medium` | 500 | Labels, field legends, button text, badge text |
| `font-semibold` | 600 | Card titles, section headers |
| `font-bold` | 700 | Drawer headers, breadcrumb labels, hero titles |
| `font-extrabold` | 800 | Dialog titles |

#### Line Heights

| Class | Value | Usage |
|-------|-------|-------|
| `leading-none` | 1.0 | Titles, card titles |
| `leading-snug` | 1.375 | Field content, labels |
| `leading-normal` | 1.5 | Field descriptions, body text |
| `leading-relaxed` | 1.625 | List items, alert descriptions |

#### Canonical Typography Combinations

| Context | Classes |
|---------|---------|
| Dialog title | `text-xl leading-none font-extrabold mb-3` |
| Drawer header (desktop) | `text-3xl font-bold text-black` |
| Drawer header (mobile) | `text-xl font-bold text-black` |
| Card title | `leading-none font-semibold` |
| Card description | `text-muted-foreground text-xs` |
| Field label | `text-sm leading-snug font-medium` |
| Field description | `text-sm leading-normal font-normal text-muted-foreground` |
| Error message | `text-sm font-normal text-destructive` |
| Button text | `text-xs font-medium` |
| Badge text | `text-xs font-medium` |

### 1.3 Icons

#### Library

- **Package**: `lucide-react` v0.577.0
- **Style**: Outline/stroke-based (consistent across the app)
- **Import pattern**: `import { IconName } from 'lucide-react'`
- **Type**: `import type { LucideIcon } from 'lucide-react'`

#### Sizing Convention

| Context | Class | Pixels |
|---------|-------|--------|
| Small (badges, compact UI) | `size-3` / `size-3.5` | 12px / 14px |
| Standard (general UI) | `size-4` / `size-5` | 16px / 20px |
| Large (decorative, carousel) | `size-6` / `size-8` | 24px / 32px |
| Extra-large (hero) | `size-9` / `size-10` | 36px / 40px |

**Default in buttons**: `[&_svg:not([class*='size-'])]:size-5` — any SVG without an explicit size class defaults to 20px.

#### Status Icon Colors

```tsx
<CircleCheck className="stroke-success" />   // Green
<CircleX className="stroke-danger" />         // Red
<TriangleAlert className="stroke-warning" />  // Amber
<Info className="stroke-info" />              // Blue
```

#### Common Icons by Domain

| Domain | Icons |
|--------|-------|
| Navigation | `ChevronLeft`, `ChevronRight`, `ChevronDown`, `ArrowLeft`, `ArrowRight` |
| Actions | `Check`, `Plus`, `Minus`, `Search`, `X`, `MoreHorizontal` |
| Status | `CircleCheck`, `CircleX`, `Info`, `TriangleAlert`, `SearchX` |
| Travel | `Plane`, `PlaneTakeoff`, `PlaneLanding`, `Briefcase`, `Building2` |
| Loading | `Loader2` (with `animate-spin`) |

**Rule**: Never mix icon libraries. All icons must come from `lucide-react`. All icons are outline style — never use filled variants.

### 1.4 Spacing & Layout Grid

#### Border Radius Tokens

| CSS Variable | Value | Tailwind |
|-------------|-------|----------|
| `--radius` | `0.625rem` (10px) | Base |
| `--radius-sm` | `calc(--radius - 4px)` = 0.25rem | `rounded-sm` |
| `--radius-md` | `calc(--radius - 2px)` = 0.375rem | `rounded-md` |
| `--radius-lg` | `var(--radius)` = 0.625rem | `rounded-lg` |
| `--radius-xl` | `calc(--radius + 4px)` = 0.875rem | `rounded-xl` |

#### Common Radius Usage

| Element | Class |
|---------|-------|
| Buttons (default) | `rounded-md` |
| Cards | `rounded-xl` |
| Inputs | `rounded-lg` |
| Dialogs (mobile) | `rounded-t-3xl` |
| Dialogs (desktop) | `rounded-3xl` |
| Badges | `rounded-md` |
| Icon buttons | `rounded-full` |

#### Shadow Scale

| Class | Usage |
|-------|-------|
| `shadow-xs` | Primary buttons |
| `shadow-sm` | Cards |
| `shadow-md` | Popovers |
| `shadow-lg` | Dialogs, switch thumbs |
| `shadow-xl` | Elevated overlays |

### 1.5 Component Styling Constants

Defined in `src/shared/utils/constants.ts`:

```typescript
THEME_COLOURS = {
  FOREGROUND: '--foreground',
  PRIMARY: '--primary',
  PRIMARY_FOREGROUND: '--primary-foreground',
  SECONDARY: '--secondary',
}
```

---

## 2. Interaction Patterns

### 2.1 Button States

All button states are defined in `src/shared/components/ui/button.tsx` using `class-variance-authority` (CVA).

**Base classes** (all variants):
```
inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
text-xs font-medium transition-all outline-none
disabled:pointer-events-none disabled:opacity-50
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
```

| Variant | Default | Hover | Focus | Disabled |
|---------|---------|-------|-------|----------|
| `primary` | `bg-primary text-primary-foreground shadow-xs` | `hover:brightness-85` | `ring-primary/20` | `opacity-50` |
| `secondary` | `border border-primary bg-background text-primary` | `hover:bg-primary hover:text-primary-foreground` | Standard ring | `opacity-50` |
| `tertiary` | `border text-primary` | `hover:bg-grey-light` | Standard ring | `opacity-50` |
| `destructive` | `bg-destructive text-white` | `hover:bg-destructive/90` | `ring-destructive/20` | `opacity-50` |
| `text` | `text-secondary` | `hover:brightness-75` | Standard ring | `opacity-50` |
| `link` | `text-secondary underline-offset-4` | `hover:brightness-75 hover:underline` | Standard ring | `opacity-50` |
| `ghost` | Transparent | `hover:bg-grey-light hover:text-foreground` | Standard ring | `opacity-50` |
| `inverted` | `bg-white/15 backdrop-blur-md text-white` | `hover:bg-white/25` | Standard ring | `opacity-50` |

### 2.2 Feedback Patterns

| Feedback Type | Implementation | Library |
|---------------|---------------|---------|
| Loading (global) | Triple-ring spinner (`LoadingScreen.tsx`) | Custom CSS |
| Loading (inline) | `Loader2` icon + `animate-spin` | Lucide React |
| Loading (content) | `Skeleton` with `animate-pulse` | Tailwind |
| Success | Toast notification (top-right) | react-toastify |
| Error (user) | Toast notification (top-right) | react-toastify |
| Error (field) | Inline `FormMessage` / `FieldError` | react-hook-form |
| Warning | Toast notification or inline Alert | react-toastify / Radix |
| Confirmation | Dialog modal with confirm/cancel buttons | Radix Dialog |

### 2.3 Gesture Support

| Gesture | Implementation | Library |
|---------|---------------|---------|
| Carousel swipe | Touch-native scroll | Embla Carousel |
| Keyboard navigation | Arrow keys on carousel | Embla Carousel |
| Keyboard activation | Enter + Space on interactive cards | Custom (ImageCard) |
| Drag | Not currently implemented | — |
| Long press | Not currently implemented | — |

---

## 3. Navigation

### 3.1 Route Structure

All routes are under `/itinerary-apps/`. Module routes are aggregated in `src/shared/pages/routes.ts` using React Router v7 `RouteObject[]`.

| Route | Module | Component |
|-------|--------|-----------|
| `/itinerary-apps/smartplanner/:itineraryId` | smartPlanner | `Smartplanner` |
| `/itinerary-apps/hotel-offers` | hotelOffersDrawer | Hotel offers |
| `/itinerary-apps/rental-cars` | rentalCarOffersDrawer | Rental car offers |
| `/itinerary-apps/ground-transports` | groundTransports | Ground transports |
| `/itinerary-apps/activities` | activityOffersDrawer | Activity offers |
| `/itinerary-apps/flights` | flightSearchDrawer | Flight search |

### 3.2 Navigation Patterns

| Pattern | Implementation |
|---------|---------------|
| Main ↔ Drawer | `window.parent.postMessage()` IPC between iframe and parent |
| Back navigation | `ChevronLeft` + text button (`variant="text"`) in drawer headers |
| Breadcrumb nav | `DrawerBreadcrumbHeader` with clickable segments and `ChevronRight` separators |
| Close drawer | `X` icon button in drawer header + backdrop click |

### 3.3 Drawer Communication Protocol

Drawers run inside iframes and communicate via `postMessage`:

| Action | Direction | Description |
|--------|-----------|-------------|
| `legSelected` | Parent → Drawer | User selected a leg/stop |
| `dataSelected` | Parent → Drawer | Selection data passed |
| `goToAllHotels` | Drawer → Parent | Navigate to hotel listings |
| `goToAllActivities` | Drawer → Parent | Navigate to activity listings |
| `refreshItinerary` | Drawer → Parent | Refresh parent data |
| `closeDrawer` | Drawer → Parent | Close the drawer |
| `goToAccommodationDetail` | Drawer → Parent | Navigate to hotel detail |

---

## 4. Terminology & Content

### 4.1 CTA Wording Conventions

All user-facing text is localized via `i18next`. English values are in `src/shared/assets/l18n/en.json`.

| Action Type | Pattern | Examples |
|-------------|---------|----------|
| Selection | "Choose [item]" | "Choose activity", "Choose flight", "Choose hotel" |
| Addition | "Add [item]" | "Add activity", "Add flight", "Add another flight" |
| Editing | "Change [item]" or "Edit" | "Change flight", "Change hotel" |
| Removal | "Remove [item]" | "Remove flight", "Remove hotel" |
| Browse | "Go to all [items]" | "Go to all activities", "Go to all hotels" |
| Load more | "Load more [items]" | "Load more activities", "Load more hotels" |
| Back | "Back to [location]" | "Back to Planner", "Back to activities" |
| Search | "Search" or "Refresh Results" | Context-specific |
| Confirm | "Confirm Selection" | — |

### 4.2 i18n Key Convention

Format: `module.context.purpose.name`

Examples:
- `smartplanner.accommodation.error.selectionFailed`
- `groundTransports.searchForm.error.departure.required`
- `hotelSearch.filters.starsLabel`

### 4.3 Tone of Voice

- **Conversational and encouraging** — "Looking for adventure or peace and quiet?"
- **Action-oriented** — Imperative verbs for CTAs ("Choose", "Add", "Remove")
- **No periods in button text** — "Remove flight" not "Remove flight."
- **Capitalized first letter** — Sentence case for all labels
- **No exclamation marks in error states** — "Failed to add hotel to itinerary" not "Failed!"

### 4.4 Error Message Patterns

| Type | Pattern | Example |
|------|---------|---------|
| Validation (required) | "[Field] is required" | "Arrival is required" |
| Validation (invalid) | "Invalid [field]" | "Invalid date" |
| API failure | "Failed to [action]" | "Failed to add hotel to itinerary" |
| Recovery | "Please try again" / "Please [action]" | "Please try again" |
| No results | "No [items] match your filters" | "No offers match your current filters. Try adjusting the filter criteria." |
| Missing data | "No [data] available" | "No description available" |

### 4.5 Empty State Messaging

| Context | Title Pattern | Subtitle Pattern |
|---------|--------------|------------------|
| Activity | "Any plans for {{location}}?" | Encouraging discovery text |
| Transfer | "Ride from {{departure}} to {{arrival}}" | Route context |
| Flight | "Flying to {{location}}?" | Destination context |
| No results | "No results found" | "Try adjusting the filter criteria" |

### 4.6 i18n Implementation

- All user-facing strings MUST use i18n — never hardcode visible text in components.
- Supported languages: `en`, `de`, `de-informal`, `fr`, `pt`, `it`, `es`, `nl`, `fi`, `sv`, `no`, `da`, `pl` (13 total).
- Translation files: `src/shared/assets/l18n/{en,...}.json` — bundled at build time, no CDN.
- Translations are managed via **nezasa-translations-hub**, which creates PRs with translation updates.
- **Workflow for adding/editing i18n keys:** update `en.json`, then run `/translate` to regenerate ALL other languages. Every key in `en.json` must exist in all 13 files. A PR touching only some language files is incomplete and must not merge.

For the key naming convention, see §4.2.

### 4.7 Feature IDs (`data-feature-id`)

Every interactive element that needs to be tracked for analytics or referenced in tests must have a `data-feature-id` attribute. This is the **single source of truth** for element identification across the app.

**Naming convention:** `smartplanner_<category>_<action-description>`

Examples:
- `smartplanner_hotels_select-from-recommendations`
- `smartplanner_flights_change-departure-date`
- `smartplanner_itinerary_remove-leg`

**Rules:**
- Do NOT use `data-testid`. Tests prefer role-based queries (`getByRole`, `getByText`); use `data-feature-id` only when structural queries are insufficient.
- All `data-feature-id` values must be registered in `docs/FEATURE_IDS.md`.

The pre-push hook validates that no `data-feature-id` is undocumented. See `CLAUDE.md` for the enforcement mechanics.

---

## 5. Components & UI Elements

All shared UI components live in `src/shared/components/ui/` and follow shadcn/ui patterns built on Radix UI primitives.

### 5.1 Button Hierarchy

File: `src/shared/components/ui/button.tsx`

| Variant | Purpose | Visual |
|---------|---------|--------|
| `primary` | Main action per screen | Solid primary color, shadow, brightness hover |
| `secondary` | Supporting action | Primary border + primary text on white bg, fills with primary on hover |
| `tertiary` | Low-emphasis action | Border, primary text, grey hover bg |
| `destructive` | Dangerous action | Red bg, white text |
| `text` | Minimal action | Text only, brightness hover |
| `link` | Navigation/link action | Text only, underline on hover |
| `ghost` | Contextual action | Transparent, grey hover bg |
| `inverted` | Overlay control on top of an image or dark background (hero corner controls) | Semi-transparent white with backdrop blur, white text |

**Sizes**: `default` (h-9), `sm` (compact), `lg` (h-10), `icon` (size-9 square)

### 5.2 Cards

File: `src/shared/components/ui/card.tsx`

Structure: `Card > CardHeader > CardTitle + CardDescription + CardAction > CardContent > CardFooter`

| Part | Key Classes |
|------|-------------|
| Card | `bg-card text-card-foreground rounded-xl border py-6 shadow-sm` |
| CardHeader | `@container/card-header grid auto-rows-min px-6 gap-1.5` |
| CardTitle | `leading-none font-semibold` |
| CardDescription | `text-muted-foreground text-xs` |
| CardContent | `px-6` |
| CardFooter | `flex items-center px-6` |

### 5.3 Dialogs & Modals

File: `src/shared/components/ui/dialog.tsx` (Radix Dialog primitive)

| Aspect | Mobile | Desktop (md+) |
|--------|--------|---------------|
| Position | Bottom of screen | Centered vertically and horizontally |
| Width | Full width | `max-w-lg` |
| Corners | `rounded-t-3xl rounded-b-none` | `rounded-3xl` |
| Padding | `p-4` | `p-6` |
| Overlay | `bg-black/50` fixed | Same |
| Animation | Fade + zoom (95%) | Same |

Close button: `X` icon, top-right, with `sr-only` "Close" text.

### 5.4 Drawers / Slide-out Panels

File: `src/shared/components/drawer/DrawerLayout.tsx`

| Property | Value |
|----------|-------|
| Position | Fixed, right-aligned |
| Width | `w-full` (mobile), `md:w-[70%]` (tablet+), `max-w-[1200px]` |
| Animation | `translate-x-full` → `translate-x-0`, 300ms ease-in-out |
| Backdrop | `bg-black/50` |
| Z-index | Backdrop: z-40, Panel: z-50 |
| Content padding | `p-6` (mobile), `md:py-10 lg:px-10 xl:px-20 2xl:px-28` |

### 5.5 Badges

File: `src/shared/components/ui/badge.tsx`

| Variant | Background | Text |
|---------|-----------|------|
| `default` | Primary | White |
| `secondary` | Grey-light | Foreground |
| `destructive` | Destructive | White |
| `success` | Success | White |
| `warning` | Warning | White |
| `outline` | Transparent | Foreground |

Base: `inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium`

### 5.6 Alerts

File: `src/shared/components/ui/alert.tsx`

| Variant | Background | Border |
|---------|-----------|--------|
| `default` | `bg-card` | Standard border |
| `destructive` | `bg-destructive/50` | `border-destructive` |
| `warning` | `bg-warning/15` | `border-warning` |

Sizes: `default` (px-4 py-3 text-sm) and `sm` (px-2 py-2 text-xs).

### 5.7 Tooltips

File: `src/shared/components/ui/tooltip.tsx`

- Background: `bg-black text-white`
- Size: `px-3 py-1.5 text-xs`
- Arrow: Black, 10px rotated square
- Animation: Zoom-in 95% + directional slide

### 5.8 Select / Dropdowns

File: `src/shared/components/ui/select.tsx`

Two trigger variants: `default` (compact button) and `input` (full-width input style). Both support `aria-invalid` error styling.

### 5.9 Other Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Checkbox | `checkbox.tsx` | `h-4 w-4`, primary bg when checked |
| Switch | `switch.tsx` | `h-6 w-11`, toggle with translate animation |
| Slider | `slider.tsx` | Track + range + thumb, primary color |
| Progress | `progress.tsx` | `h-2`, `bg-primary/20` track, `bg-primary` fill |
| Separator | `separator.tsx` | `bg-border`, horizontal (`h-px`) or vertical (`w-px`) |
| Skeleton | `skeleton.tsx` | `bg-grey-light animate-pulse rounded-md` |
| Calendar | `calendar.tsx` | react-day-picker, single/range selection |
| Carousel | `carousel.tsx` | Embla Carousel, keyboard navigation |
| Breadcrumb | `breadcrumb.tsx` | `nav > ol > li`, ChevronRight separators |
| Command | `command.tsx` | cmdk palette, search + grouped items |
| Popover | `popover.tsx` | Radix, `w-72 p-4 shadow-md` |
| Label | `label.tsx` | `text-sm leading-none font-medium` |
| ReadMore | `ReadMore.tsx` | CSS line clamp + expand/collapse |
| CollapsibleSection | `collapsibleSection.tsx` | Framer Motion animated disclosure |
| ImageCard | `imageCard.tsx` | Rounded image container, conditional a11y |
| MultiSelectPopover | `multiSelectPopover.tsx` | Checkbox multi-select in popover |

---

## 6. Forms & Data Input

### 6.1 Form Architecture

| Layer | Library | File |
|-------|---------|------|
| Form state | `react-hook-form` | Component-level hooks |
| Validation | `zod` + `@hookform/resolvers` | Schema files in `src/shared/schemas/` |
| UI wrapper | Custom Form components | `src/shared/components/ui/form.tsx` |
| Field layout | Custom Field components | `src/shared/components/ui/field.tsx` |

### 6.2 Form Component Hierarchy

```
<Form>                          // FormProvider wrapper
  <FormField control={} name={} // Controller + context
    render={({ field }) => (
      <FormItem>                // Container (grid gap-2 w-full)
        <FormLabel />           // Label with error styling
        <FormControl>           // Slot-based control wrapper
          <Input />             // Actual input element
        </FormControl>
        <FormDescription />     // Helper text (text-muted-foreground text-sm)
        <FormMessage />         // Error display (text-destructive text-sm, i18n-aware)
      </FormItem>
    )}
  />
</Form>
```

### 6.3 Field Layout System

File: `src/shared/components/ui/field.tsx`

| Orientation | Behavior |
|-------------|----------|
| `vertical` | Stacked: label above input, full width |
| `horizontal` | Side-by-side: label left, input right |
| `responsive` | Vertical on mobile, horizontal at `@md/field-group` container breakpoint |

Key spacing: `FieldSet` uses `gap-6`, `FieldGroup` uses `gap-7`, `FieldContent` uses `gap-1.5`.

### 6.4 Validation & Error Display

**Validation approach**: Zod schemas with translation keys as error messages.

```typescript
z.string().min(1, 'groundTransports.searchForm.error.departure.required')
```

**Error display patterns**:
- Default: Relative position inside `FormItem`
- Custom: `className="absolute -bottom-6 left-2"` (below field, left-aligned)
- Centered: `className="absolute -bottom-6 left-1/2 translate-x-2"`

**ARIA integration**: `FormControl` automatically sets `aria-invalid` and `aria-describedby` linking to error messages.

### 6.5 Date Input

- **Component**: Calendar in Popover (react-day-picker)
- **Format**: ISO 8601 string (`toISOString()`)
- **Display format**: `MMM DD YYYY` (via date-fns/dayjs)
- **Constraints**: Past dates disabled by default
- **Caption**: Dropdown for month/year selection

### 6.6 Input Styling

File: `src/shared/components/ui/input.tsx`

```
w-full min-w-0 rounded-lg bg-white p-5 text-sm
transition-[color,box-shadow] outline-none
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]
aria-invalid:ring-destructive/20 aria-invalid:border-destructive
disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
placeholder:text-muted-foreground
selection:bg-primary selection:text-primary-foreground
```

---

## 7. Feedback & System Status

### 7.1 Toast Notifications

| Property | Value |
|----------|-------|
| Library | `react-toastify` |
| Position | `top-right` |
| Auto-close | `5000ms` (constant: `TOAST_AUTO_CLOSE_MS`) |
| Transition | `Slide` |
| Pause on hover | Yes |

**Toast API** (from `src/shared/utils/toast.ts`):
```typescript
showToast.success(message)
showToast.error(message)
showToast.warning(message)
showToast.info(message)
showToast.dismiss(toastId)
```

**Usage examples from i18n**:
- Success: "Hotel removed successfully."
- Error: "Failed to remove hotel. Please try again."
- Info: "Itinerary link copied to clipboard!"
- Warning: "Some activities have no tickets selected..."

### 7.2 Loading Indicators

| Type | Component | Animation | Usage |
|------|-----------|-----------|-------|
| Full-screen spinner | `LoadingScreen.tsx` | Triple-ring, staggered (1.5s/2s/3s) | Initial page load |
| Inline spinner | `Loader2` + `animate-spin` | CSS spin | Button loading states |
| Content skeleton | `Skeleton` | `animate-pulse` | Content placeholders |
| Offer card skeleton | `OfferCardSkeleton` | `animate-pulse` | Product card loading |

**Incremental loading**: `useIncrementalDisplay` hook loads items in batches of 10 (`PRODUCT_BATCH_SIZE`) with a 300ms delay (`LOAD_MORE_DELAY_MS`).

### 7.3 Error States

| Level | Pattern | Display |
|-------|---------|---------|
| Global (route) | `ErrorBoundary` → `ErrorPage` | Full-screen centered with image, message, and reload button |
| API (service) | `handleErrors()` → classified error | Toast notification |
| Form (field) | Zod validation → `FormMessage` | Inline below field |
| Filter (no results) | `EmptyState` component | Centered icon + title + subtitle |

**Error classification** (from `src/shared/services/api/errorHandling.ts`):
1. Zod validation → "Invalid response shape: {error}"
2. Axios response error → "API error: {message}"
3. Axios request error (no response) → "No server response"
4. Generic → "Unknown error: {message}"

### 7.4 Empty States

File: `src/shared/components/filters/EmptyState.tsx`

```tsx
<div className="flex flex-col flex-1 items-center justify-center w-full">
  <SearchX size={20} className="mb-2 min-w-8 min-h-8" aria-hidden="true" />
  <p className="font-semibold">{title}</p>
  <p className="text-sm">{subtitle}</p>
  <p className="text-sm mt-2">{description}</p>
</div>
```

---

## 8. Motion & Animation

### 8.1 Animation Libraries

| Library | Usage |
|---------|-------|
| Framer Motion | Collapsible sections, expand/collapse |
| Tailwind CSS `tw-animate-css` | Radix state animations (fade, zoom, slide) |
| CSS transitions | Color changes, transforms, opacity |

### 8.2 Duration Constants

| Context | Duration | Easing |
|---------|----------|--------|
| Radix overlays (dialog, popover, tooltip) | `200ms` | Default (ease) |
| Drawer slide | `300ms` | `ease-in-out` |
| Content fade (within drawers) | `200ms` | Default |
| Framer Motion collapsible | `0.2s` | Default spring |
| Toast auto-close | `5000ms` | — |
| Skeleton pulse | Continuous | CSS `animate-pulse` |
| Loading spinner | `1.5s` / `2s` / `3s` (staggered) | `animate-spin` |
| Incremental load delay | `300ms` | — |

### 8.3 Animation Patterns

#### Radix State Animations (Dialog, Popover, Select, Tooltip)

```
// Open
data-[state=open]:animate-in
data-[state=open]:fade-in-0
data-[state=open]:zoom-in-95

// Close
data-[state=closed]:animate-out
data-[state=closed]:fade-out-0
data-[state=closed]:zoom-out-95

// Directional slide (based on position)
data-[side=bottom]:slide-in-from-top-2
data-[side=top]:slide-in-from-bottom-2
data-[side=left]:slide-in-from-right-2
data-[side=right]:slide-in-from-left-2
```

#### Drawer Transition

```
transition-transform duration-300 ease-in-out
isOpen ? 'translate-x-0' : 'translate-x-full'
```

#### Framer Motion Expand/Collapse

```tsx
initial={{ height: 0, opacity: 0 }}
animate={{ height: 'auto', opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ duration: 0.2 }}
```

### 8.4 Interactive State Transitions

| Element | Property | Transition |
|---------|----------|-----------|
| Buttons | All properties | `transition-all` |
| Inputs | Color, box-shadow | `transition-[color,box-shadow]` |
| Switch thumb | Transform | `transition-transform` |
| Switch track | Colors | `transition-colors` |
| Slider thumb | Color, box-shadow | `transition-[color,box-shadow]` |

---

## 9. Layout & Structure

### 9.1 Page Layout

Main page structure (`Smartplanner.tsx`):

```tsx
<ViewModeProvider>
  <ViewModeToggle />
  <HeroSection />
  <div className="max-w-5xl mx-auto pl-1 pr-4 md:px-4 py-5 md:py-8 box-content">
    <SmartPlannerTimeline />
    <Footer />
  </div>
  <StickySummary />
</ViewModeProvider>
```

- **Max content width**: `max-w-5xl` (1024px)
- **Centering**: `mx-auto`
- **Responsive padding**: `pl-1 pr-4 md:px-4 py-5 md:py-8`

### 9.2 Responsive Breakpoints

| Breakpoint | Prefix | Usage |
|-----------|--------|-------|
| Default | (none) | Mobile-first base |
| 768px | `md:` | Tablet — primary breakpoint |
| 1024px | `lg:` | Desktop — sticky summary, hero adjustments |
| 1280px | `xl:` | Large desktop — drawer padding increases |
| 1536px | `2xl:` | Extra-large — max drawer padding |

### 9.3 Container Queries

Preferred over viewport breakpoints for component-level responsiveness.

| Container | Breakpoints | Usage |
|-----------|-------------|-------|
| `@container/field-group` | `@md` | Field orientation switch (vertical → horizontal) |
| `@container/card-header` | — | Card header grid adjustments |
| `@container` (unnamed) | `@lg`, `@3xl` | Transport card responsive grid |

### 9.4 Grid Patterns

| Pattern | Classes | Usage |
|---------|---------|-------|
| Two-column form | `grid md:grid-cols-[2fr_1fr] gap-4` | Search form |
| Card with sidebar | `grid @3xl:grid-cols-[1fr_1px_300px]` | Transport card |
| Label + content | `grid grid-cols-[auto_1fr] gap-4` | Field pairs |
| Alert with icon | `grid grid-cols-[0_1fr] has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr]` | Alert component |

### 9.5 Content Hierarchy

| Level | Element | Typical styling |
|-------|---------|----------------|
| Page hero | `<header>` | Full-width image, title, metadata |
| Page content | `<div>` | `max-w-5xl mx-auto` |
| Section | `<section>` | Semantic grouping |
| Card | Card component | `rounded-xl border shadow-sm` |
| Field group | `<fieldset>` | `flex flex-col gap-6` |

---

## 10. Accessibility

### 10.1 ARIA Patterns

| Pattern | Implementation |
|---------|---------------|
| Screen-reader only text | `sr-only` class on `<span>` elements |
| Decorative icons | `aria-hidden="true"` |
| Interactive cards | Conditional `role="button"`, `tabIndex={0}`, `aria-label` only when handlers are present |
| Form validation | `aria-invalid` + `aria-describedby` linking error messages |
| Dialog | Focus trap, return focus on close (via Radix) |
| Alert | `role="alert"` for important messages |
| Carousel | `aria-roledescription="carousel"`, `aria-label` |

### 10.2 Focus Management

**Focus ring standard**: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`

| Component | Ring Width |
|-----------|-----------|
| Buttons | `[3px]` |
| Inputs | `[1px]` |
| Badges | `[3px]` |
| Slider thumb | `ring-4` (on hover and focus) |
| Calendar | `has-focus:ring-[3px]` (parent focus-within) |

### 10.3 Keyboard Navigation

| Element | Keys |
|---------|------|
| Buttons | `Enter`, `Space` |
| ImageCard (interactive) | `Enter`, `Space` |
| Carousel | `ArrowLeft`, `ArrowRight` |
| Dialog | `Escape` to close, Tab trap |
| Select | `ArrowUp`, `ArrowDown`, `Enter` |
| Slider | `ArrowLeft`, `ArrowRight` |

### 10.4 Touch Targets

| Element | Size | Meets 44px minimum? |
|---------|------|---------------------|
| Button default | h-9 (36px) + padding | With padding: ~44px+ |
| Button large | h-10 (40px) + padding | Yes |
| Icon button | size-9 (36px) | Borderline — may need review |
| Checkbox | `h-4 w-4` (16px) | No — relies on label click area |
| Switch | `h-6 w-11` (24x44px) | Width yes, height borderline |

### 10.5 Semantic HTML

- `<nav>` for navigation (breadcrumbs)
- `<header>` for hero sections
- `<section>` for content grouping
- `<article>` for standalone content (offer cards)
- `<fieldset>` / `<legend>` for form groups
- `<button>` for all interactive controls (never `<div onClick>`)

### 10.6 Biome a11y Rules

Enforced at `error` level:
- `useSemanticElements` — no ARIA roles on elements that have semantic equivalents
- `noInteractiveElementToNoninteractiveRole` — interactive elements keep interactive roles
- `useValidAriaRole` — only valid ARIA roles allowed
- All `a11y` Biome suppressions require documented justification

---

## 11. Cross-Platform Behavior

### 11.1 Architecture

SmartPlanner is a **web application** embedded as an iframe within a parent booking platform. It is not a native mobile app.

| Aspect | Approach |
|--------|----------|
| Platform detection | CSS responsive breakpoints, not device detection |
| Mobile experience | Mobile-first CSS, full-width drawers, bottom-sheet dialogs |
| Desktop experience | Constrained content width (1024px), side panels, centered dialogs |
| Touch vs mouse | Same patterns — hover styles degrade gracefully on touch |

### 11.2 Responsive Adaptation

| Feature | Mobile | Desktop |
|---------|--------|---------|
| Dialog | Bottom sheet (`bottom-0 rounded-t-3xl`) | Centered (`top-1/2 max-w-lg rounded-3xl`) |
| Drawer width | `w-full` | `w-[70%] max-w-[1200px]` |
| Summary bar | `flex lg:hidden` (mobile) | `hidden lg:flex` (desktop) |
| Hero image | `max-h-48` | `max-h-96 lg:rounded-t-3xl` |
| Content padding | `pl-1 pr-4 py-5` | `px-4 py-8` |

### 11.3 Theming

Dynamic theme customization per distribution channel via API:
- Custom primary/secondary colors
- Custom font families
- Custom border radius
- Automatic contrast validation

---

## 12. Edge & Rare States

### 12.1 Error Screens

File: `src/modules/smartPlanner/pages/ErrorPage.tsx`

```tsx
<div className="px-2 h-screen flex flex-col items-center justify-center gap-8">
  <img src={errorImage} alt="" />
  <h1>{t('smartplanner.errorPage.label.header')}</h1>
  <p>{t('smartplanner.errorPage.label.hint')}</p>
  <Button onClick={() => window.location.reload()}>Reload</Button>
</div>
```

Pattern: Full-screen centered layout with illustration, heading, hint text, and a recovery action button.

### 12.2 Empty States

Handled per product domain with domain-specific illustrations and messaging:
- `ActivityEmpty.tsx` — "Any plans for {{location}}?"
- `AccommodationEmpty.tsx` — "Looking for a place to stay?"
- `FlightManagementEmpty.tsx` — "Flying to {{location}}?"
- `EmptyState.tsx` (generic filters) — `SearchX` icon + configurable title/subtitle/description

### 12.3 Confirmation Dialogs

Pattern for destructive actions:
- Question: "Do you really want to remove {{name}}?"
- Two buttons: "Cancel" (secondary) and "Remove" (destructive)
- Uses Dialog component with `DialogTitle`, `DialogDescription`, `DialogFooter`

### 12.4 Partial Failures

Handled with specific messaging:
- "Flight removed, but rebooking other flights failed. Please add flights manually."
- "Flights have been automatically updated for your new route"

### 12.5 Invalid Data / IPC Errors

- "Invalid data received from planner app. Please try again."
- "Missing critical values from planner. Please try again."

### 12.6 Offline Behavior

Not explicitly implemented. The application assumes online connectivity. API failures surface as toast error notifications with retry guidance.

### 12.7 Permission Requests

Not applicable — the application runs within an iframe and doesn't request device permissions. All data access goes through API services.

---

## Appendix A: File Reference

| Category | Key Files |
|----------|-----------|
| CSS variables & theme | `src/styles/tailwind.css` |
| Toast styling | `src/styles/toastify.css` |
| Theme context | `src/shared/contexts/ThemeContext.tsx` |
| Constants | `src/shared/utils/constants.ts` |
| Tailwind utility (`cn`) | `src/shared/utils/tailwind.ts` |
| UI components | `src/shared/components/ui/*.tsx` (50+ files) |
| Drawer components | `src/shared/components/drawer/*.tsx` |
| Shared components | `src/shared/components/*.tsx` |
| Error handling | `src/shared/services/api/errorHandling.ts` |
| Toast utility | `src/shared/utils/toast.ts` |
| English translations | `src/shared/assets/l18n/en.json` |
| Routes | `src/shared/pages/routes.ts` |

## Appendix B: Technology Stack Reference

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5.7+ | Type safety |
| Vite | 6 | Bundler |
| Tailwind CSS | v4.1.4 | Utility-first CSS |
| Radix UI | Latest | Accessible primitives (Dialog, Select, Popover, Tooltip, etc.) |
| Framer Motion | Latest | Complex animations (expand/collapse) |
| Lucide React | 0.577.0 | Icon library |
| react-hook-form | Latest | Form state management |
| Zod | Latest | Runtime schema validation |
| @hookform/resolvers | Latest | Zod integration for forms |
| TanStack Query | Latest | Server state management |
| react-toastify | Latest | Toast notifications |
| Embla Carousel | Latest | Carousel/slider |
| react-day-picker | Latest | Calendar component |
| cmdk | Latest | Command palette |
| clsx + tailwind-merge | Latest | Class merging utility |
| i18next | Latest | Internationalization |
| Axios | Latest | HTTP client |
| date-fns / dayjs | Latest | Date utilities |

---

## Appendix C: Quick Reference Tables

### Typography Quick Ref

| Context | Classes |
|---------|---------|
| Dialog title | `text-xl leading-none font-extrabold` |
| Drawer header (desktop) | `text-3xl font-bold` |
| Drawer header (mobile) | `text-xl font-bold` |
| Card title | `leading-none font-semibold` |
| Card description | `text-muted-foreground text-xs` |
| Field label | `text-sm leading-snug font-medium` |
| Field description | `text-sm leading-normal font-normal text-muted-foreground` |
| Error message | `text-sm font-normal text-destructive` |
| Button text | `text-xs font-medium` (inherited from Button component) |
| Badge text | `text-xs font-medium` (inherited from Badge component) |

### Border Radius by Element

| Element | Class |
|---------|-------|
| Buttons | `rounded-md` |
| Inputs | `rounded-lg` |
| Cards | `rounded-xl` |
| Badges | `rounded-md` |
| Dialogs (mobile) | `rounded-t-3xl` |
| Dialogs (desktop) | `rounded-3xl` |
| Icon buttons | `rounded-full` |

### Button Variant Decision Tree

```
Is this the main action on screen? → primary
Is it a supporting/secondary action? → secondary
Is it low-emphasis / less important? → tertiary
Does it delete/remove something? → destructive
Is it sitting on top of an image / hero overlay? → inverted
Is it just text with no emphasis? → text
Is it a navigation link? → link
Is it contextual / appears on hover? → ghost
```

### Icon Status Colors

| Status | Icon | Class |
|--------|------|-------|
| Success | `CircleCheck` | `stroke-success` |
| Error | `CircleX` | `stroke-danger` |
| Warning | `TriangleAlert` | `stroke-warning` |
| Info | `Info` | `stroke-info` |

### Common a11y Violations & Fixes

| Pattern | Fix |
|---------|-----|
| `<div onClick={...}>` | Use `<button>` |
| Icon button without label | Add `aria-label="description"` |
| Decorative icon without hiding | Add `aria-hidden="true"` |
| `data-testid="..."` | Replace with `data-feature-id="..."` |
| `outline-none` without focus ring | Add `focus-visible:ring-ring/50 focus-visible:ring-[3px]` |
| `<img>` without alt | Add `alt="description"` or `alt=""` if decorative |

### i18n Key Format

```
module.context.purpose.name

Examples:
  smartplanner.accommodation.error.selectionFailed
  groundTransports.searchForm.error.departure.required
  hotelSearch.filters.starsLabel
```

### CTA Wording Conventions

| Action | Pattern | Example |
|--------|---------|---------|
| Selection | Choose [item] | Choose activity |
| Addition | Add [item] | Add flight |
| Editing | Change [item] | Change hotel |
| Removal | Remove [item] | Remove flight |
| Browse | Go to all [items] | Go to all hotels |
| Load more | Load more [items] | Load more activities |
| Back | Back to [location] | Back to Planner |

### Animation Durations

| Context | Duration |
|---------|----------|
| Overlays (dialog, popover, tooltip) | 200ms |
| Drawer slide | 300ms, ease-in-out |
| Framer Motion collapsible | 0.2s |
| Toast auto-close | 5000ms |

### Forbidden Patterns (also caught by pre-push hooks)

- `data-testid` in source files → use `data-feature-id`
- `@ts-ignore` or `@ts-expect-error`
- `as any` type assertions
- Explicit `any` type annotations
- `biome-ignore` for complexity/correctness/suspicious/a11y/performance/style
- `dangerouslySetInnerHTML` without DOMPurify
- Direct `fetch()` in components
- Direct `localStorage`/`sessionStorage` in components
- Literal query key arrays (use `queryKeys.*`)
- `Math.random()`, `Date.now()`, `new Date()`, `crypto.randomUUID()` in render

---

## Appendix D: Discovery App (Next.js 15)

> **Scope**: Rules in this appendix apply to files under `apps/discovery/`. All rules in §1–§12 (colors, typography, icons, spacing, components, accessibility, etc.) apply equally — Discovery shares the same Tailwind tokens and design language. This appendix covers only the patterns that are **unique to Next.js App Router**.

### D.1 Shared Design Tokens

Discovery uses **identical** CSS custom properties to SmartPlanner:

| Token category | Source file |
|----------------|-------------|
| Color variables | `apps/discovery/src/styles/globals.css` |
| Tailwind utilities | Same `@theme inline` block — same token names |
| `cn()` utility | `apps/discovery/src/lib/cn.ts` (clsx + tailwind-merge) |
| Font | Mulish via `next/font/google` (NOT a Google Fonts URL import) |

**Font difference**: Discovery uses `next/font/google` for automatic font optimization:
```tsx
// apps/discovery/src/app/layout.tsx
import { Mulish } from 'next/font/google';
const mulish = Mulish({ subsets: ['latin'], variable: '--font-mulish' });
```
**Rule**: Never import fonts via a `<link>` tag or CSS `@import url()` in Discovery. Always use `next/font/google`.

### D.2 Server vs Client Components

Next.js App Router components are **Server Components by default**. Only add `'use client'` when genuinely needed.

| Use Server Component (default) | Use Client Component (`'use client'`) |
|-------------------------------|---------------------------------------|
| Fetching data from APIs | Event handlers (`onClick`, `onChange`) |
| Accessing environment variables | React hooks (`useState`, `useEffect`, `useRef`) |
| Static or server-rendered content | Browser APIs (`localStorage`, `window`) |
| Layout, page, not-found files | Animations (Framer Motion) |
| Components with no interactivity | Form submissions with react-hook-form |

**Rule**: Never add `'use client'` to `layout.tsx`, `page.tsx`, `not-found.tsx`, `loading.tsx`, or `error.tsx` — these are framework-managed. Extract interactive parts into a separate client component and import it instead.

**Rule**: Never use `async` in a Client Component (`'use client'` file). Async data fetching belongs in Server Components or Route Handlers.

### D.3 File Conventions (App Router)

| File | Location | Purpose |
|------|----------|---------|
| `layout.tsx` | Any route segment | Persistent layout wrapper — **never** `'use client'` |
| `page.tsx` | Any route segment | Route UI, publicly accessible |
| `loading.tsx` | Any route segment | Suspense fallback (auto-wraps page in `<Suspense>`) |
| `error.tsx` | Any route segment | Error boundary (`'use client'` required by Next.js) |
| `not-found.tsx` | `app/` | Custom 404 — call `notFound()` to trigger |
| `route.ts` | `app/api/**/` | Route Handler (API endpoint) — never alongside `page.tsx` |
| `middleware.ts` | `apps/discovery/src/` | Runs before every request |

**Rule**: `error.tsx` is the **only** framework file that requires `'use client'` — Next.js enforces this because error boundaries must be React class components or hooks-based.

### D.4 Async Patterns (Next.js 15)

In Next.js 15, `params`, `searchParams`, `cookies()`, and `headers()` are all **async**. Always `await` them.

```tsx
// ✅ Correct — Next.js 15 async params
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>{id}</div>;
}

// ❌ Wrong — synchronous params (Next.js 14 pattern, deprecated)
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>;
}
```

```tsx
// ✅ Correct — async cookies/headers
import { cookies, headers } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
}
```

### D.5 Data Fetching Patterns

| Pattern | When to use |
|---------|-------------|
| `async` Server Component with `fetch()` | Default — static or revalidated data, no user interaction needed |
| Route Handler (`route.ts`) | External API calls that need to be proxied, webhooks, auth callbacks |
| Server Action (`'use server'`) | Form submissions, mutations triggered from the UI |
| Client Component + `useEffect` | Data that depends on browser state, user-specific real-time data |

**Rule**: Never call external APIs directly from Client Components using `fetch()` or `axios`. Proxy through a Route Handler or fetch in a Server Component parent and pass data as props.

**Rule**: Avoid request waterfalls — fetch data in parallel using `Promise.all()` or fetch at the highest possible Server Component level rather than in nested children.

```tsx
// ✅ Parallel fetching
const [user, trips] = await Promise.all([getUser(id), getTrips(id)]);

// ❌ Sequential waterfall
const user = await getUser(id);
const trips = await getTrips(user.id); // Waits for user before starting
```

### D.6 Route Handlers

File: `apps/discovery/src/app/api/**/route.ts`

```typescript
// ✅ Standard Route Handler pattern
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Only when response must not be cached

export async function GET(request: Request) {
  try {
    const data = await fetchSomeData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

**Rule**: Never place a `route.ts` and a `page.tsx` in the same directory segment — they conflict. Use `app/api/` subdirectories for all API routes.

**Rule**: Use `dynamic = 'force-dynamic'` only when the response genuinely changes per request (e.g., reads cookies or request headers). Static responses should be cached by default.

### D.7 Navigation

| Action | API |
|--------|-----|
| Programmatic navigation | `import { useRouter } from 'next/navigation'` |
| Links | `import Link from 'next/link'` — never `<a href>` for internal routes |
| Redirect (server-side) | `import { redirect } from 'next/navigation'` — never in try/catch |
| 404 (server-side) | `import { notFound } from 'next/navigation'` |
| Read current path | `import { usePathname } from 'next/navigation'` (Client Component) |
| Read search params (server) | `searchParams` prop on `page.tsx` (async in Next.js 15) |
| Read search params (client) | `useSearchParams()` — wrap in `<Suspense>` |

**Rule**: Never use `useRouter` from `next/router` (Pages Router) — Discovery uses App Router exclusively. Always import from `next/navigation`.

**Rule**: `redirect()` throws an error internally, so wrapping it in try/catch will silently swallow the redirect. Always call `redirect()` outside of try/catch blocks.

### D.8 Images & Fonts

```tsx
// ✅ Always use next/image for images
import Image from 'next/image';
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />

// ❌ Never use plain <img> for content images (no optimization)
<img src="/hero.jpg" alt="Hero" />
```

**Rule**: Use `priority` prop on above-the-fold images (LCP candidates) to avoid lazy-loading the largest visible image.

**Rule**: Always specify `width` and `height` on `next/image` to prevent layout shift. Use `fill` prop with a positioned container when dimensions are unknown.

### D.9 Metadata & SEO

```tsx
// Static metadata (layout.tsx or page.tsx)
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
};

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const trip = await getTrip(id);
  return { title: trip.name };
}
```

**Rule**: Every `page.tsx` must export either `metadata` or `generateMetadata`. Pages without metadata get no `<title>` tag, which hurts SEO and accessibility.

### D.10 Testing in Discovery

Discovery uses the same Vitest + React Testing Library setup as SmartPlanner with one key difference — no i18n mock is needed yet (i18n not yet implemented).

```tsx
// Server Components: render directly (no providers needed for pure server components)
import { render, screen } from '@testing-library/react';
import Page from './page';

it('renders heading', () => {
  render(<Page />);
  expect(screen.getByRole('heading')).toBeInTheDocument();
});
```

**Rule**: Co-locate test files with the component (`page.test.tsx` next to `page.tsx`). Do not create a separate `__tests__` directory unless testing shared utilities.

### D.11 Discovery-Specific Forbidden Patterns

In addition to the global forbidden patterns (§Appendix C), these are specific to Discovery:

- `import { useRouter } from 'next/router'` → use `next/navigation`
- `<a href="/internal-route">` → use `<Link href="/internal-route">`
- `async` Client Component → only Server Components can be async
- `'use client'` on `layout.tsx` → extract interactive parts to a child component
- `params.id` without `await` → always `await params` in Next.js 15
- `redirect()` inside try/catch → call outside try/catch
- `<img>` for content images → use `next/image`
- `@import url("https://fonts.googleapis.com/...")` in CSS → use `next/font/google`
- Direct external API calls in Client Components → proxy via Route Handler or fetch in Server Component

---

## Appendix E: Code Architecture Patterns

> This appendix answers the questions an AI (or new engineer) will ask when adding a feature: *Where does this file go? What does a module look like inside? How do I manage state? What does a service call look like? Can I add this library?*

### E.1 File & Folder Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Component files | `PascalCase.tsx` | `HotelOfferCard.tsx` |
| Hook files | `camelCase.ts` with `use` prefix | `useHotelOffers.ts` |
| Service files | `camelCase.ts` | `plannerAPI.ts` |
| Utility files | `camelCase.ts` | `dateHelper.ts` |
| Schema files | `PascalCase.ts` | `Accommodation.ts` |
| Test files | `*.test.ts(x)` — co-located | `HotelOfferCard.test.tsx` |
| Props interfaces | `PascalCase` + `Props` suffix | `HotelOfferCardProps` |
| Zod schemas | `PascalCase` + `Schema` suffix | `AccommodationSchema` |
| Zod-inferred types | `PascalCase` + `Type` suffix | `AccommodationType` |
| i18n keys | `module.context.purpose.name` | `smartplanner.accommodation.error.selectionFailed` |
| Feature IDs | `smartplanner_category_action` | `smartplanner_hotels_select-from-recommendations` |
| Constants | `UPPER_SNAKE_CASE` | `TIME_DURATION.MINUTES_5` |

**File placement rules:**

| What | Where |
|------|-------|
| Shared UI primitives (shadcn-based) | `src/shared/components/ui/` |
| Shared product components | `src/shared/components/products/` |
| Module-specific components | `src/modules/[module]/components/` |
| Shared hooks | `src/shared/hooks/` |
| Module-specific hooks | `src/modules/[module]/hooks/` |
| Shared API services | `src/shared/services/api/` |
| Module-specific services | `src/modules/[module]/services/` |
| Shared Zod schemas | `src/shared/schemas/planner/` |
| Module-specific schemas | `src/modules/[module]/schemas/` |
| Translation files | `src/shared/assets/l18n/{locale}.json` |

**Rule**: Code moves to `shared/` only when it is used by **two or more** modules. Do not prematurely extract to shared.

### E.2 Module Anatomy

Every feature module under `src/modules/` follows this internal structure. An AI adding a new module or a new file to an existing module must respect this layout:

```
src/modules/[moduleName]/
├── components/       # React components — rendering only, no business logic
├── hooks/            # Custom hooks — state, query orchestration, mutation logic
├── services/         # API calls, request/response handling, Zod validation
├── pages/            # Route components + routes.ts (RouteObject[])
├── schemas/          # Zod schemas and inferred types
├── types/            # Module-local type definitions (enums, UI-only models)
├── utils/            # Pure utility functions and data transforms
└── __tests__/        # Shared test utilities, fixtures, and mock factories
```

Existing modules for reference:

| Module | Path | Purpose |
|--------|------|---------|
| `smartPlanner` | `src/modules/smartPlanner/` | Core itinerary management (100+ files) |
| `hotelOffersDrawer` | `src/modules/hotelOffersDrawer/` | Hotel selection modal |
| `rentalCarOffersDrawer` | `src/modules/rentalCarOffersDrawer/` | Rental car selection modal |
| `activityOffersDrawer` | `src/modules/activityOffersDrawer/` | Activity selection modal |
| `flightSearchDrawer` | `src/modules/flightSearchDrawer/` | Flight search interface |
| `groundTransports` | `src/modules/groundTransports/` | Ground transportation |

**Rule**: Modules must not import **components** from other modules. Shared components go in `src/shared/components/`. Hooks from one module can be imported by another only when they encapsulate shared domain logic — this should be rare.

**Cross-module communication** is done via shared API services and TanStack Query cache invalidation only — never via direct imports of stateful logic between modules.

**Exception:** Hooks from one module can be imported by another for shared domain logic, but this should be rare. If it becomes common for a particular hook, move it to `src/shared/hooks/`.

**Shared code qualification:** Code moves to `src/shared/` only when it is used by **two or more** modules. Avoid premature extraction.

### E.3 State Management Strategy

There is **no Zustand, Redux, Jotai, Recoil, or other global state library** in this project. Do not add one.

State is managed in three layers:

| Layer | Tool | When to use |
|-------|------|-------------|
| Server / async state | **TanStack Query** (`useQuery`, `useMutation`) | Any data from an API call — primary choice |
| App-wide UI state | **React Context** | Low-frequency, rarely-changing state shared across the app |
| Local UI state | **`useState`** | Ephemeral state local to one component (open/closed, input value) |

**Existing contexts** (do not duplicate these):

| Context | Provider | What it provides |
|---------|----------|-----------------|
| `ConfigurationContext` | `src/shared/contexts/ConfigurationContext.tsx` | `SmartPlannerConfiguration` loaded from API at startup |
| `ThemeContext` | `src/shared/contexts/ThemeContext.tsx` | Dynamic colors, fonts, radius — injects CSS variables |
| `ViewModeProvider` | Inside `smartPlanner` module | List vs map view toggle |

**Decision guide:**
- "Will this data come from a network request?" → TanStack Query
- "Does this state need to be accessible across the whole app without prop drilling?" → Context
- "Is this state local to one component or one small subtree?" → `useState`
- "Does it need to survive navigation?" → TanStack Query cache or Context

**Rule**: Always wrap TanStack Query usage in a custom hook. Never call `useQuery` or `useMutation` directly inside a component.

### E.4 Canonical API / Data-Fetching Pattern

Every API feature follows the same three-layer pattern: **service → hook → component**.

**Layer 1 — Service** (`src/modules/[module]/services/` or `src/shared/services/api/`):

```typescript
// src/modules/hotelOffersDrawer/services/hotelService.ts
import { plannerClient } from '@/shared/services/api/plannerAPI';
import { handleErrors } from '@/shared/services/api/errorHandling';
import { HotelOffersSchema, type HotelOffersType } from '@/modules/hotelOffersDrawer/schemas/HotelOffers';

export const getHotelOffers = async (itineraryId: string, legId: string): Promise<HotelOffersType> => {
  if (!itineraryId || !legId) throw new Error('Missing required parameters');
  try {
    const response = await plannerClient.get(`/itineraries/${itineraryId}/legs/${legId}/hotel-offers`);
    return HotelOffersSchema.parse(response.data);
  } catch (error: unknown) {
    return handleErrors(error);
  }
};
```

**Layer 2 — Hook** (`src/modules/[module]/hooks/`):

```typescript
// src/modules/hotelOffersDrawer/hooks/useHotelOffers.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/utils/queryKeys';
import { getHotelOffers } from '@/modules/hotelOffersDrawer/services/hotelService';
import { TIME_DURATION } from '@/shared/utils/constants';

export const useHotelOffers = (itineraryId: string, legId: string) => {
  const hotelOffersQuery = useQuery({
    queryKey: queryKeys.hotelOffers(itineraryId, legId),
    queryFn: () => getHotelOffers(itineraryId, legId),
    enabled: !!itineraryId && !!legId,
    staleTime: TIME_DURATION.MINUTES_5,
  });
  return { hotelOffersQuery };
};
```

**Layer 3 — Component** (`src/modules/[module]/components/`):

```tsx
// src/modules/hotelOffersDrawer/components/HotelOffersList.tsx
import { useHotelOffers } from '@/modules/hotelOffersDrawer/hooks/useHotelOffers';
import { showToast } from '@/shared/utils/toast';
import { useTranslation } from 'react-i18next';

interface HotelOffersListProps {
  itineraryId: string;
  legId: string;
}

export const HotelOffersList = ({ itineraryId, legId }: HotelOffersListProps) => {
  const { t } = useTranslation();
  const { hotelOffersQuery } = useHotelOffers(itineraryId, legId);

  if (hotelOffersQuery.isPending) return <Skeleton />;
  if (hotelOffersQuery.isError) {
    showToast.error(t('hotelOffers.error.loadFailed'));
    return null;
  }

  return (
    <ul>
      {hotelOffersQuery.data.offers.map((offer) => (
        <HotelOfferCard key={offer.id} offer={offer} />
      ))}
    </ul>
  );
};
```

**Enforcement:** `fetch()` in components, direct `localStorage`/`sessionStorage` access, literal query key arrays, and non-determinism in render are all forbidden and enforced by Biome rules. See `CLAUDE.md` for the full enforcement list.

### E.5 Dependency Policy (What Not to Install)

Before adding any npm package, check whether the use case is already covered by an existing dependency. A PR that introduces a library with duplicate purpose will be rejected in review.

| Problem to solve | Use this | Do NOT install |
|-----------------|----------|----------------|
| Date manipulation | `date-fns` and `dayjs` (both present) | `moment`, `luxon`, `temporal-polyfill` |
| Form state & validation | `react-hook-form` + `zod` + `@hookform/resolvers` | `formik`, `final-form`, `react-final-form` |
| HTTP requests | `axios` via shared `plannerClient` | `ky`, `got`, one-off `axios.create()` instances |
| Utility-first CSS | Tailwind CSS v4 + CSS custom properties | `styled-components`, `emotion`, `CSS Modules`, `sass`, `less` |
| Complex animations | Framer Motion | `react-spring`, `GSAP`, `anime.js`, `motion` (standalone) |
| Simple CSS transitions | Tailwind `tw-animate-css` + `transition-*` classes | Additional animation libraries |
| Icons | `lucide-react` | `react-icons`, `heroicons`, `phosphor-icons`, Font Awesome, Material Icons |
| Toast notifications | `react-toastify` via `showToast.*` | `react-hot-toast`, `sonner`, `notistack` |
| Schema validation | `zod` | `yup`, `joi`, `superstruct`, `valibot` |
| Server state & caching | TanStack Query | `SWR`, `Apollo Client`, `react-query` (same thing — already installed as `@tanstack/react-query`) |
| Global client state | React Context + `useState` | `zustand`, `jotai`, `redux`, `recoil`, `valtio` |
| Carousel / slider | `embla-carousel-react` | `swiper`, `react-slick`, `keen-slider`, `splide` |
| Date picker / calendar | `react-day-picker` | `react-datepicker`, `flatpickr`, `pikaday` |
| Class name merging | `clsx` + `tailwind-merge` via `cn()` utility | `classnames`, custom string concatenation |
| Internationalization | `i18next` + `react-i18next` | `react-intl`, `lingui`, `next-i18next` |
| Command palette | `cmdk` | Custom implementations |
| Tables | Plain `<table>` with Tailwind | `TanStack Table`, `ag-grid`, `react-table` |
| Accessible primitives | Radix UI | `headlessui`, `reach-ui`, `ariakit` |

**Rule**: If you believe a new library is genuinely needed, open a discussion in the PR description explaining why the existing stack cannot cover the use case. Don't install first and justify later.

### E.6 Schema & Type System

One schema per file in `src/shared/schemas/planner/`. Export schema + inferred type. Use `AssertSubtype` to verify alignment with generated OpenAPI types at compile time:

```typescript
export const AccommodationSchema = z.object({ /* ... */ });
export type AccommodationType = z.infer<typeof AccommodationSchema>;

// Assert that the Zod-inferred type is assignable to the auto-generated OpenAPI type
const _: AssertSubtype<AccommodationType, Accommodation> = true;
```

This catches breaking API changes (removed/renamed fields, type changes, required field additions) while allowing additive optional fields in the generated type — so the build doesn't break every time the backend adds a new optional field.

**Three-layer type strategy:**

1. **Generated types** (`types/generated/`) — Auto-generated from OpenAPI. Never edit. Used only in schema files for `AssertSubtype` checks and as API request body types.
2. **Zod schemas** (`schemas/`) — Source of truth for runtime validation. Import these for type inference.
3. **Local types** (`types/local/`) — Domain-specific types not derived from the API (enums, UI-only models, union types).

**Rule**: In components, hooks, and utils — always use types inferred from Zod schemas (`@/shared/schemas/*`), not generated types (`@/shared/types/generated/*`). Generated types only for schema definitions and API boundary validation.
