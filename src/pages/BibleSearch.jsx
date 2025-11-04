import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseReference } from "../utils/parseReference";
import { fetchVerses } from "../utils/bibliaApi";
import "../styles/bible.css";

export default function BibleSearch() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const bookNames = [
  "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio",
  "Josué", "Jueces", "Rut", "1 Samuel", "2 Samuel",
  "1 Reyes", "2 Reyes", "1 Crónicas", "2 Crónicas", "Esdras",
  "Nehemías", "Ester", "Job", "Salmos", "Proverbios",
  "Eclesiastés", "Cantares", "Isaías", "Jeremías", "Lamentaciones",
  "Ezequiel", "Daniel", "Oseas", "Joel", "Amós",
  "Abdías", "Jonás", "Miqueas", "Nahúm", "Habacuc",
  "Sofonías", "Hageo", "Zacarías", "Malaquías", "Mateo",
  "Marcos", "Lucas", "Juan", "Hechos", "Romanos",
  "1 Corintios", "2 Corintios", "Gálatas", "Efesios", "Filipenses",
  "Colosenses", "1 Tesalonicenses", "2 Tesalonicenses", "1 Timoteo", "2 Timoteo",
  "Tito", "Filemón", "Hebreos", "Santiago", "1 Pedro",
  "2 Pedro", "1 Juan", "2 Juan", "3 Juan", "Judas",
  "Apocalipsis"
];


  function handleBookClick(book) {
    setSelectedBook(book);
    setInput(book + " ");
  }

  async function handleInputSubmit(e) {
    e.preventDefault();
    setError("");
    setPreview(null);

    const parsed = parseReference(input);
    if (!parsed) {
      setError("Referencia inválida. Ej: Filipenses 4:13-14 o Salmos 23");
      return;
    }

    try {
      const result = await fetchVerses(parsed.book, parsed.chapter, parsed.from, parsed.to);
      setPreview(result);
      setSubmitted(true);
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Error al obtener el pasaje.");
    }
  }

  function resetSearch() {
    setInput("");
    setError("");
    setPreview(null);
    setSubmitted(false);
  }

function sendToPresent() {
  navigate("/present", {
    state: {
      deck: [
        {
          type: "bible",
          ref: preview.ref,
          chunks: preview.verses.map(v => [v]), // <-- each verse becomes its own slide
        },
      ],
    },
  });
}


  return (
    <div className="container bible">
      <h2>Buscar en la Biblia</h2>

      <form className="card bible__form" onSubmit={handleInputSubmit}>
        <label>Referencia (ej. Génesis 1:1)</label>
        <input
          className="search-bar__input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe o selecciona un libro"
        />
        <button className="button button--primary" type="submit">
          Buscar
        </button>
      </form>

      {error && <div style={{ color: "#ff8080" }}>{error}</div>}

      {!submitted && (
        <div className="book-grid">
          {bookNames.map(book => (
            <button
              key={book}
              className="button book-button"
              onClick={() => handleBookClick(book)}
            >
              {book}
            </button>
          ))}
        </div>
      )}

      {submitted && (
        <button
          className="button button--ghost"
          onClick={resetSearch}
          style={{ marginTop: "16px" }}
        >
          Volver a la selección de libros
        </button>
      )}

      {preview && (
        <div className="card bible__preview preview">
          <div className="preview__ref">{preview.ref}</div>
          <div className="preview__text">
            {Array.isArray(preview.verses) &&
              preview.verses.map(v => (
                <div key={v.n}>
                  <strong>{v.n}</strong> {v.t}
                </div>
              ))}
          </div>
          <button className="button button--primary" onClick={sendToPresent}>
            Enviar a Presentación
          </button>
        </div>
      )}
    </div>
  );
}
