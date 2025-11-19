// src/pages/BibleSearch.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import PreviewCard from "../components/PreviewCard";
import ErrorBanner from "../components/ErrorBanner";
import BibleDrilldown from "../components/BibleDrilldown";
import { useBibleLookup } from "../hooks/useBibleLookup";
import { parseReference } from "../utils/parseReference";
import { useSettings } from "../context/SettingsContext";

import "../styles/bible.css";

// Basic list of book names for suggestions + book-only handling
const BOOK_NAMES = [
  "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio",
  "Josué", "Jueces", "Rut",
  "1 Samuel", "2 Samuel",
  "1 Reyes", "2 Reyes",
  "1 Crónicas", "2 Crónicas",
  "Esdras", "Nehemías", "Ester",
  "Job", "Salmos", "Proverbios", "Eclesiastés", "Cantares",
  "Isaías", "Jeremías", "Lamentaciones", "Ezequiel", "Daniel",
  "Oseas", "Joel", "Amós", "Abdías", "Jonás", "Miqueas",
  "Nahúm", "Habacuc", "Sofonías", "Hageo", "Zacarías", "Malaquías",
  "Mateo", "Marcos", "Lucas", "Juan",
  "Hechos", "Romanos",
  "1 Corintios", "2 Corintios",
  "Gálatas", "Efesios", "Filipenses", "Colosenses",
  "1 Tesalonicenses", "2 Tesalonicenses",
  "1 Timoteo", "2 Timoteo",
  "Tito", "Filemón",
  "Hebreos", "Santiago",
  "1 Pedro", "2 Pedro",
  "1 Juan", "2 Juan", "3 Juan",
  "Judas", "Apocalipsis"
];

