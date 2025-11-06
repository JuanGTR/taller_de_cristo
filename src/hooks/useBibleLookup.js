import { useState, useCallback } from "react";
import { parseReference } from "../utils/parseReference";
import { fetchVerses } from "../utils/bibliaApi";

export function useBibleLookup() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Accept an optional override value so callers can submit with a fresh value
  const submit = useCallback(async (overrideValue) => {
    const raw = (overrideValue ?? input ?? "").trim();

    setError("");
    setPreview(null);

    if (!raw) {
      setSubmitted(false);
      setError("Escribe una referencia.");
      return;
    }

    const parsed = parseReference(raw);
    if (!parsed) {
      setSubmitted(false);
      setError("Referencia inválida. Ej: Salmos 23 o Juan 3:16-18");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchVerses(parsed.book, parsed.chapter, parsed.from, parsed.to);
      setPreview(result);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(false);
      setError("Error al obtener el pasaje.");
    } finally {
      setLoading(false);
    }
  }, [input]);

  const reset = useCallback(() => {
    setError("");
    setPreview(null);
    setSubmitted(false);
  }, []);

  return {
    input, setInput,
    error, preview, submitted, loading,
    submit, reset
  };
}
