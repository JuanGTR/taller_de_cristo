const BOOK_SLUGS = {
  "Génesis": "genesis",
  "Éxodo": "exodo",
  "Levítico": "levitico",
  "Números": "numeros",
  "Deuteronomio": "deuteronomio",
  "Josué": "josue",
  "Jueces": "jueces",
  "Rut": "rut",
  "1 Samuel": "1samuel",
  "2 Samuel": "2samuel",
  "1 Reyes": "1reyes",
  "2 Reyes": "2reyes",
  "1 Crónicas": "1cronicas",
  "2 Crónicas": "2cronicas",
  "Esdras": "esdras",
  "Nehemías": "nehemias",
  "Ester": "ester",
  "Job": "job",
  "Salmos": "salmos",
  "Proverbios": "proverbios",
  "Eclesiastés": "eclesiastes",
  "Cantares": "cantares",
  "Isaías": "isaias",
  "Jeremías": "jeremias",
  "Lamentaciones": "lamentaciones",
  "Ezequiel": "ezequiel",
  "Daniel": "daniel",
  "Oseas": "oseas",
  "Joel": "joel",
  "Amós": "amos",
  "Abdías": "abdias",
  "Jonás": "jonas",
  "Miqueas": "miqueas",
  "Nahúm": "nahum",
  "Habacuc": "habacuc",
  "Sofonías": "sofonias",
  "Hageo": "hageo",
  "Zacarías": "zacarias",
  "Malaquías": "malaquias",
  "Mateo": "mateo",
  "Marcos": "marcos",
  "Lucas": "lucas",
  "Juan": "juan",
  "Hechos": "hechos",
  "Romanos": "romanos",
  "1 Corintios": "1corintios",
  "2 Corintios": "2corintios",
  "Gálatas": "galatas",
  "Efesios": "efesios",
  "Filipenses": "filipenses",
  "Colosenses": "colosenses",
  "1 Tesalonicenses": "1tesalonicenses",
  "2 Tesalonicenses": "2tesalonicenses",
  "1 Timoteo": "1timoteo",
  "2 Timoteo": "2timoteo",
  "Tito": "tito",
  "Filemón": "filemon",
  "Hebreos": "hebreos",
  "Santiago": "santiago",
  "1 Pedro": "1pedro",
  "2 Pedro": "2pedro",
  "1 Juan": "1juan",
  "2 Juan": "2juan",
  "3 Juan": "3juan",
  "Judas": "judas",
  "Apocalipsis": "apocalipsis"
};

export function parseReference(input) {
  if (!input) return null;

  const raw = input.trim();
  const normalized = normalize(raw);

  // Match formats like "1 juan 3:16-17", "salmos 23", etc.
  const match = normalized.match(/^([0-3]?\s?[a-zñáéíóúü\s]+)\s+(\d+)(?::(\d+)(?:[-–](\d+))?)?$/i);
  if (!match) return null;

  const [, bookRaw, chapter, v1, v2] = match;
  const bookName = findMatchingBook(bookRaw);
  if (!bookName) return null;

  return {
    book: BOOK_SLUGS[bookName],
    chapter: Number(chapter),
    from: v1 ? Number(v1) : null,
    to: v2 ? Number(v2) : v1 ? Number(v1) : null
  };
}

function findMatchingBook(rawInput) {
  const normalizedInput = normalize(rawInput);
  return Object.keys(BOOK_SLUGS).find(name => normalize(name) === normalizedInput);
}

function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // strip accents
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