function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function BibleSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setDeck } = useSettings();

  const {
    input, setInput,
    error, preview, submitted, loading,
    submit, reset
  } = useBibleLookup();

  // local UI error (for validation / special cases)
  const [localError, setLocalError] = useState(null);

  // force-remount drilldown when user clicks "Volver a selección"
  const [drilldownKey, setDrilldownKey] = useState(0);

  // prevent drilldown from overwriting the search bar while typing
  const allowDrilldownSyncRef = useRef(true);

  // Auto-submit once when arriving from Home with initial input
  const triedAuto = useRef(false);
  useEffect(() => {
    const initial = location.state?.input;
    if (!initial || triedAuto.current) return;
    triedAuto.current = true;
    setInput(initial);
    submit(initial);
  }, [location.state, setInput, submit]);

  // detect a matching book name from current input (for prefill + messages)
  const matchedBook = useMemo(() => {
    if (!input) return null;
    const norm = normalize(input.trim());
    if (!norm) return null;
    return BOOK_NAMES.find(name =>
      normalize(name).startsWith(norm)
    ) || null;
  }, [input]);

  // suggestions for autofill (basic contains match)
  const bookSuggestions = useMemo(() => {
    const q = input?.trim() ?? "";
    if (q.length < 2) return [];
    const norm = normalize(q);
    return BOOK_NAMES
      .filter(name => normalize(name).includes(norm))
      .slice(0, 6);
  }, [input]);

  // Let drilldown “read” what user typed (for prefill)
  const prefill = useMemo(() => {
    if (!input) return null;

    // Try full reference parsing first
    const parsed = parseReference(input);
    if (parsed) return parsed;

    // If not, but it matches a known book, prefill book-only
    if (matchedBook) {
      return {
        book: matchedBook,
        chapter: null,
        from: null,
        to: null
      };
    }

    return null;
  }, [input, matchedBook]);

  // Combine hook error + local validation into a friendly message
  const friendlyError = useMemo(() => {
    if (localError) return localError;
    if (!error) return null;

    if (error.includes("Error al obtener el capítulo")) {
      return "No pudimos obtener el capítulo. Revisa tu conexión o intenta otra referencia.";
    }
    if (error.includes("Error") && error.includes("fetching")) {
      return "Ocurrió un error al buscar el verso. Verifica la referencia y tu conexión.";
    }
    if (error.includes("Failed to fetch")) {
      return "No hay conexión con el servidor de la Biblia. Revisa tu internet y vuelve a intentar.";
    }

    // fallback: show whatever the hook sent
    return error;
  }, [error, localError]);

  // single submit handler to centralize validation
  function doSubmit(refOverride) {
    setLocalError(null);

    const value = (refOverride ?? input ?? "").trim();

    if (!value) {
      setLocalError('Escribe al menos un libro y capítulo. Ej: "Juan 3:16".');
      return;
    }

    // book-only: no digits or colon (e.g., "Filipenses")
    const hasDigitsOrColon = /[0-9:]/.test(value);
    if (!hasDigitsOrColon) {
      if (matchedBook) {
        // we recognize it as a book: guide user to use drilldown
        setLocalError(
          'Selecciona un capítulo para ese libro usando el selector de libros de abajo.'
        );
      } else {
        setLocalError(
          'No reconocí ese libro. Intenta con nombres como "Génesis", "Juan", "Filipenses"...'
        );
      }
      return;
    }

    // If we reach here, it's a full reference; delegate to the hook
    if (refOverride != null) {
      submit(refOverride);
    } else {
      submit();
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    doSubmit();
  }

  function handleSearchChange(next) {
    allowDrilldownSyncRef.current = false;
    setLocalError(null);
    setInput(next);
  }

  function handleSuggestionSelect(name) {
    allowDrilldownSyncRef.current = false;
    setLocalError(null);
    setInput(name);
  }

  function handleDrilldownChange(sel) {
    if (!sel?.book || !sel?.chapter) return;

    const ref =
      sel.from == null && sel.to == null
        ? `${sel.book} ${sel.chapter}`
        : sel.to != null && sel.to !== sel.from
          ? `${sel.book} ${sel.chapter}:${sel.from}-${sel.to}`
          : `${sel.book} ${sel.chapter}:${sel.from}`;

    if (allowDrilldownSyncRef.current) {
      setInput(ref);
    }
  }

  function handleDrilldownPreview(sel) {
    if (!sel?.book || !sel?.chapter) return;

    const ref =
      sel.from == null && sel.to == null
        ? `${sel.book} ${sel.chapter}`
        : sel.to != null && sel.to !== sel.from
          ? `${sel.book} ${sel.chapter}:${sel.from}-${sel.to}`
          : `${sel.book} ${sel.chapter}:${sel.from}`;

    allowDrilldownSyncRef.current = true;
    setInput(ref);
    doSubmit(ref);
  }

  function handleBackToSelection() {
    allowDrilldownSyncRef.current = true;
    setLocalError(null);
    reset();
    setDrilldownKey(k => k + 1);
  }

  function sendToPresent() {
    if (!preview) return;

    const deck = [
      {
        type: "bible",
        ref: preview.ref,
        chunks: preview.verses.map(v => [v]),
        verses: preview.verses,
      }
    ];
    setDeck(deck);
    navigate("/present", {
  state: {
    deck,
    source: "bible"
  }
});
  }

  return (
    <div className={`container bible ${preview ? "bible--has-preview" : ""}`}>
      <h2 className="bible__title">Buscar en la Biblia</h2>

      <div className="card bible__form">
        <label className="bible__label">
          Referencia (ej. Génesis 1:1 o solo escribe el libro)
        </label>

        <SearchBar
          value={input}
          onChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
          placeholder="Escribe un libro o referencia (ej. Juan 3:16)"
          className="search-bar"
          inputClassName="search-bar__input"
          autoFocus
          suggestions={bookSuggestions}
          onSuggestionSelect={handleSuggestionSelect}
          onFocus={() => { allowDrilldownSyncRef.current = false; }}
        />

        {/* Loading state info */}
        {loading && (
          <div className="bible__loading">
            <span className="bible__loading-icon" />
            <span>Buscando versículos…</span>
          </div>
        )}

        <button
          className="button button--primary bible__submit"
          onClick={() => doSubmit()}
          disabled={loading}
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </div>

      <ErrorBanner message={friendlyError} />

      {/* Drilldown area — auto-hidden via CSS when preview exists */}
      <BibleDrilldown
        key={drilldownKey}
        prefill={prefill}
        onChange={(sel) => {
          allowDrilldownSyncRef.current = true;
          handleDrilldownChange(sel);
        }}
        onPreview={handleDrilldownPreview}
      />

      {submitted && (
        <button
          className="button button--ghost bible__back"
          onClick={handleBackToSelection}
        >
          Volver a la selección
        </button>
      )}

      {preview && (
        <PreviewCard
          refText={preview.ref}
          verses={preview.verses}
          onAction={sendToPresent}
          actionLabel="Enviar a Presentación"
        />
      )}
    </div>
  );
}
