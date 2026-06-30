// ── Discovery settings panel ─────────────────────────────────────────────────
// The contents of the gear popover on the Discovery page. It does two things:
//   1. Lets the presenter turn each Discovery tab on/off (off = hidden).
//   2. Lets them choose which airline the Stopover tab represents, which swaps
//      the routes shown and the hub used downstream.
// It reads and writes the shared settings via the useSettings() hook, so toggling
// anything here updates the live page immediately.

import { type ReactNode } from "react";
import { MapPin, Sparkles } from "lucide-react";
import { Switch } from "../../../shared/components/ui/switch";
import { useSettings } from "../../../shared/contexts/SettingsContext";
import { type TabId } from "../pages/DiscoveryPage";
import { STOPOVER_AIRLINES, type StopoverAirlineId } from "./flightSearch/stopoverAirlines";

// The tab list is owned by DiscoveryPage (it has the icons), so we receive it as
// a prop rather than duplicating it here.
type TabMeta = { id: TabId; label: string; icon: ReactNode };

// The order the airline options appear in the picker.
const AIRLINE_ORDER: StopoverAirlineId[] = ["fiji", "caribbean"];

export default function DiscoverySettingsPanel({ tabs }: { tabs: TabMeta[] }) {
  const { settings, setTabEnabled, setAiExperienceEnabled, setStopoverAirline } = useSettings();

  // How many tabs are currently on — used to stop the user disabling the LAST
  // one, which would leave the page with no content to show.
  const enabledCount = tabs.filter((t) => settings.enabledTabs[t.id]).length;

  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <h3 className="text-base font-bold text-foreground">Display settings</h3>
        <p className="text-sm text-muted-foreground">Choose what shows on Discovery</p>
      </div>

      {/* ── Tab toggles ── */}
      <div className="px-2 py-2">
        <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tabs</p>
        {tabs.map((tab) => {
          const isOn = settings.enabledTabs[tab.id];
          // Block turning off the final enabled tab so the page is never empty.
          const isLastOn = isOn && enabledCount === 1;
          return (
            <div key={tab.id}>
              <div className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-grey-lightest">
                <div className="flex items-center gap-3">
                  {/* Reuse the tab's own lucide icon so the panel matches the tab bar */}
                  <span className={isOn ? "text-foreground" : "text-muted-foreground"}>{tab.icon}</span>
                  <span className={`text-sm font-semibold ${isOn ? "text-foreground" : "text-muted-foreground"}`}>
                    {tab.label}
                  </span>
                </div>
                <Switch
                  checked={isOn}
                  disabled={isLastOn}
                  onCheckedChange={(checked) => setTabEnabled(tab.id, checked)}
                  aria-label={`Toggle ${tab.label} tab`}
                />
              </div>

              {/* ── Stopover airline sub-setting ──
                  Nested under the Stopover row, shown only while Stopover is on.
                  Switching airline changes the routes + hub everywhere downstream. */}
              {tab.id === "stopover" && isOn && (
                <div className="ml-9 mr-2 mb-2 mt-1 flex flex-col gap-2 border-l-2 border-border pl-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Airline</p>
                  {AIRLINE_ORDER.map((airlineId) => {
                    const airline = STOPOVER_AIRLINES[airlineId];
                    const selected = settings.stopoverAirline === airlineId;
                    return (
                      <button
                        key={airlineId}
                        type="button"
                        onClick={() => setStopoverAirline(airlineId)}
                        className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-grey"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
                            {airline.name}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={12} />
                            Hub: {airline.hubCity}
                          </span>
                        </div>
                        {/* Radio-style dot so the selected airline reads as "chosen" */}
                        <span
                          className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                            selected ? "border-primary bg-primary" : "border-grey"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Features ──
          Non-tab toggles. The AI Experience pill in the hero is hidden when off,
          so the demo can stay on the classic search experience. */}
      <div className="border-t border-border px-2 py-2">
        <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Features</p>
        <div className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-grey-lightest">
          <div className="flex items-center gap-3">
            <span className={settings.aiExperienceEnabled ? "text-foreground" : "text-muted-foreground"}>
              <Sparkles size={20} />
            </span>
            <span className={`text-sm font-semibold ${settings.aiExperienceEnabled ? "text-foreground" : "text-muted-foreground"}`}>
              AI Experience
            </span>
          </div>
          <Switch
            checked={settings.aiExperienceEnabled}
            onCheckedChange={setAiExperienceEnabled}
            aria-label="Toggle AI Experience"
          />
        </div>
      </div>
    </div>
  );
}
