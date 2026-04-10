// ─────────────────────────────────────────────────────────────────────────────
// hotelUtils.ts — shared hotel helper functions
//
// These were previously duplicated between HotelDetailPage and
// PackageDetailPage. Moving them here means any future change only needs to
// happen in one place.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a hotel location string to approximate [lat, lng] coordinates.
 * Used to centre the LeafletMap in "Show on map" modals.
 */
export function locationCoords(location: string): [number, number] {
  const loc = location.toLowerCase();
  if (loc.includes("cancún") || loc.includes("cancun") || loc.includes("mexico"))
    return [21.1619, -86.8515];
  if (loc.includes("bali") || loc.includes("seminyak") || loc.includes("indonesia"))
    return [-8.6905, 115.1709];
  if (loc.includes("maldives") || loc.includes("malé"))
    return [4.1755, 73.5093];
  if (loc.includes("santorini") || loc.includes("greece"))
    return [36.3932, 25.4615];
  if (loc.includes("dubai") || loc.includes("palm"))
    return [25.2048, 55.2708];
  if (loc.includes("phuket") || loc.includes("thailand"))
    return [7.8804, 98.3923];
  // Default fallback — centre of Europe
  return [48.8566, 2.3522];
}

/**
 * Returns destination-aware "Getting around" points of interest.
 */
export function nearbyPOIs(location: string): { label: string; distance: string }[] {
  const loc = location.toLowerCase();
  if (loc.includes("cancún") || loc.includes("cancun") || loc.includes("mexico")) {
    return [
      { label: "Playa Delfines", distance: "5 min" },
      { label: "El Centro", distance: "20 min" },
      { label: "La Isla Mall", distance: "10 min" },
      { label: "Cancún Airport", distance: "25 min" },
    ];
  }
  if (loc.includes("bali") || loc.includes("seminyak") || loc.includes("indonesia")) {
    return [
      { label: "Kuta Beach", distance: "10 min" },
      { label: "Seminyak Square", distance: "5 min" },
      { label: "Tanah Lot Temple", distance: "35 min" },
      { label: "Ngurah Rai Airport", distance: "20 min" },
    ];
  }
  if (loc.includes("dubai") || loc.includes("palm")) {
    return [
      { label: "Dubai Mall", distance: "15 min" },
      { label: "JBR Beach", distance: "10 min" },
      { label: "Burj Khalifa", distance: "15 min" },
      { label: "Dubai Airport", distance: "30 min" },
    ];
  }
  if (loc.includes("maldives") || loc.includes("malé")) {
    return [
      { label: "Snorkelling Reef", distance: "On-site" },
      { label: "Spa Island", distance: "On-site" },
      { label: "Velana Airport", distance: "30 min by boat" },
    ];
  }
  if (loc.includes("santorini") || loc.includes("greece")) {
    return [
      { label: "Oia Village", distance: "10 min" },
      { label: "Amoudi Bay", distance: "15 min" },
      { label: "Fira Town", distance: "20 min" },
      { label: "Santorini Airport", distance: "25 min" },
    ];
  }
  if (loc.includes("phuket") || loc.includes("thailand")) {
    return [
      { label: "Patong Beach", distance: "10 min" },
      { label: "Old Phuket Town", distance: "20 min" },
      { label: "Phi Phi Islands", distance: "1.5 hr boat" },
      { label: "Phuket Airport", distance: "40 min" },
    ];
  }
  return [
    { label: "City Centre", distance: "15 min" },
    { label: "Local Beach", distance: "5 min" },
    { label: "Airport", distance: "30 min" },
  ];
}

/**
 * Returns a destination-aware short + long hotel description.
 * The short blurb appears inline; the long one is revealed in a modal.
 */
export function hotelDescription(
  name: string,
  location: string
): { short: string; long: string } {
  const loc = location.toLowerCase();

  if (loc.includes("cancún") || loc.includes("cancun") || loc.includes("mexico")) {
    return {
      short: `Turquoise Caribbean water, powdery white sand, and ${name}'s acclaimed service — right on the Hotel Zone's most coveted beachfront strip.`,
      long: "Rooms are bright and spacious with floor-to-ceiling windows framing the sea. From morning swims to sunset cocktails, everything is steps away — beach, pool, restaurants, and the city's vibrant nightlife.",
    };
  }
  if (loc.includes("bali") || loc.includes("indonesia")) {
    return {
      short: `Tropical gardens, rice-paddy views and Balinese hospitality — ${name} captures exactly what makes Bali unforgettable.`,
      long: "Wake to birdsong, cool off in a private villa pool, and let the spa melt away every care. The hotel sits between Seminyak's buzzing restaurants and quiet temple roads.",
    };
  }
  if (loc.includes("maldives")) {
    return {
      short: `Overwater villas, crystal-clear lagoons, and total seclusion — ${name} is the Maldives at its most pure.`,
      long: "Each villa opens directly onto the Indian Ocean. Days here are spent snorkelling pristine reefs, dining at sunset over the water, and doing nothing at all with great purpose.",
    };
  }
  if (loc.includes("santorini") || loc.includes("greece")) {
    return {
      short: `Clifftop infinity pools, iconic white-washed architecture, and the world's most famous sunset — ${name} sits at the heart of Santorini's magic.`,
      long: "The caldera views from the terrace make every morning feel cinematic. Local wine, fresh seafood, and a stunning pool await — Oia's winding lanes are minutes on foot.",
    };
  }
  if (loc.includes("dubai")) {
    return {
      short: `The skyline, the beach, the excess — ${name} puts you at the centre of Dubai's most glamorous stretch.`,
      long: "An iconic address on Palm Jumeirah with a private beach, waterpark, and some of the city's best restaurants under one roof. The kind of hotel you check into and don't want to leave.",
    };
  }
  if (loc.includes("phuket") || loc.includes("thailand")) {
    return {
      short: `Secluded on its own private bay, ${name} offers a slice of Thailand that feels completely removed from the crowds.`,
      long: "Villa pools, Thai spa treatments, and some of Phuket's finest cooking — all against a backdrop of extraordinary Andaman Sea views. This is the good life, done properly.",
    };
  }
  return {
    short: `${name} earns every star — warm service, a location that puts everything within reach, and rooms designed to make you want to stay longer than planned.`,
    long: "Consistently praised by guests for its hospitality, facilities, and attention to detail. Whether you're here to explore or to do absolutely nothing, this hotel makes the perfect base.",
  };
}
