import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setSoundEnabled } from "./soundUtils";

interface FontScale {
  base: number;
  bubble: number;
  heading: number;
}

interface AppSettings {
  textSize: "A" | "AA" | "AAA";
  soundEnabled: boolean;
  animationsEnabled: boolean;
  hapticsEnabled: boolean;
}

interface AppContextType {
  settings: AppSettings;
  fontScale: FontScale;
  updateTextSize: (size: "A" | "AA" | "AAA") => void;
  toggleSound: (enabled: boolean) => void;
  toggleAnimations: (enabled: boolean) => void;
  toggleHaptics: (enabled: boolean) => void;
}

const STORAGE_KEY = "amber-app-settings";

const fontScales: Record<"A" | "AA" | "AAA", FontScale> = {
  A: { base: 13, bubble: 14, heading: 16 },
  AA: { base: 15, bubble: 16, heading: 18 },
  AAA: { base: 18, bubble: 19, heading: 22 },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function applyFontVariables(size: "A" | "AA" | "AAA") {
  const root = document.documentElement;

  const bodySize = size === "A" ? 14 : size === "AAA" ? 19 : 16;
  const smallSize = size === "A" ? 12 : size === "AAA" ? 16 : 14;
  const titleSize = size === "A" ? 28 : size === "AAA" ? 38 : 32;
  const subtitleSize = size === "A" ? 20 : size === "AAA" ? 26 : 22;
  const cardTextSize = size === "A" ? 14 : size === "AAA" ? 18 : 16;
  const captionSize = size === "A" ? 11 : size === "AAA" ? 15 : 13;

  const settingsTitle = size === "A" ? 30 : size === "AAA" ? 40 : 34;
  const settingsRow = size === "A" ? 14 : size === "AAA" ? 18 : 16;
  const settingsMeta = size === "A" ? 11 : size === "AAA" ? 15 : 13;
  const settingsDescription = size === "A" ? 13 : size === "AAA" ? 17 : 15;
  const settingsSection = size === "A" ? 11 : size === "AAA" ? 14 : 12;
  const graphTick = size === "A" ? 11 : size === "AAA" ? 14 : 12;
  const graphTooltip = size === "A" ? 12 : size === "AAA" ? 15 : 13;

  root.style.setProperty("--font-body", `${bodySize}px`);
  root.style.setProperty("--font-small", `${smallSize}px`);
  root.style.setProperty("--font-title", `${titleSize}px`);
  root.style.setProperty("--font-subtitle", `${subtitleSize}px`);
  root.style.setProperty("--font-card-text", `${cardTextSize}px`);
  root.style.setProperty("--font-caption", `${captionSize}px`);

  root.style.setProperty("--font-settings-title", `${settingsTitle}px`);
  root.style.setProperty("--font-settings-row", `${settingsRow}px`);
  root.style.setProperty("--font-settings-meta", `${settingsMeta}px`);
  root.style.setProperty("--font-settings-description", `${settingsDescription}px`);
  root.style.setProperty("--font-settings-section", `${settingsSection}px`);
  root.style.setProperty("--font-graph-tick", `${graphTick}px`);
  root.style.setProperty("--font-graph-tooltip", `${graphTooltip}px`);

  root.setAttribute("data-text-size", size);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === "undefined") {
      return {
        textSize: "AA",
        soundEnabled: true,
        animationsEnabled: true,
        hapticsEnabled: true,
      };
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        textSize: "AA",
        soundEnabled: true,
        animationsEnabled: true,
        hapticsEnabled: true,
      };
    }

    try {
      return JSON.parse(stored) as AppSettings;
    } catch {
      return {
        textSize: "AA",
        soundEnabled: true,
        animationsEnabled: true,
        hapticsEnabled: true,
      };
    }
  });

  useEffect(() => {
    applyFontVariables(settings.textSize);
    setSoundEnabled(settings.soundEnabled);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value = useMemo<AppContextType>(
    () => ({
      settings,
      fontScale: fontScales[settings.textSize],
      updateTextSize: (size) => setSettings((prev) => ({ ...prev, textSize: size })),
      toggleSound: (enabled) => setSettings((prev) => ({ ...prev, soundEnabled: enabled })),
      toggleAnimations: (enabled) => setSettings((prev) => ({ ...prev, animationsEnabled: enabled })),
      toggleHaptics: (enabled) => setSettings((prev) => ({ ...prev, hapticsEnabled: enabled })),
    }),
    [settings],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}