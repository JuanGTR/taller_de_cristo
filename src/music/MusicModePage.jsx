import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MusicLayout } from "./MusicLayout";
import { MusicToolbar } from "./MusicToolBar";
import { MusicContent } from "./MusicContent";
import { SongFormDrawer } from "./SongFormDrawer";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { listenToSongs, createSong, updateSong } from "./songsApi";
import { storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useMusicPlayer } from "../context/MusicPlayerContext"; // 🔹 NEW

/** ---------- Helpers for YouTube ---------- */
function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1);
    }
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
  } catch (e) {
    return null;
  }
  return null;
}

function getYouTubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/** ---------- Lyrics → slides helper ---------- */
// Simple rule: separate slides by blank lines
function lyricsToChunks(lyrics = "") {
  const trimmed = lyrics.trim();
  if (!trimmed) return [];
  const rawChunks = trimmed.split(/\n\s*\n/); // split by empty line
  return rawChunks.map((block) => block.trim());
}

/** ---------- Upload cover to Storage ---------- */
async function uploadCoverFile(songId, file) {
  if (!file) return null;
  const fileRef = ref(storage, `songCovers/${songId}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
}

export function MusicModePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    // from SettingsContext
    setDeck,
    setCurrentIndex,
  } = useSettings();

  const { playSong, playingSong } = useMusicPlayer(); // 🔹 NEW

  // 🔎 UI state
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | tag
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  // 🔥 Songs from Firestore
  const [songs, setSongs] = useState([]);

  // Seed query if Home sent an input
  useEffect(() => {
    const initial = location.state?.input;
    if (initial && !query) {
      setQuery(initial);
    }
  }, [location.state, query]);

  // Subscribe to Firestore when user changes
  useEffect(() => {
    console.log("[MusicModePage] user changed:", user?.uid);
    if (!user) {
      setSongs([]);
      return;
    }

    const unsub = listenToSongs((nextSongs) => {
      console.log("[MusicModePage] listener (user) songs:", nextSongs);
      setSongs(nextSongs);
    }, user.uid); // orgId = user.uid

    return () => unsub();
  }, [user]);

  // 🔍 filtering
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesFilter =
        activeFilter === "all" || song.tags?.includes(activeFilter);

      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        song.name.toLowerCase().includes(q) ||
        (song.tags || []).some((t) => t.toLowerCase().includes(q));

      return matchesFilter && matchesQuery;
    });
  }, [songs, query, activeFilter]);

  const handleAdd = () => {
    setEditingSong(null);
    setIsFormOpen(true);
  };

  const handleEdit = (song) => {
    setEditingSong(song);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSong(null);
  };

  // Optional: scroll to a specific song (e.g., from global search)
  useEffect(() => {
    if (location.state?.focusSongId) {
      const target = document.getElementById(
        `song-${location.state.focusSongId}`
      );
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [songs, location.state]);

  /** ---------- PRESENT logic ---------- */
  const handlePresent = (song) => {
    if (!song) return;

    const hasLyrics = !!song.lyrics?.trim();
    const hasUrl = !!song.url?.trim();

    if (!hasLyrics && !hasUrl) {
      console.warn("Song has neither lyrics nor url, nothing to present", song);
      return;
    }

    let deckItem;

    // Default to lyrics if they exist (even if there's also a URL)
    if (hasLyrics) {
      const chunks = lyricsToChunks(song.lyrics);

      deckItem = {
        type: "songLyrics",
        songId: song.id,
        name: song.name,
        ref: song.name, // used in dock/operator
        chunks, // array of stanza strings
      };
    } else if (hasUrl) {
      // URL only → video mode
      deckItem = {
        type: "songVideo",
        songId: song.id,
        name: song.name,
        ref: song.name,
        url: song.url,
      };
    }

    if (!deckItem) return;

    const newDeck = [deckItem];
    setDeck(newDeck);
    setCurrentIndex(0);

    // 🔹 Keep localStorage in sync so a brand new /present window can hydrate
    try {
      localStorage.setItem("altarpro.deck", JSON.stringify(newDeck));
      localStorage.setItem("altarpro.index", "0");
    } catch (e) {
      console.warn(
        "No se pudo guardar la presentación de música en localStorage",
        e
      );
    }

    // 🔹 Open or reuse the presenter window/tab (same as Bible)
    if (typeof window !== "undefined") {
      window.open("/present", "altarpro-presenter");
    }
  };

  /** ---------- BACKGROUND YOUTUBE PLAYBACK ---------- */
  const handlePlaySong = (song) => {
    playSong(song);
  };

  /** ---------- SAVE (Firestore + Storage) ---------- */
  async function handleSaveSong(partialSong) {
    console.log("[MusicModePage] handleSaveSong:", partialSong);

    const baseData = {
      name: partialSong.name,
      url: partialSong.url || null,
      lyrics: partialSong.lyrics || null,
      tags: partialSong.tags || [],
      defaultTextColor: partialSong.defaultTextColor || "white",
      defaultBlur:
        typeof partialSong.defaultBlur === "boolean"
          ? partialSong.defaultBlur
          : true,
    };

    const youtubeThumbnailUrl = baseData.url
      ? getYouTubeThumbnail(baseData.url)
      : null;

    try {
      let songId = partialSong.id || null;

      if (songId) {
        console.log("[MusicModePage] updating song:", songId);
        await updateSong(songId, {
          ...baseData,
          youtubeThumbnailUrl,
        });
      } else {
        console.log("[MusicModePage] creating new song for org:", user?.uid);
        songId = await createSong(
          {
            ...baseData,
            youtubeThumbnailUrl,
          },
          user?.uid || null
        );
        console.log("[MusicModePage] new songId:", songId);
      }

      if (partialSong.coverFile && songId) {
        console.log("[MusicModePage] uploading cover for song:", songId);
        const coverUrl = await uploadCoverFile(songId, partialSong.coverFile);
        console.log("[MusicModePage] coverUrl:", coverUrl);
        if (coverUrl) {
          await updateSong(songId, { coverImageUrl: coverUrl });
        }
      }

      setIsFormOpen(false);
      setEditingSong(null);
    } catch (err) {
      console.error("[MusicModePage] Error saving song:", err);
    }
  }

  return (
    <MusicLayout>
      <MusicToolbar
        query={query}
        onQueryChange={setQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onAdd={handleAdd}
      />

      <MusicContent
        songs={filteredSongs}
        onPresent={handlePresent}
        onEdit={handleEdit}
        onPlay={handlePlaySong}
        playingSongId={playingSong?.id || null}
      />

      {isFormOpen && (
        <SongFormDrawer
          song={editingSong}
          onClose={handleFormClose}
          onSave={handleSaveSong}
        />
      )}
    </MusicLayout>
  );
}
