// src/pages/Operator.jsx
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

import '../styles/operator.css';

function chunkByCount(versesArray, count = 1) {
  const out = [];
  const size = Math.max(1, Number(count) || 1);
  for (let i = 0; i < versesArray.length; i += size) {
    out.push(versesArray.slice(i, i + size));
  }
  return out;
}

// simple helper: read file as data URL (persists via localStorage)
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const rd = new FileReader();
    rd.onload = () => resolve(rd.result);
    rd.onerror = reject;
    rd.readAsDataURL(file);
  });
}

export default function Operator() {
  const navigate = useNavigate();
  const {
    settings, updateSetting,
    deck, currentIndex, setCurrentIndex,
  } = useSettings();

  const first = deck && deck[0];
  const contentType = first?.type || 'bible'; // "bible" | "songLyrics" | "songVideo"
  const versesPerSlide = settings?.versesPerSlide ?? 1;

  // 🔹 Bible-only normalization for preview
  const bibleFlatVerses =
    first && contentType === 'bible' && Array.isArray(first?.verses) && first.verses.length
      ? first.verses
      : first && contentType === 'bible' && Array.isArray(first?.chunks) && first.chunks.length
        ? first.chunks.flat()
        : [];

  const bibleChunks = chunkByCount(bibleFlatVerses, versesPerSlide);

  // 🔹 Song lyrics slides: first.chunks is array of stanza strings
  const lyricSlides =
    first && contentType === 'songLyrics' && Array.isArray(first.chunks)
      ? first.chunks
      : [];

  // 🔹 Song video slides: single “slide”
  const videoSlidesCount = contentType === 'songVideo' ? 1 : 0;

  // 🔹 Total slides depending on type
  let total = 0;
  if (!first) {
    total = 0;
  } else if (contentType === 'bible') {
    total = bibleChunks.length;
  } else if (contentType === 'songLyrics') {
    total = lyricSlides.length;
  } else if (contentType === 'songVideo') {
    total = videoSlidesCount;
  }

  const safeIndex = Math.max(0, Math.min(currentIndex, Math.max(0, total - 1)));

  const bibleSlide = contentType === 'bible' && total ? bibleChunks[safeIndex] : null;
  const lyricSlide =
    contentType === 'songLyrics' && total ? lyricSlides[safeIndex] : null;

  async function onPickBackground(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataURL(file);
    updateSetting('backgroundUrl', dataUrl);
  }
  function clearBackground() {
    updateSetting('backgroundUrl', null);
  }

  const dec = (k, step, min, max) => () =>
    updateSetting(k, Math.max(min, Math.min(max, (settings[k] ?? 0) - step)));
  const inc = (k, step, min, max) => () =>
    updateSetting(k, Math.max(min, Math.min(max, (settings[k] ?? 0) + step)));

  // style helpers for preview panel
  const textMode = settings.textColor ?? 'light';
  const isLight = textMode === 'light';
  const textColor = isLight ? '#fff' : '#111';
  const panelBg = isLight ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.25)';
  const blurPx = settings.backdropBlurPx ?? 8; // 0–24
  const backgroundDim = settings.backgroundDim ?? 0.35; // 0–0.9

  const hasContent = !!first && total > 0;

  // Dock chips: Bible ref or song name
  const refLabel =
    contentType === 'bible'
      ? first?.ref
      : first?.name;

  return (
    <div className="container operator">
      {/* Live preview */}
      <div
        className="operator__preview card"
        style={{
          position: 'relative',
          aspectRatio: '16/9',
          overflow: 'hidden'
        }}
      >
        {/* background image layer */}
        {settings.backgroundUrl && (
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${settings.backgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: 'translateZ(0)'
            }}
          />
        )}
        {/* dim overlay */}
        <div
          aria-hidden
          style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${backgroundDim})` }}
        />

        {/* content panel with optional backdrop blur */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            padding: 24
          }}
        >
          {!hasContent ? (
            <div style={{ color: '#9ab4ff', fontWeight: 600 }}>Esperando presentación…</div>
          ) : (
            <div
              className="operator__panel"
              style={{
                maxWidth: (settings.maxWidthPx ?? 1100),
                padding: '22px 28px',
                borderRadius: 16,
                textAlign: 'center',
                color: textColor,
                fontSize: `${settings.fontRem ?? 2.2}rem`,
                lineHeight: settings.lineHeight ?? 1.35,
                background: panelBg,
                backdropFilter: blurPx ? `saturate(1.1) blur(${blurPx}px)` : undefined,
                WebkitBackdropFilter: blurPx ? `saturate(1.1) blur(${blurPx}px)` : undefined,
                boxShadow: '0 8px 28px rgba(0,0,0,0.25)'
              }}
            >
              {/* chips for ref/song name + counter */}
              <div className="operator__ref">
                {settings.showRef && refLabel && (
                  <span className="operator__chip">{refLabel}</span>
                )}
                <span className="operator__chip operator__chip--muted">
                  {safeIndex + 1}/{total}
                </span>
              </div>

              {/* Content depending on type */}
              {contentType === 'songLyrics' ? (
                lyricSlide ? (
                  lyricSlide.split('\n').map((line, idx) => (
                    <div
                      key={idx}
                      className="operator__verse"
                      style={{ margin: '6px 0' }}
                    >
                      {line}
                    </div>
                  ))
                ) : (
                  <div className="operator__verse" style={{ margin: '6px 0' }}>
                    Sin letra disponible para esta canción.
                  </div>
                )
              ) : contentType === 'songVideo' ? (
                <div className="operator__verse" style={{ margin: '6px 0' }}>
                  <strong>Modo video:</strong> {first?.name || 'Canción'}
                  <br />
                  <span style={{ fontSize: '0.8em', opacity: 0.8 }}>
                    URL: {first?.url || 'N/A'}
                  </span>
                </div>
              ) : (
                // Bible mode (original behavior)
                bibleSlide?.map(v => (
                  <div
                    key={v.n}
                    className="operator__verse"
                    style={{ margin: '6px 0' }}
                  >
                    {settings.showVerseNumbers && (
                      <strong className="operator__num" style={{ marginRight: 8 }}>
                        {v.n}
                      </strong>
                    )}
                    {v.t}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="card operator__transport">
        {/* Navigation row (remote-style) */}
        <div className="operator__navRow">
          <button
            className="button"
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          >
            ◀ Anterior
          </button>
          <button
            className="button button--primary"
            onClick={() => setCurrentIndex(i => Math.min((total - 1), i + 1))}
          >
            Siguiente ▶
          </button>
          <button
            className="button button--ghost"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.open('/present', 'altarpro-presenter');
              }
            }}
          >
            Abrir Presentación
          </button>
        </div>

        {/* Settings sections */}
        <div className="operator__sections">
          <fieldset>
            <legend>Tipografía</legend>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ minWidth: 140 }}>Tamaño de letra</label>
              <button className="button" onClick={dec('fontRem', 0.1, 1.0, 6)}>−</button>
              <div className="readout">{(settings.fontRem ?? 2.2).toFixed(1)} rem</div>
              <button className="button" onClick={inc('fontRem', 0.1, 1.0, 6)}>+</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <label style={{ minWidth: 140 }}>Interlineado</label>
              <button className="button" onClick={dec('lineHeight', 0.05, 1.2, 2)}>−</button>
              <div className="readout">{(settings.lineHeight ?? 1.35).toFixed(2)}</div>
              <button className="button" onClick={inc('lineHeight', 0.05, 1.2, 2)}>+</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <label style={{ minWidth: 140 }}>Ancho máx. texto</label>
              <button className="button" onClick={dec('maxWidthPx', 50, 600, 1600)}>−</button>
              <div className="readout">{settings.maxWidthPx ?? 1100}px</div>
              <button className="button" onClick={inc('maxWidthPx', 50, 600, 1600)}>+</button>
            </div>
          </fieldset>

          <fieldset>
            <legend>Diapositivas</legend>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ minWidth: 140 }}>Versos por slide</label>
              <button className="button" onClick={dec('versesPerSlide', 1, 1, 8)}>−</button>
              <div className="readout">{settings.versesPerSlide ?? 1}</div>
              <button className="button" onClick={inc('versesPerSlide', 1, 1, 8)}>+</button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <label>
                <input
                  type="checkbox"
                  checked={!!settings.showVerseNumbers}
                  onChange={(e)=>updateSetting('showVerseNumbers', e.target.checked)}
                />{" "}
                Mostrar # de verso (N)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={!!settings.showRef}
                  onChange={(e)=>updateSetting('showRef', e.target.checked)}
                />{" "}
                Mostrar referencia (R)
              </label>
            </div>
          </fieldset>

          {/* Background & panel style controls */}
          <fieldset>
            <legend>Fondo</legend>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ minWidth: 140 }}>Imagen de fondo</label>
              <input
                type="file"
                accept="image/*"
                onChange={onPickBackground}
                style={{ background: '#111', color: '#fff', borderRadius: 8, padding: '8px 10px' }}
              />
              {settings.backgroundUrl && (
                <button className="button" onClick={clearBackground}>Quitar fondo</button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
              <label style={{ minWidth: 140 }}>Oscurecer</label>
              <button className="button" onClick={dec('backgroundDim', 0.05, 0, 0.9)}>−</button>
              <div className="readout">{(settings.backgroundDim ?? 0.35).toFixed(2)}</div>
              <button className="button" onClick={inc('backgroundDim', 0.05, 0, 0.9)}>+</button>
            </div>
          </fieldset>

          <fieldset>
            <legend>Panel / Color</legend>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ minWidth: 140 }}>Desenfoque panel</label>
              <button className="button" onClick={dec('backdropBlurPx', 1, 0, 24)}>−</button>
              <div className="readout">{(settings.backdropBlurPx ?? 8)} px</div>
              <button className="button" onClick={inc('backdropBlurPx', 1, 0, 24)}>+</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <label style={{ minWidth: 140 }}>Color del texto</label>
              <select
                value={settings.textColor ?? 'light'}
                onChange={(e)=>updateSetting('textColor', e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8 }}
              >
                <option value="light">Blanco</option>
                <option value="dark">Negro</option>
              </select>
            </div>
          </fieldset>

          <fieldset>
            <legend>Dock</legend>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ minWidth: 140 }}>Mostrar dock</label>
              <input
                type="checkbox"
                checked={!!settings.showDock}
                onChange={(e)=>updateSetting('showDock', e.target.checked)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <label style={{ minWidth: 140 }}>Tiempo para ocultar</label>
              <button className="button" onClick={dec('dockAutoHideSec', 1, 0, 30)}>−</button>
              <div className="readout">{settings.dockAutoHideSec ?? 6}s</div>
              <button className="button" onClick={inc('dockAutoHideSec', 1, 0, 30)}>+</button>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
