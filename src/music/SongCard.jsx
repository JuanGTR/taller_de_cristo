import React, { useMemo } from "react";

export function SongCard({
  song,
  onPresent,
  onEdit,
  onPlay,      // 🔹 NEW
  isPlaying,   // 🔹 NEW
}) {
  const {
    name,
    tags = [],
    coverImageUrl,
    youtubeThumbnailUrl,
    url,
    lyrics,
  } = song;

  const hasLyrics = !!lyrics && lyrics.trim().length > 0;
  const hasUrl = !!url && url.trim().length > 0;

  const cover = coverImageUrl || youtubeThumbnailUrl || null;

  const primaryType = useMemo(() => {
    if (hasLyrics && hasUrl) return "Letra + Video";
    if (hasLyrics) return "Sólo letra";
    if (hasUrl) return "Sólo video";
    return "Sin contenido";
  }, [hasLyrics, hasUrl]);

  const handleCoverClick = () => {
    if (onPlay) {
      onPlay();
    }
  };

  return (
    <article
      id={`song-${song.id}`}
      className={`song-card${isPlaying ? " song-card--playing" : ""}`} // 🔹 optional highlight
    >
      <div
        className="song-card__coverWrap"
        onClick={handleCoverClick}      // 🔹 click cover → background play
        role={onPlay ? "button" : undefined}
        tabIndex={onPlay ? 0 : undefined}
      >
        {cover ? (
          <img
            src={cover}
            alt={name}
            className="song-card__cover"
            loading="lazy"
          />
        ) : (
          <div className="song-card__cover" aria-hidden="true" />
        )}
        <div className="song-card__coverOverlay" />

        <div className="song-card__badgeRow">
          <div className="song-card__badge song-card__badge--pill">
            <span className="song-card__badge-dot" />
            {primaryType}
          </div>
          {hasUrl && (
            <div className="song-card__badge">
              <span>▶</span> YouTube
            </div>
          )}
        </div>
      </div>

      <div className="song-card__body">
        <h3 className="song-card__title">{name}</h3>

        {tags.length > 0 && (
          <div className="song-card__tags">
            {tags.map((t) => (
              <span key={t} className="song-card__tag">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="song-card__meta">
          <span>
            {hasLyrics ? "Incluye letra" : "Sin letra"} ·{" "}
            {hasUrl ? "Tiene video" : "Sin video"}
          </span>
        </div>
      </div>

      <div className="song-card__actions">
        <button
          type="button"
          className="song-card__btn song-card__btn--primary"
          onClick={onPresent}
          disabled={!hasLyrics && !hasUrl}
        >
          <span>⬤</span> Presentar
        </button>
        <button
          type="button"
          className="song-card__btn"
          onClick={onEdit}
        >
          <span>✎</span> Editar
        </button>
      </div>
    </article>
  );
}
