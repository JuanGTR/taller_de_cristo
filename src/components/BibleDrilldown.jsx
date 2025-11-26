// src/components/BibleDrilldown.jsx
import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5174/api";

// Catalog with testament + API slug
const BOOKS = [
  // OT
  { name: "Génesis", slug: "genesis", t: "OT" },
  { name: "Éxodo", slug: "exodo", t: "OT" },
  { name: "Levítico", slug: "levitico", t: "OT" },
  { name: "Números", slug: "numeros", t: "OT" },
  { name: "Deuteronomio", slug: "deuteronomio", t: "OT" },
  { name: "Josué", slug: "josue", t: "OT" },
  { name: "Jueces", slug: "jueces", t: "OT" },
  { name: "Rut", slug: "rut", t: "OT" },
  { name: "1 Samuel", slug: "1samuel", t: "OT" },
  { name: "2 Samuel", slug: "2samuel", t: "OT" },
  { name: "1 Reyes", slug: "1reyes", t: "OT" },
  { name: "2 Reyes", slug: "2reyes", t: "OT" },
  { name: "1 Crónicas", slug: "1cronicas", t: "OT" },
  { name: "2 Crónicas", slug: "2cronicas", t: "OT" },
  { name: "Esdras", slug: "esdras", t: "OT" },
  { name: "Nehemías", slug: "nehemias", t: "OT" },
  { name: "Ester", slug: "ester", t: "OT" },
  { name: "Job", slug: "job", t: "OT" },
  { name: "Salmos", slug: "salmos", t: "OT" },
  { name: "Proverbios", slug: "proverbios", t: "OT" },
  { name: "Eclesiastés", slug: "eclesiastes", t: "OT" },
  { name: "Cantares", slug: "cantares", t: "OT" },
  { name: "Isaías", slug: "isaias", t: "OT" },
  { name: "Jeremías", slug: "jeremias", t: "OT" },
  { name: "Lamentaciones", slug: "lamentaciones", t: "OT" },
  { name: "Ezequiel", slug: "ezequiel", t: "OT" },
  { name: "Daniel", slug: "daniel", t: "OT" },
  { name: "Oseas", slug: "oseas", t: "OT" },
  { name: "Joel", slug: "joel", t: "OT" },
  { name: "Amós", slug: "amos", t: "OT" },
  { name: "Abdías", slug: "abdias", t: "OT" },
  { name: "Jonás", slug: "jonas", t: "OT" },
  { name: "Miqueas", slug: "miqueas", t: "OT" },
  { name: "Nahúm", slug: "nahum", t: "OT" },
  { name: "Habacuc", slug: "habacuc", t: "OT" },
  { name: "Sofonías", slug: "sofonias", t: "OT" },
  { name: "Hageo", slug: "hageo", t: "OT" },
  { name: "Zacarías", slug: "zacarias", t: "OT" },
  { name: "Malaquías", slug: "malaquias", t: "OT" },
  // NT
  { name: "Mateo", slug: "mateo", t: "NT" },
  { name: "Marcos", slug: "marcos", t: "NT" },
  { name: "Lucas", slug: "lucas", t: "NT" },
  { name: "Juan", slug: "juan", t: "NT" },
  { name: "Hechos", slug: "hechos", t: "NT" },
  { name: "Romanos", slug: "romanos", t: "NT" },
  { name: "1 Corintios", slug: "1corintios", t: "NT" },
  { name: "2 Corintios", slug: "2corintios", t: "NT" },
  { name: "Gálatas", slug: "galatas", t: "NT" },
  { name: "Efesios", slug: "efesios", t: "NT" },
  { name: "Filipenses", slug: "filipenses", t: "NT" },
  { name: "Colosenses", slug: "colosenses", t: "NT" },
  { name: "1 Tesalonicenses", slug: "1tesalonicenses", t: "NT" },
  { name: "2 Tesalonicenses", slug: "2tesalonicenses", t: "NT" },
  { name: "1 Timoteo", slug: "1timoteo", t: "NT" },
  { name: "2 Timoteo", slug: "2timoteo", t: "NT" },
  { name: "Tito", slug: "tito", t: "NT" },
  { name: "Filemón", slug: "filemon", t: "NT" },
  { name: "Hebreos", slug: "hebreos", t: "NT" },
  { name: "Santiago", slug: "santiago", t: "NT" },
  { name: "1 Pedro", slug: "1pedro", t: "NT" },
  { name: "2 Pedro", slug: "2pedro", t: "NT" },
  { name: "1 Juan", slug: "1juan", t: "NT" },
  { name: "2 Juan", slug: "2juan", t: "NT" },
  { name: "3 Juan", slug: "3juan", t: "NT" },
  { name: "Judas", slug: "judas", t: "NT" },
  { name: "Apocalipsis", slug: "apocalipsis", t: "NT" },
];

