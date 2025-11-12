import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toggleFullscreen } from '../utils/fullscreen';
import { useSettings } from '../context/SettingsContext';
import styles from '../styles/Present.module.css';

function chunkByCount(versesArray, count = 1) {
  const out = [];
  const size = Math.max(1, Number(count) || 1);
  for (let i = 0; i < versesArray.length; i += size) {
    out.push(versesArray.slice(i, i + size));
  }
  return out;
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
  } = useSettings();

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
  const versesPerSlide = settings?.versesPerSlide ?? 1;

  const flatVerses = useMemo(() => {
    if (Array.isArray(first?.verses) && first.verses.length) return first.verses;
    if (Array.isArray(first?.chunks) && first.chunks.length) return first.chunks.flat();
    return [];
  }, [first]);

  const chunks = useMemo(() => chunkByCount(flatVerses, versesPerSlide), [flatVerses, versesPerSlide]);
  const total = chunks.length;
  const safeIndex = Math.max(0, Math.min(currentIndex, Math.max(0, total - 1)));
  const slide = total ? chunks[safeIndex] : [];

  function goBack()  { setCurrentIndex(i => Math.max(0, i - 1)); }
  function goNext()  { setCurrentIndex(i => Math.min((total - 1), i + 1)); }
  function goFirst() { setCurrentIndex(0); }
  function goLast()  { setCurrentIndex(Math.max(0, total - 1)); }

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
      dockTimer.current = setTimeout(() => setDockVisible(false), (settings.dockAutoHideSec ?? 5) * 1000);
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
  const rootColorClass = settings.textColor === 'dark' ? styles['present--dark'] : styles['present--light'];

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
          <button className={styles.dock__button} onClick={() => navigate('/bible')}>
            Ir a Biblia
          </button>
        </div>
      ) : (
        <>
          <div className={styles.present__verse}>
            <div className={styles.present__panel}>
              {slide.map(v => (
                <div key={v.n} className={styles.present__line}>
                  {settings.showVerseNumbers && <strong>{v.n}</strong>} {v.t}
                </div>
              ))}
            </div>
          </div>

          {settings.showDock && (
            <div className={`${styles.present__dock} ${dockVisible ? styles.isVisible : styles.isHidden}`}>
              <button className={styles.dock__button} onClick={() => navigate('/bible')}>Volver</button>
              <button className={styles.dock__button} onClick={goBack}>←</button>
              <button className={styles.dock__button} onClick={toggleFullscreen}>⛶</button>
              <div className={styles.dock__ref}>
                {settings.showRef ? (first?.ref ?? '') : ''}
                {total > 0 ? ` \u2022 ${safeIndex + 1}/${total}` : ''}
              </div>
              <div className={styles.dock__actions}>
                <button className={styles.dock__button} onClick={goNext}>→</button>
                <button className={styles.dock__button} onClick={() => navigate('/operator')}>Ajustes</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
