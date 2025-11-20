import React from "react";
import { useMusicPlayer } from "../context/MusicPlayerContext";

export function NowPlayingBar() {
  const { playingSong, isPlaying, togglePlay, stop } = useMusicPlayer();

  if (!playingSong) return null; // nada si no hay canción sonando

  return (
    <div className="now-playing-bar">
      <div className="now-playing-bar__title">
        🎧 {playingSong.name}
      </div>
      <button
        type="button"
        className="now-playing-bar__btn"
        onClick={togglePlay}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button
        type="button"
        className="now-playing-bar__btn"
        onClick={stop}
      >
        ⏹
      </button>
    </div>
  );
}
