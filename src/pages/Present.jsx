import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toggleFullscreen } from '../utils/fullscreen';
import { useSettings } from '../context/SettingsContext';
import styles from '../styles/Present.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faBookBible } from '@fortawesome/free-solid-svg-icons';

function chunkByCount(versesArray, count = 1) {
  const out = [];
  const size = Math.max(1, Number(count) || 1);
  for (let i = 0; i < versesArray.length; i += size) {
    out.push(versesArray.slice(i, i + size));
  }
  return out;
}

// Simple helper: extract YouTube id from URL
function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1);
    }
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v');
    }
  } catch (e) {
    return null;
  }
  return null;
}

export default function Present() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const containerRef = useRef(null);
  const touchStartX = useRef(null);

  const {
    settings,
    updateSetting,
    deck: ctxDeck, setDeck,
    currentIndex, setCurrentIndex,
    mode, // 🔹 NEW: read mode from settings context
  } = useSettings();

  const isPresenterCtx = mode === 'present'; // 🔹 true in this route with our current setup

  const [blackout, setBlackout] = useState(false);
  const [dockVisible, setDockVisible] = useState(true);
  const dockTimer = useRef(null);

  // Seed deck if navigation passes it in
  useEffect(() => {
    if (state?.deck && Array.isArray(state.deck) && state.deck.length) {
      setDeck(state.deck);
      setCurrentIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const deck = ctxDeck ?? [];
  const first = deck[0];
  const contentType = first?.type || 'bible'; // "bible" | "songLyrics" | "songVideo"
  const versesPerSlide = settings?.versesPerSlide ?? 1;

  // 🔵 NEW: smart source inference (Bible vs Music)
  const inferredSource =
    state?.source ||
    (contentType === 'bible' ? 'bible' : 'music');

  // Bible verses (existing logic)
  const bibleFlatVerses = useMemo(() => {
    if (!first || contentType !== 'bible') return [];
    if (Array.isArray(first?.verses) && first.verses.length) return first.verses;
    if (Array.isArray(first?.chunks) && first.chunks.length) return first.chunks.flat();
    return [];
  }, [first, contentType]);

  const bibleChunks = useMemo(
    () => chunkByCount(bibleFlatVerses, versesPerSlide),
    [bibleFlatVerses, versesPerSlide]
  );

  // Song lyrics: we treat first.chunks as already slide-based
  const lyricSlides = useMemo(() => {
    if (!first || contentType !== 'songLyrics') return [];
    if (Array.isArray(first.chunks)) return first.chunks;
    return [];
  }, [first, contentType]);

  // Song video: single slide
  const videoSlidesCount = contentType === 'songVideo' ? 1 : 0;

  // Total slides based on content type
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

  const bibleSlide = contentType === 'bible' && total ? bibleChunks[safeIndex] : [];
  const lyricSlide = contentType === 'songLyrics' && total ? lyricSlides[safeIndex] : null;

  // 🔹 Navigation is disabled in presenter-mode to avoid desync
  function goBack()  {
    if (isPresenterCtx) return;
    setCurrentIndex(i => Math.max(0, i - 1));
  }
  function goNext()  {
    if (isPresenterCtx) return;
    setCurrentIndex(i => Math.min((total - 1), i + 1));
  }
  function goFirst() {
    if (isPresenterCtx) return;
    setCurrentIndex(0);
  }
  function goLast()  {
    if (isPresenterCtx) return;
    setCurrentIndex(Math.max(0, total - 1));
  }

  function handleTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function handleTouchEnd(e) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 50) goBack();
    else if (dx < -50) goNext();
    touchStartX.current = null;
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.repeat) return;
      switch (e.key) {
        case 'ArrowLeft':  goBack(); break;
        case 'ArrowRight': goNext(); break;
        case ' ':          e.preventDefault(); goNext(); break;
        case 'Enter':      goNext(); break;
        case 'Home':       goFirst(); break;
        case 'End':        goLast(); break;
        case 'b': case 'B': setBlackout(b => !b); break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 'n': case 'N': updateSetting('showVerseNumbers', !settings.showVerseNumbers); break;
        case 'r': case 'R': updateSetting('showRef', !settings.showRef); break;
        default: break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settings.showVerseNumbers, settings.showRef, updateSetting]);

  function nudgeDock() {
    setDockVisible(true);
    if (dockTimer.current) clearTimeout(dockTimer.current);
    if (settings.showDock && settings.dockAutoHideSec > 0) {
      dockTimer.current = setTimeout(
        () => setDockVisible(false),
        (settings.dockAutoHideSec ?? 5) * 1000
      );
    }
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', nudgeDock);
    el.addEventListener('touchstart', nudgeDock);
    el.addEventListener('touchend', nudgeDock);
    return () => {
      el.removeEventListener('mousemove', nudgeDock);
      el.removeEventListener('touchstart', nudgeDock);
      el.removeEventListener('touchend', nudgeDock);
    };
  }, [settings.showDock, settings.dockAutoHideSec]);

  const fontRem   = settings.fontRem    ?? 2.2;
  const lh        = settings.lineHeight ?? 1.35;
  const maxWidth  = settings.maxWidthPx ?? 1100;

  const styleVars = {
    '--slide-font-size': `${fontRem}rem`,
    '--slide-line-height': lh,
    '--slide-max-width': `${maxWidth}px`,
    '--panel-blur': `${settings.backdropBlurPx ?? 0}px`,
  };

  const hasDeck = !!first;
  const rootColorClass =
    settings.textColor === 'dark'
      ? styles['present--dark']
      : styles['present--light'];

  // Dock label: Bible ref or song name
  let dockRef = '';
  if (settings.showRef && first) {
    if (contentType === 'bible') {
      dockRef = first.ref ?? '';
    } else {
      dockRef = first.name ?? '';
    }
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.present} ${rootColorClass} ${blackout ? styles['present--black'] : ''}`}
      style={styleVars}
    >
      {/* Background image + dim */}
      {settings.backgroundUrl && (
        <>
          <div
            className={styles.present__bg}
            style={{ backgroundImage: `url(${settings.backgroundUrl})` }}
          />
          <div
            className={styles.present__dim}
            style={{ backgroundColor: `rgba(0,0,0, ${settings.backgroundDim ?? 0.35})` }}
          />
        </>
      )}

      {!hasDeck ? (
        <div className={styles.present__empty}>
          <div>Esperando presentación…</div>
          <button
            className={styles.dock__button}
            onClick={() =>
              navigate(inferredSource === 'music' ? '/music' : '/bible')
            }
          >
            Ir a {inferredSource === 'music' ? 'Música' : 'Biblia'}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.present__verse}>
            <div className={styles.present__panel}>
              {contentType === 'songVideo' ? (
                // 🎬 Song video mode
                first.url ? (
                  (() => {
                    const vid = extractYouTubeId(first.url);
                    if (vid) {
                      return (
                        <div className={styles.present__videoWrapper}>
                          <iframe
                            className={styles.present__video}
                            src={`https://www.youtube.com/embed/${vid}?autoplay=1`}
                            title={first.name || 'Video'}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    // Non-YouTube URL fallback
                    return (
                      <div className={styles.present__line}>
                        No se puede reproducir el video. URL: {first.url}
                      </div>
                    );
                  })()
                ) : (
                  <div className={styles.present__line}>
                    No se encontró URL de video.
                  </div>
                )
              ) : contentType === 'songLyrics' ? (
                // 🎵 Song lyrics mode
                lyricSlide ? (
                  lyricSlide.split('\n').map((line, idx) => (
                    <div key={idx} className={styles.present__line}>
                      {line}
                    </div>
                  ))
                ) : (
                  <div className={styles.present__line}>
                    Sin letra disponible para esta canción.
                  </div>
                )
              ) : (
                // 📖 Bible mode (existing behavior)
                bibleSlide.map(v => (
                  <div key={v.n} className={styles.present__line}>
                    {settings.showVerseNumbers && <strong>{v.n}</strong>} {v.t}
                  </div>
                ))
              )}
            </div>
          </div>

          {settings.showDock && (
            <div
              className={`${styles.present__dock} ${
                dockVisible ? styles.isVisible : styles.isHidden
              }`}
            >
              <button
                className={styles.dock__button}
                onClick={() =>
                  navigate(inferredSource === 'music' ? '/music' : '/bible')
                }
              >
                {inferredSource === 'music' ? '🎵' : <FontAwesomeIcon icon={faBookBible} />}
              </button>

              <button className={styles.dock__button} onClick={goBack}>
                ←
              </button>
              <button className={styles.dock__button} onClick={toggleFullscreen}>
                ⛶
              </button>
              <div className={styles.dock__ref}>
                {dockRef}
                {total > 0 ? ` \u2022 ${safeIndex + 1}/${total}` : ''}
              </div>
              <div className={styles.dock__actions}>
                <button className={styles.dock__button} onClick={goNext}>
                  →
                </button>
                <button
                  className={styles.dock__button}
                  onClick={() => navigate('/operator')}
                >
                  <FontAwesomeIcon icon={faGear} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
