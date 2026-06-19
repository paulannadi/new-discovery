// ── Discovery Settings context ───────────────────────────────────────────────
// A tiny global "settings clipboard" every screen can read. The settings gear on
// the Discovery page writes to it; the tab bar, the flight search form, and the
// results page all read from it. Because they share ONE object, flipping a tab
// off or switching the stopover airline updates every screen at once — no props
// have to be threaded through the whole flow.
//
// This is the only piece of global state in the prototype. We keep it deliberately
// small: which tabs are enabled, and which airline the Stopover tab represents.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type TabId } from "../../modules/smartPlanner/pages/DiscoveryPage";
import { type StopoverAirlineId } from "../../modules/smartPlanner/components/flightSearch/stopoverAirlines";

// The shape of everything the gear can control.
export type DiscoverySettings = {
  // Which Discovery tabs are switched on. A tab that's `false` is hidden entirely.
  enabledTabs: Record<TabId, boolean>;
  // Whether the "AI Experience" feature is offered. When false, the hero pill is
  // hidden and the page stays on the normal search experience.
  aiExperienceEnabled: boolean;
  // Which airline the Stopover tab is presenting (Fiji Airways / Caribbean Airlines).
  stopoverAirline: StopoverAirlineId;
};

// Defaults: every tab on, Fiji Airways selected. If a new tab is ever added to
// DiscoveryPage, add its id here too so it defaults to "on".
const DEFAULT_SETTINGS: DiscoverySettings = {
  enabledTabs: {
    holidays: true,
    hotels: true,
    flights: true,
    stopover: true,
    activities: true,
    cruises: true,
    events: true,
  },
  aiExperienceEnabled: true,
  stopoverAirline: "fiji",
};

// The localStorage key our saved settings live under. Bump the suffix if the
// shape ever changes in a way that old saved data couldn't satisfy.
const STORAGE_KEY = "discovery-settings-v1";

// Read saved settings once on startup, merging over the defaults so any tab we
// added since the user last saved still defaults to "on" (rather than undefined).
function loadSettings(): DiscoverySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw) as Partial<DiscoverySettings>;
    return {
      enabledTabs: { ...DEFAULT_SETTINGS.enabledTabs, ...saved.enabledTabs },
      aiExperienceEnabled: saved.aiExperienceEnabled ?? DEFAULT_SETTINGS.aiExperienceEnabled,
      stopoverAirline: saved.stopoverAirline ?? DEFAULT_SETTINGS.stopoverAirline,
    };
  } catch {
    // Corrupt/unavailable storage → just fall back to defaults rather than crash.
    return DEFAULT_SETTINGS;
  }
}

// What components get when they call useSettings().
type SettingsContextValue = {
  settings: DiscoverySettings;
  setTabEnabled: (id: TabId, enabled: boolean) => void;
  setAiExperienceEnabled: (enabled: boolean) => void;
  setStopoverAirline: (id: StopoverAirlineId) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser → loadSettings() runs once, not on every render.
  const [settings, setSettings] = useState<DiscoverySettings>(loadSettings);

  // Persist on every change so a demo setup survives a browser refresh.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage failures (e.g. private mode) — settings still work in-session.
    }
  }, [settings]);

  const setTabEnabled = (id: TabId, enabled: boolean) =>
    setSettings((prev) => ({
      ...prev,
      enabledTabs: { ...prev.enabledTabs, [id]: enabled },
    }));

  const setAiExperienceEnabled = (enabled: boolean) =>
    setSettings((prev) => ({ ...prev, aiExperienceEnabled: enabled }));

  const setStopoverAirline = (id: StopoverAirlineId) =>
    setSettings((prev) => ({ ...prev, stopoverAirline: id }));

  return (
    <SettingsContext.Provider value={{ settings, setTabEnabled, setAiExperienceEnabled, setStopoverAirline }}>
      {children}
    </SettingsContext.Provider>
  );
}

// The hook every screen uses to read/update settings. Throws if used outside the
// provider so a missing <SettingsProvider> is caught immediately in development.
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a <SettingsProvider>");
  }
  return ctx;
}
