// ─────────────────────────────────────────────────────────────────────────────
// mergeDeduplicated
//
// Merges a "live" batch of packages into the existing package list, using
// deduplicationKey to decide whether a live result replaces a cached one
// (same key) or is a new addition (unseen key).
//
// Rules:
//   1. If a live package shares a deduplicationKey with an existing one,
//      the live package REPLACES the existing one (live data is fresher).
//   2. If a live package has a new key, it is APPENDED to the list.
//   3. The original ordering is preserved — replaced packages stay at the
//      same position in the list; new ones appear at the end.
// ─────────────────────────────────────────────────────────────────────────────

import { UnifiedPackage } from '../../../types';

export function mergeDeduplicated(
  existing: UnifiedPackage[],
  incoming: UnifiedPackage[]
): UnifiedPackage[] {
  // Build a map of deduplicationKey → package from ALL incoming packages.
  // If two incoming packages somehow share a key, last one wins.
  const incomingMap = new Map(incoming.map(p => [p.deduplicationKey, p]));

  // Track which keys from the existing list we've already placed.
  const seen = new Set<string>();

  // First pass: iterate over the existing list in order.
  // If the incoming batch has a replacement for that key, use it.
  // Otherwise keep the original.
  const result: UnifiedPackage[] = [];
  for (const pkg of existing) {
    const replacement = incomingMap.get(pkg.deduplicationKey);
    result.push(replacement ?? pkg);
    seen.add(pkg.deduplicationKey);
  }

  // Second pass: append any incoming packages that weren't replacements
  // (i.e. packages with keys we haven't seen yet — genuinely new results).
  for (const [key, pkg] of incomingMap) {
    if (!seen.has(key)) {
      result.push(pkg);
    }
  }

  return result;
}
