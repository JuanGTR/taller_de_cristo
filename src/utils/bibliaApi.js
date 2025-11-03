const BASE = "http://localhost:5174/api";

export async function fetchVerses(bookSlug, chapter, fromVerse, toVerse = fromVerse) {
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
    ref: `${capitalize(bookSlug)} ${chapter}:${fromVerse}${toVerse > fromVerse ? "-" + toVerse : ""}`,
    verses
  };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
