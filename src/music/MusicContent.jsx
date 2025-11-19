import React from "react";
import { SongCard } from "./SongCard";

export function MusicContent({ songs, onPresent, onEdit }) {
  const count = songs.length;

  return (
    <section className="music-content">
      <div className="music-content__meta">
        <div className="music-content__meta-count">
          <strong>{count}</strong> canción{count === 1 ? "" : "es"}
        </div>
        <div className="music-content__meta-hint">
          Haz clic en <strong>Presentar</strong> para abrir en pantalla grande.
        </div>
      </div>

      {count === 0 ? (
        <div className="music-empty">
          <strong>No hay canciones todavía.</strong>
          Añade tu primera canción con el botón “Añadir música”.
        </div>
      ) : (
        <div className="music-grid">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onPresent={() => onPresent(song)}
              onEdit={() => onEdit(song)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
