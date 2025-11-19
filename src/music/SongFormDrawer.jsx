import React, { useEffect, useMemo, useState } from "react";

const TAG_PRESETS = ["alabanza", "instrumental", "ofrendas", "corito"];

export function SongFormDrawer({ song, onClose, onSave }) {
  const [name, setName] = useState(song?.name || "");
  const [url, setUrl] = useState(song?.url || "");
  const [lyrics, setLyrics] = useState(song?.lyrics || "");
  const [tags, setTags] = useState(song?.tags || []);
  const [textColor, setTextColor] = useState(song?.defaultTextColor || "white");
  const [blur, setBlur] = useState(
    typeof song?.defaultBlur === "boolean" ? song.defaultBlur : true
  );
  const [coverFile, setCoverFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [name, url, lyrics]);

  const canSave = useMemo(() => {
    const hasName = name.trim().length > 0;
    const hasContent =
      (url && url.trim().length > 0) || (lyrics && lyrics.trim().length > 0);
    return hasName && hasContent;
  }, [name, url, lyrics]);

  function toggleTag(t) {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSave) {
      setError("Ponle un nombre y al menos letra o URL.");
      return;
    }

    const payload = {
      id: song?.id,
      name: name.trim(),
      url: url.trim(),
      lyrics: lyrics.trim(),
      tags,
      defaultTextColor: textColor,
      defaultBlur: blur,
      coverFile,
    };

    await onSave(payload);
  }

  return (
    <div className="song-drawer-backdrop" onClick={onClose}>
      <aside
        className="song-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="song-drawer__header">
          <div>
            <h2>{song ? "Editar canción" : "Nueva canción"}</h2>
            <p className="song-drawer__subtitle">
              Guarda la letra y/o el enlace para usarla en presentaciones.
            </p>
          </div>
          <button
            type="button"
            className="song-drawer__close"
            onClick={onClose}
          >
            Cerrar
          </button>
        </header>

        <form className="song-drawer__body" onSubmit={handleSubmit}>
          <div className="song-drawer__field">
            <label>Nombre de la canción</label>
            <input
              className="song-drawer__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. No temeré"
            />
          </div>

          <div className="song-drawer__field">
            <label>URL de YouTube (opcional)</label>
            <input
              className="song-drawer__input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtu.be/..."
            />
            <div className="song-drawer__hint">
              Si añades URL y letra, se mostrará la letra por defecto.
            </div>
          </div>

          <div className="song-drawer__field">
            <label>Letra (opcional)</label>
            <textarea
              className="song-drawer__textarea"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Pega la letra aquí. Deja líneas en blanco para separar diapositivas."
            />
          </div>

          <div className="song-drawer__field">
            <label>Etiquetas</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TAG_PRESETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={
                    "music-toolbar__chip" +
                    (tags.includes(t) ? " music-toolbar__chip--active" : "")
                  }
                  onClick={() => toggleTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="song-drawer__tagsHelp">
              Estas etiquetas se usan para los filtros rápidos.
            </div>
          </div>

          <div className="song-drawer__field">
            <label>Imagen de portada (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="song-drawer__input"
            />
            <div className="song-drawer__hint">
              Si no subes imagen, intentaremos usar el thumbnail de YouTube.
            </div>
          </div>

          <div className="song-drawer__field">
            <label>Estilo de texto</label>
            <div style={{ display: "flex", gap: 10 }}>
              <label>
                <input
                  type="radio"
                  value="white"
                  checked={textColor === "white"}
                  onChange={() => setTextColor("white")}
                />{" "}
                Texto claro
              </label>
              <label>
                <input
                  type="radio"
                  value="black"
                  checked={textColor === "black"}
                  onChange={() => setTextColor("black")}
                />{" "}
                Texto oscuro
              </label>
            </div>
          </div>

          <div className="song-drawer__field">
            <label>
              <input
                type="checkbox"
                checked={blur}
                onChange={(e) => setBlur(e.target.checked)}
              />{" "}
              Aplicar blur detrás del panel de texto
            </label>
          </div>

          {error && <div className="song-drawer__error">{error}</div>}

          <div className="song-drawer__footer">
            <button
              type="button"
              className="song-drawer__btn song-drawer__btn--ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="song-drawer__btn song-drawer__btn--primary"
              disabled={!canSave}
            >
              {song ? "Guardar cambios" : "Guardar canción"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
