import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toggleFullscreen } from '../utils/fullscreen';
import styles from '../styles/Present.module.css';

function useDeckFromLocation() {
  const { state } = useLocation();
  return useMemo(() => state?.deck ?? [
    {
      type: 'bible',
      ref: 'Filipenses 4:13-14',
      chunks: [[
        { n: '13', t: 'Todo lo puedo en Cristo que me fortalece.' },
        { n: '14', t: 'Sin embargo, bien hicisteis en participar conmigo en mi tribulación.' },
      ]]
    }
  ], [state]);
}

// Break long lists of verses into smaller slide chunks
function chunkVerses(verses, size = 3) {
  const chunks = [];
  for (let i = 0; i < verses.length; i += size) {
    chunks.push(verses.slice(i, i + size));
  }
  return chunks;
}

export default function Present() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const touchStartX = useRef(null);

  const deck = useDeckFromLocation();
  const firstSlide = deck[0];

  const isChunked = Array.isArray(firstSlide.chunks?.[0]);
  const chunks = isChunked ? firstSlide.chunks : chunkVerses(firstSlide.chunks || []);

  const [currentChunk, setCurrentChunk] = useState(0);

  function goBack() {
    setCurrentChunk(c => Math.max(0, c - 1));
  }

  function goNext() {
    setCurrentChunk(c => Math.min(chunks.length - 1, c + 1));
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current == null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) goBack();
    else if (deltaX < -50) goNext();
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

  return (
    <div className={styles.present} ref={containerRef}>
      <div className={styles.present__verse}>
        {chunks[currentChunk].map(v => (
          <div key={v.n} className={styles.present__line}>
            <strong>{v.n}</strong> {v.t}
          </div>
        ))}
      </div>

      <div className={styles.present__dock}>
        <button className={styles.dock__button} onClick={() => navigate('/')}>Volver</button>
        <button className={styles.dock__button} onClick={goBack}>←</button>
        <button className={styles.dock__button} onClick={toggleFullscreen}>⛶</button>
        <div className={styles.dock__ref}>{firstSlide.ref}</div>
        <button className={styles.dock__button} onClick={goNext}>→</button>
      </div>
    </div>
  );
}