// Minimal chapters map (unchanged)
const CHAPTERS = {
  "Salmos": 150, "Génesis": 50, "Éxodo": 40, "Levítico": 27, "Números": 36, "Deuteronomio": 34,
  "Josué": 24, "Jueces": 21, "Rut": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Reyes": 22, "2 Reyes": 25,
  "1 Crónicas": 29, "2 Crónicas": 36, "Esdras": 10, "Nehemías": 13, "Ester": 10, "Job": 42,
  "Proverbios": 31, "Eclesiastés": 12, "Cantares": 8, "Isaías": 66, "Jeremías": 52, "Lamentaciones": 5,
  "Ezequiel": 48, "Daniel": 12, "Oseas": 14, "Joel": 3, "Amós": 9, "Abdías": 1, "Jonás": 4,
  "Miqueas": 7, "Nahúm": 3, "Habacuc": 3, "Sofonías": 3, "Hageo": 2, "Zacarías": 14, "Malaquías": 4,
  "Mateo": 28, "Marcos": 16, "Lucas": 24, "Juan": 21, "Hechos": 28, "Romanos": 16,
  "1 Corintios": 16, "2 Corintios": 13, "Gálatas": 6, "Efesios": 6, "Filipenses": 4, "Colosenses": 4,
  "1 Tesalonicenses": 5, "2 Tesalonicenses": 3, "1 Timoteo": 6, "2 Timoteo": 4,
  "Tito": 3, "Filemón": 1, "Hebreos": 13, "Santiago": 5, "1 Pedro": 5, "2 Pedro": 3,
  "1 Juan": 5, "2 Juan": 1, "3 Juan": 1, "Judas": 1, "Apocalipsis": 22
};

