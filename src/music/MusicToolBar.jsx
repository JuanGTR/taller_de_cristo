// src/music/MusicToolbar.jsx
import React from "react";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "alabanza", label: "Alabanzas" },
  { id: "instrumental", label: "Instrumentales" },
  { id: "ofrendas", label: "Para ofrendas" },
  { id: "corito", label: "Coritos" },
];

export function MusicToolbar({
  query,
  onQueryChange,
  activeFilter,
  onFilterChange,
  onAdd,
}) {
  return (
    <section className="music-toolbar">
      {/* row 1: search + add button */}
      <div className="music-toolbar__topRow">
        <div className="music-toolbar__searchWrap">
          <input
            className="music-toolbar__searchInput"
            type="text"
            placeholder="Buscar canciones..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="music-toolbar__primary"
          onClick={onAdd}
        >
          <span>＋</span> Añadir música
        </button>
      </div>

      {/* row 2: filters under both */}
      <div className="music-toolbar__filtersRow">
        <div className="music-toolbar__filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={
                "music-toolbar__chip" +
                (activeFilter === f.id ? " music-toolbar__chip--active" : "")
              }
              onClick={() => onFilterChange(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
