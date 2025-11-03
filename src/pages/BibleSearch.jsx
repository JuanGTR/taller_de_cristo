import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseReference } from "../utils/parseReference";
import { fetchVerses } from "../utils/bibliaApi";
import { BOOK_SLUGS } from "../utils/bookSlugs";

export default function BibleSearch() {
  const [input, setInput] = useState("Filipenses 4:13-14");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const parsed = parseReference(input); // { book, chapter, from, to }
    if (!parsed) {
      setError("Referencia inválida. Ej: Filipenses 4:13-14");
      return;
    }

    const bookSlug = BOOK_SLUGS[parsed.book];
    if (!bookSlug) {
      setError("Libro no reconocido: " + parsed.book);
      return;
    }

    try {
      const result = await fetchVerses(bookSlug, parsed.chapter, parsed.from, parsed.to);
      setPreview(result);
    } catch (err) {
      console.error(err);
      setError("Error al obtener el pasaje.");
    }
  }

  function sendToPresent() {
    navigate("/present", {
      state: {
        deck: [
          {
            type: "bible",
            ref: preview.ref,
            chunks: [preview.verses]
          }
        ]
      }
    });
  }

  return (
    <div className="container bible">
      <h2>Buscar en la Biblia</h2>
      <form className="card bible__form" onSubmit={onSubmit}>
        <label>Referencia (ej. Filipenses 4:13-14)</label>
        <input
          className="search-bar__input"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button className="button button--primary" type="submit">
          Previsualizar
        </button>
      </form>

      {error && <div style={{ color: "#ff8080" }}>{error}</div>}

      {preview && (
        <div className="card bible__preview preview">
          <div className="preview__ref">{preview.ref}</div>
          <div className="preview__text">
            {preview.verses.map(v => (
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
