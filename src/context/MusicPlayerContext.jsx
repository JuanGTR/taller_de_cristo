import React, {
  createContext,
  useContext,
  useState,
  useMemo,
} from "react";

const MusicPlayerCtx = createContext(null);

// Helper local para YouTube
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

export function MusicPlayerProvider({ children }) {
  const [playingSong, setPlayingSong] = useState(null); // { id, name, url, videoId }
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (song) => {
    if (!song || !song.url) return;
    const videoId = extractYouTubeId(song.url);
    if (!videoId) return;

    setPlayingSong({
      id: song.id,
      name: song.name,
      url: song.url,
      videoId,
    });
    setIsPlaying(true);
  };

  const stop = () => {
    setIsPlaying(false);
    setPlayingSong(null);
  };

  const togglePlay = () => {
    if (!playingSong) return;
    setIsPlaying((prev) => !prev);
  };

  const value = useMemo(
    () => ({
      playingSong,
      isPlaying,
      playSong,
      stop,
      togglePlay,
    }),
    [playingSong, isPlaying]
  );

  return (
    <MusicPlayerCtx.Provider value={value}>
      {children}

      {/* iframe oculto que realmente reproduce el audio */}
      {playingSong && isPlaying && (
        <iframe
          title={playingSong.name || "YouTube audio"}
          style={{ width: 0, height: 0, border: 0 }}
          src={`https://www.youtube.com/embed/${playingSong.videoId}?autoplay=1`}
          allow="autoplay; encrypted-media"
        />
      )}
    </MusicPlayerCtx.Provider>
  );
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerCtx);
  if (!ctx) {
    throw new Error(
      "useMusicPlayer debe usarse dentro de MusicPlayerProvider"
    );
  }
  return ctx;
}
