// SUPER simple parser for Phase 1. We'll expand later.
// Accepts formats like: "Filipenses 4:13-14" (spaces around colon/dash allowed)

const BOOK_ALIASES = {
  'fil': 'Filipenses',
  'filipenses': 'Filipenses',
}

export function parseReference(input) {
  if (!input) return null
  const raw = input.trim().toLowerCase()
  const match = raw.match(/^([a-zñáéíóúü\s]+)\s+(\d+):(\d+)(?:\s*[-–]\s*(\d+))?$/i)
  if (!match) return null
  const [, bookRaw, chapter, v1, v2] = match
  const key = bookRaw.replace(/\s+/g, ' ')
  const book = BOOK_ALIASES[key] || capitalizeWords(bookRaw)
  return { book, chapter: Number(chapter), from: Number(v1), to: v2 ? Number(v2) : Number(v1) }
}

function capitalizeWords(s){
  return s.replace(/\b\w+/g, w => w[0].toUpperCase() + w.slice(1))
}