export default function BibleDrilldown({
  prefill = null,
  onChange,
  onPreview
}) {
  const [testament, setTestament] = useState("OT");
  const [book, setBook] = useState(null);       // { name, slug, t }
  const [chapter, setChapter] = useState(null); // number
  const [from, setFrom] = useState(null);       // number
  const [to, setTo] = useState(null);           // number
  const [verseCount, setVerseCount] = useState(null); // dynamic per chapter
  const [versesLoading, setVersesLoading] = useState(false);

  const booksOT = useMemo(() => BOOKS.filter(b => b.t === "OT"), []);
  const booksNT = useMemo(() => BOOKS.filter(b => b.t === "NT"), []);

  const applyingPrefill = useRef(false);

  // Apply prefill from search bar typing (e.g., "Juan 3:16-18")
  useEffect(() => {
    if (!prefill?.book) return;
    const match = BOOKS.find(b => normalize(b.name) === normalize(prefill.book));
    if (!match) return;

    applyingPrefill.current = true;
    setTestament(match.t);
    setBook(match);
    setChapter(prefill.chapter || null);
    setFrom(prefill.from ?? null);
    setTo(prefill.to ?? (prefill.from ?? null));

    const id = setTimeout(() => { applyingPrefill.current = false; }, 0);
    return () => clearTimeout(id);
  }, [prefill]);

  // When chapter changes, fetch verse count dynamically
  useEffect(() => {
    async function fetchCount() {
      if (!book || !chapter) { setVerseCount(null); return; }
      try {
        setVersesLoading(true);
        const res = await fetch(`${API_BASE}/${book.slug}/${chapter}`);
        if (!res.ok) throw new Error("chapter fetch failed");
        const data = await res.json();
        const count = Array.isArray(data.text) ? data.text.length : null;
        setVerseCount(count || 50); // graceful fallback
      } catch {
        setVerseCount(50);
      } finally {
        setVersesLoading(false);
      }
    }
    fetchCount();
  }, [book, chapter]);

  const activeBooks = testament === "OT" ? booksOT : booksNT;
  const chapterCount = book ? (CHAPTERS[book.name] || 1) : 0;

  // step: show one part at a time
  let step = "books";
  if (book && !chapter) step = "chapters";
  if (book && chapter) step = "verses";

  function emit(sel) {
    if (applyingPrefill.current) return;
    onChange?.(sel);
  }

  function pickBook(b) {
    setBook(b);
    setChapter(null);
    setFrom(null);
    setTo(null);
    setVerseCount(null);
    emit({ book: b.name, chapter: null, from: null, to: null });
  }

  function pickChapter(n) {
    setChapter(n);
    setFrom(null);
    setTo(null);
    setVerseCount(null);
    emit({ book: book?.name || null, chapter: n, from: null, to: null });
  }

  function pickVerse(n) {
    let nextFrom = from, nextTo = to;
    if (from == null) {
      nextFrom = n; nextTo = n;
    } else if (n < from) {
      nextFrom = n;
    } else {
      nextTo = n;
    }
    setFrom(nextFrom);
    setTo(nextTo);
    emit({ book: book?.name || null, chapter, from: nextFrom, to: nextTo });
  }

  function clearRange() {
    setFrom(null);
    setTo(null);
    emit({ book: book?.name || null, chapter, from: null, to: null });
  }

  function handlePreview() {
    if (!book || !chapter) return;
    onPreview?.({ book: book.name, slug: book.slug, chapter, from, to });
  }

  function stepBack() {
    if (book && chapter) {
      // verses -> chapters
      setFrom(null); setTo(null);
      setChapter(null);
      emit({ book: book?.name || null, chapter: null, from: null, to: null });
    } else if (book && !chapter) {
      // chapters -> books
      setBook(null);
      setFrom(null); setTo(null);
      emit({ book: null, chapter: null, from: null, to: null });
    }
  }

  const count = verseCount || 0;
  const isInRange = (n) => from != null && to != null && n >= Math.min(from, to) && n <= Math.max(from, to);
  const isStart = (n) => from != null && n === Math.min(from, to);
  const isEnd   = (n) => to != null   && n === Math.max(from, to);

  return (
    <div className="drilldown" data-step={step}>
      {/* Tabs: OT / NT */}
      <div className="drilldown__tabs">
        <button
          className={`button drilldown__tab ${testament === "OT" ? "is-active" : ""}`}
          onClick={() => setTestament("OT")}
        >
          Antiguo
        </button>
        <button
          className={`button drilldown__tab ${testament === "NT" ? "is-active" : ""}`}
          onClick={() => setTestament("NT")}
        >
          Nuevo
        </button>

        <div className="drilldown__spacer" />
        <button className="button drilldown__back" onClick={stepBack} disabled={!book}>
          ← Atrás
        </button>
      </div>

      {/* BOOKS */}
      <div className="drilldown__section-title drilldown__section-title--books">Libros</div>
      <div className="drilldown__grid drilldown__grid--books">
        {activeBooks.map(b => (
          <button
            key={b.slug}
            className={`button drilldown__book ${book?.slug === b.slug ? "is-active" : ""}`}
            onClick={() => pickBook(b)}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* CHAPTERS */}
      <div className="drilldown__section-title drilldown__section-title--chapters">Capítulos {book ? `• ${book.name}` : ""}</div>
      <div className="drilldown__grid drilldown__grid--chapters">
        {Array.from({ length: chapterCount }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            className={`button drilldown__chapter ${chapter === n ? "is-active" : ""}`}
            onClick={() => pickChapter(n)}
          >
            {n}
          </button>
        ))}
      </div>

      {/* VERSES */}
      <div className="drilldown__section-title drilldown__section-title--verses">
        Versos {book && chapter ? `• ${book.name} ${chapter}` : ""}
        {from != null ? `  (${Math.min(from, to)}${to && to !== from ? `–${Math.max(from, to)}` : ""})` : ""}
      </div>

      <div className="drilldown__grid drilldown__grid--verses">
        {versesLoading && <div className="drilldown__loading">Cargando versos…</div>}
        {!versesLoading && count > 0 && Array.from({ length: count }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            className={[
              "button",
              "drilldown__verse",
              isInRange(n) ? "is-selected" : "",
              isStart(n) ? "is-endpoint" : "",
              isEnd(n) ? "is-endpoint" : ""
            ].join(" ").trim()}
            onClick={() => pickVerse(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="drilldown__actions">
        <button className="button button--ghost" onClick={clearRange}>Limpiar rango</button>
        <button className="button button--primary" onClick={handlePreview}>Previsualizar</button>
      </div>
    </div>
  );
}

function normalize(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
