import React from "react";
import "../styles/music.css";

export function MusicLayout({ children }) {
  return (
    <div className="music-page">
      <header className="music-page__header">
        <div className="music-page__titleBlock">
          <div className="music-page__icon">
            <span>🎵</span>
          </div>
          <div className="music-page__titles">
            <h1>Música &amp; Letras</h1>
            <p>
              Administra alabanzas, instrumentales y coritos listos para
              proyectar.
            </p>
          </div>
        </div>
      </header>

      <main className="music-page__main">{children}</main>
    </div>
  );
}
