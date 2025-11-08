import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "altarpro.settings.v1";

const DEFAULTS = {
  text: {
    // CSS var friendly strings
    fontSize: "clamp(1.6rem, 4vw, 5rem)",
    lineHeight: 1.24,
    maxWidth: "80ch",
    weight: 600,
  },
  verses: {
    showNumbers: true,
    showReference: true,
    chunkMode: "one", // "one" | "fit"
    fitTarget: 340,   // rough chars target for fit mode
  },
  dock: {
    autoHide: true,
    timeout: 2200,
  },
  theme: {
    preset: "dark",
    textColor: "#ffffff",
    accent: "#88ccff",
    bg: "#000000",
  }
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  // persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
  }, [settings]);

  const api = useMemo(() => ({
    settings,
    setText: (partial) =>
      setSettings(s => ({ ...s, text: { ...s.text, ...partial } })),
    setVerses: (partial) =>
      setSettings(s => ({ ...s, verses: { ...s.verses, ...partial } })),
    setDock: (partial) =>
      setSettings(s => ({ ...s, dock: { ...s.dock, ...partial } })),
    setTheme: (partial) =>
      setSettings(s => ({ ...s, theme: { ...s.theme, ...partial } })),
    reset: () => setSettings(DEFAULTS),
  }), [settings]);

  return (
    <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
