// src/pages/BibleSearch.jsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import BookGrid from "../components/BookGrid";
import PreviewCard from "../components/PreviewCard";
import ErrorBanner from "../components/ErrorBanner";
import { useBibleLookup } from "../hooks/useBibleLookup";

import "../styles/bible.css";

const BOOK_NAMES = [
  "Génesis","Éxodo","Levítico","Números","Deuteronomio","Josué","Jueces","Rut",
  "1 Samuel","2 Samuel","1 Reyes","2 Reyes","1 Crónicas","2 Crónicas","Esdras","Nehemías",
  "Ester","Job","Salmos","Proverbios","Eclesiastés","Cantares","Isaías","Jeremías",
  "Lamentaciones","Ezequiel","Daniel","Oseas","Joel","Amós","Abdías","Jonás","Miqueas",
  "Nahúm","Habacuc","Sofonías","Hageo","Zacarías","Malaquías","Mateo","Marcos","Lucas",
  "Juan","Hechos","Romanos","1 Corintios","2 Corintios","Gálatas","Efesios","Filipenses",
  "Colosenses","1 Tesalonicenses","2 Tesalonicenses","1 Timoteo","2 Timoteo","Tito",
  "Filemón","Hebreos","Santiago","1 Pedro","2 Pedro","1 Juan","2 Juan","3 Juan","Judas",
  "Apocalipsis"
];

export default function BibleSearch() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    input, setInput,
    error, preview, submitted, loading,
    submit, reset
  } = useBibleLookup();

  // 🔒 Only auto-submit ONCE when coming from Home with an initial value.
  const triedAuto = useRef(false);

  useEffect(() => {
    const initial = location.state?.input;
    if (!initial || triedAuto.current) return;

    setInput(initial);
    triedAuto.current = true;   // prevent re-trying on error/re-render
    submit();                   // attempt once; if invalid, user edits manually
  }, [location.state, setInput, submit]);

  function handleBookClick(book) {
    setInput(book + " ");
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    submit();
  }

  function sendToPresent() {
    if (!preview) return;
    navigate("/present", {
      state: {
        deck: [
          {
            type: "bible",
            ref: preview.ref,
            // one verse per slide; adjust later if you want chunking
            chunks: preview.verses.map(v => [v]),
          },
        ],
      },
    });
  }

  return (
    <div className="container bible">
      <h2>Buscar en la Biblia</h2>

      <div className="card bible__form">
        <label>Referencia (ej. Génesis 1:1)</label>
        <SearchBar
          value={input}
          onChange={setInput}
          onSubmit={handleSearchSubmit}
          placeholder="Escribe o selecciona un libro"
          className="search-bar"
          inputClassName="search-bar__input"
          autoFocus
        />
        <button className="button button--primary" onClick={submit} disabled={loading}>
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </div>

      <ErrorBanner message={error} />

      {!submitted && (
        <BookGrid books={BOOK_NAMES} onSelect={handleBookClick} />
      )}

      {submitted && (
        <button className="button button--ghost" onClick={reset} style={{ marginTop: 16 }}>
          Volver a la selección de libros
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
