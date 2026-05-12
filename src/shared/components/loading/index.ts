// Barrel export for the loading kit. Single import path keeps the page-level
// imports tidy and makes it easy to discover what's available.
//
//   import { SkeletonCard, StaggeredList } from "@/shared/components/loading";
//
// No decorative loaders — per the doc, the page structure + skeletons are
// the loading state. A status banner handles 3s+ waits, no animated globe.

export { SkeletonCard } from "./SkeletonCard";
export { StreamingStatusBanner } from "./StreamingStatusBanner";
export { StaggeredList } from "./StaggeredList";
export { ImageWithPlaceholder } from "./ImageWithPlaceholder";
