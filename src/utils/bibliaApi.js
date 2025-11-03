const BASE = "http://localhost:5174/api";

/**
 * Converts book name like "1 Juan" or "Éxodo" to slug like "1-juan" or "exodo"
 */
function toSlug(bookName) {
  return bookName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .replace(/\s+/g, "-"); // spaces to dashes
}

/**
 * Fetches verses from the API.
 * Supports:
 *  - A single verse (e.g. Juan 3:16)
 *  - A range of verses (e.g. Filipenses 4:13-14)
 *  - A whole chapter (e.g. Salmos 23)
 */
export async function fetchVerses(bookName, chapter, fromVerse, toVerse) {
  const bookSlug = toSlug(bookName);

  // CASE 1: Full Chapter
  if (fromVerse == null && toVerse == null) {
    const url = `${BASE}/${bookSlug}/${chapter}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener el capítulo.");
    const data = await res.json();

    const verses = data.text.map((t, i) => ({
      n: String(i + 1),
      t,
    }));

    return {
      ref: `${bookName} ${chapter}`,
      verses,
    };
  }

  // CASE 2: Verse or Verse Range
  const verses = [];

  for (let v = fromVerse; v <= toVerse; v++) {
    const url = `${BASE}/${bookSlug}/${chapter}/${v}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status} fetching ${bookSlug} ${chapter}:${v}`);
    const data = await res.json();

    if (data.text) {
      verses.push({ n: String(v), t: data.text });
    } else {
      throw new Error("No verse text found.");
    }
  }

  return {
    ref: `${bookName} ${chapter}:${fromVerse}${toVerse > fromVerse ? "-" + toVerse : ""}`,
    verses,
  };
}
