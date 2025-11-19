// src/music/MusicFilters.jsx
import React from "react";

const DEFAULT_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "alabanza", label: "Alabanzas" },
  { id: "instrumental", label: "Instrumentales" },
  { id: "ofrendas", label: "Para ofrendas" },
  { id: "corito", label: "Coritos" },
];

export function MusicFilters({ activeFilter, onChange }) {
  return (
    <div className="music-filters">
      {DEFAULT_FILTERS.map((f) => (
        <button
          key={f.id}
          className={
            "music-filter-chip" +
            (activeFilter === f.id ? " music-filter-chip--active" : "")
          }
          onClick={() => onChange(f.id)}
        >
          {f.label}
        </button>
      ))}

      {/* TODO: + custom label feature later */}
      {/* <button className="music-filter-chip music-filter-chip--outline">
        + Etiqueta
      </button> */}
    </div>
  );
}
