// src/hooks/useBibleLookup.js
import { useState } from "react";
import { parseReference } from "../utils/parseReference";
import { fetchVerses } from "../utils/bibliaApi";

export function useBibleLookup() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setPreview(null);

    const parsed = parseReference(input);
    if (!parsed) {
      setError("Referencia inválida. Ej: Filipenses 4:13-14 o Salmos 23");
      return;
    }

    try {
      setLoading(true);
      const result = await fetchVerses(
        parsed.book,
        parsed.chapter,
        parsed.from,
        parsed.to
      );
      setPreview(result);
      setSubmitted(true);
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Error al obtener el pasaje.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setInput("");
    setError("");
    setPreview(null);
    setSubmitted(false);
    setLoading(false);
  }

  return { input, setInput, error, preview, submitted, loading, submit, reset };
}
