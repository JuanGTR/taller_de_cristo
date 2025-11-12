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

export default function BibleSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setDeck } = useSettings();

  const {
    input, setInput,
    error, preview, submitted, loading,
    submit, reset
  } = useBibleLookup();

  // force-remount drilldown when user clicks "Volver a selección"
  const [drilldownKey, setDrilldownKey] = useState(0);

  // prevent drilldown from overwriting the search bar while typing
  const allowDrilldownSyncRef = useRef(true);

  // Auto-submit once when arriving from Home with initial input
  const triedAuto = useRef(false);
  useEffect(() => {
    const initial = location.state?.input;
    if (!initial || triedAuto.current) return;
    triedAuto.current = true;     // prevent re-run on rerenders
    setInput(initial);            // show typed value in field
    submit(initial);              // submit using override to avoid stale state
  }, [location.state, setInput, submit]);

  // Let drilldown “read” what user typed (for prefill)
  const prefill = useMemo(() => {
    if (!input) return null;
    return parseReference(input); // { book, chapter, from, to } | null
  }, [input]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    submit(); // uses current state value
  }

  function handleSearchChange(next) {
    // User is actively typing: prevent drilldown from pushing into the field
    allowDrilldownSyncRef.current = false;
    setInput(next);
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

    // one-time sync back into the field, then fetch
    allowDrilldownSyncRef.current = true;
    setInput(ref);
    submit(ref);
  }

  function handleBackToSelection() {
    allowDrilldownSyncRef.current = true;
    reset();                       // clears preview/submitted/error/input in the hook
    setDrilldownKey(k => k + 1);   // remount drilldown to step=books
  }

  function sendToPresent() {
    if (!preview) return;

    // Save the current deck to Context so Present & Operator stay in sync
    const deck = [
      {
        type: "bible",
        ref: preview.ref,
        // 1 verse per slide by default; Operator can change chunking later
        chunks: preview.verses.map(v => [v]),
        // keep full verses so Present can re-chunk when user changes settings
        verses: preview.verses,
      }
    ];
    setDeck(deck);

    // Navigate to Present (it will read from Context/localStorage)
    navigate("/present");
  }

  return (
    <div className={`container bible ${preview ? "bible--has-preview" : ""}`}>
      <h2 className="bible__title">Buscar en la Biblia</h2>

      <div className="card bible__form">
        <label className="bible__label">Referencia (ej. Génesis 1:1)</label>
        <SearchBar
          value={input}
          onChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
          placeholder="Escribe o selecciona un libro"
          className="search-bar"
          inputClassName="search-bar__input"
          autoFocus
          onFocus={() => { allowDrilldownSyncRef.current = false; }}
        />
        <button
          className="button button--primary bible__submit"
          onClick={() => submit()}
          disabled={loading}
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </div>

      <ErrorBanner message={error} />

      {/* Drilldown area — auto-hidden via CSS when preview exists */}
      <BibleDrilldown
        key={drilldownKey}
        prefill={prefill}
        onChange={(sel) => {
          // when drilldown changes because of clicks (not typing), allow a one-time sync
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
