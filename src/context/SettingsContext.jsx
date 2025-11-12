import { createContext, useContext, useEffect, useMemo, useState } from "react";

const Ctx = createContext(null);

// Defaults
const DEFAULT_SETTINGS = {
  fontRem: 2.2,
  lineHeight: 1.4,
  maxWidthPx: 1000,
  versesPerSlide: 1,
  showVerseNumbers: true,
  showRef: true,
  showDock: true,
  dockAutoHideSec: 6,
  // Background controls
  backgroundUrl: null,   // data URL or http(s)
  backgroundDim: 0.35,   // 0..0.9 recommended
  backdropBlurPx: 8,     // 0..24ish
  textColor: "light",    // "light" (white text) or "dark" (black text)
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [deck, setDeck] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Hydrate
  useEffect(() => {
    try {
      const s = localStorage.getItem("altarpro.settings");
      if (s) setSettings(prev => ({ ...prev, ...JSON.parse(s) }));

      const d = localStorage.getItem("altarpro.deck");
      if (d) setDeck(JSON.parse(d));

      const i = localStorage.getItem("altarpro.index");
      if (i) setCurrentIndex(Number(i));
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem("altarpro.settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (deck) localStorage.setItem("altarpro.deck", JSON.stringify(deck));
    else localStorage.removeItem("altarpro.deck");
  }, [deck]);

  useEffect(() => {
    localStorage.setItem("altarpro.index", String(currentIndex));
  }, [currentIndex]);

  function updateSetting(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  function updateSettings(patch) {
    setSettings(prev => ({ ...prev, ...patch }));
  }

  const value = useMemo(() => ({
    settings, updateSetting, updateSettings,
    deck, setDeck,
    currentIndex, setCurrentIndex,
  }), [settings, deck, currentIndex]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
