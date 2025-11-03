import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 5174;

app.use(cors());

// 🔹 CHAPTER route: /api/book/chapter
app.get("/api/:book/:chapter", async (req, res, next) => {
  const { book, chapter } = req.params;

  // Try to detect if it's actually a verse route by checking if chapter contains slash
  if (chapter.includes("/")) return next();

  const url = `https://biblia-api.vercel.app/api/v1/${book}/${chapter}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching chapter" });
  }
});

// 🔹 VERSE route: /api/book/chapter/verse
app.get("/api/:book/:chapter/:verse", async (req, res) => {
  const { book, chapter, verse } = req.params;
  const url = `https://biblia-api.vercel.app/api/v1/${book}/${chapter}/${verse}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching verse" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend proxy running at http://localhost:${PORT}`);
});
