import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 5174; // or 5000, anything you like

app.use(cors()); // allow frontend to call this server

// Example route: http://localhost:5174/api/filipenses/4/13
app.get("/api/:book/:chapter/:verse", async (req, res) => {
  const { book, chapter, verse } = req.params;
  const url = `https://biblia-api.vercel.app/api/v1/${book}/${chapter}/${verse}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data); // relay it to frontend
  } catch (err) {
    res.status(500).json({ error: "Error fetching verse" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend proxy running at http://localhost:${PORT}`);
});
