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

  // 🔹 Helper: split lyrics into chunks (stanzas) by blank lines
  function splitLyricsIntoChunks(lyrics) {
    if (!lyrics) return [];
    return lyrics
      .trim()
      .split(/\n\s*\n+/)          // blank line(s) separate stanzas
      .map(chunk => chunk.trim())
      .filter(Boolean);
  }

  // 🔹 Helper: normalize text color to match settings tokens ("light"/"dark")
  function normalizeTextColor(color) {
    if (!color) return settings.textColor || "light";
    // Accept "white"/"black" OR "light"/"dark"
    if (color === "white") return "light";
    if (color === "black") return "dark";
    return color; // assume already "light"/"dark"
  }

  // 🔹 Present: lyrics mode for songs
  // song: { id, name, lyrics?, lyricChunks?, defaultTextColor?, defaultBlur? }
  function presentSongLyrics(song) {
    if (!song) return;
    const chunks =
      song.lyricChunks && song.lyricChunks.length
        ? song.lyricChunks
        : splitLyricsIntoChunks(song.lyrics || "");

    const textColor = normalizeTextColor(song.defaultTextColor);
    const blur = song.defaultBlur ?? true;

    const item = {
      type: "songLyrics",
      songId: song.id,
      name: song.name,
      chunks,
      textColor, // "light"/"dark"
      blur,      // boolean, for background blur behind text
    };

    setDeck([item]);
    setCurrentIndex(0);
  }

  // 🔹 Present: video mode for songs
  // song: { id, name, url, defaultTextColor?, defaultBlur? }
  function presentSongVideo(song) {
    if (!song || !song.url) return;

    const textColor = normalizeTextColor(song.defaultTextColor);
    const blur = song.defaultBlur ?? true;

    const item = {
      type: "songVideo",
      songId: song.id,
      name: song.name,
      url: song.url,
      textColor,
      blur,
    };

    setDeck([item]);
    setCurrentIndex(0);
  }

  // 🔹 Present: auto choose (your rule: both → lyrics first)
  function presentSongAuto(song) {
    if (!song) return;
    const hasLyrics = !!song.lyrics && song.lyrics.trim().length > 0;
    const hasUrl = !!song.url && song.url.trim().length > 0;

    if (hasLyrics && !hasUrl) {
      presentSongLyrics(song);
    } else if (!hasLyrics && hasUrl) {
      presentSongVideo(song);
    } else if (hasLyrics && hasUrl) {
      // default: lyrics mode
      presentSongLyrics(song);
    } else {
      // nothing to present
      console.warn("Song has neither lyrics nor URL:", song);
    }
  }

  const value = useMemo(() => ({
    settings,
    updateSetting,
    updateSettings,

    deck,
    setDeck,
    currentIndex,
    setCurrentIndex,

    // expose helpers for music mode
    splitLyricsIntoChunks,
    presentSongLyrics,
    presentSongVideo,
    presentSongAuto,
  }), [settings, deck, currentIndex]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
