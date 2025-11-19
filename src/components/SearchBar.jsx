// src/components/SearchBar.jsx
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Escribe aquí…",
  className = "",
  inputClassName = "",
  autoFocus = false,
  suggestions = [],
  onSuggestionSelect,
  onFocus,
}) {
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit?.(e);
  }

  function handleSuggestionClick(name) {
    // onMouseDown so the form doesn't lose focus before click
    onSuggestionSelect?.(name);
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <input
        className={inputClassName}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onFocus={onFocus}
      />

      {suggestions.length > 0 && (
        <ul className="search-bar__suggestions">
          {suggestions.map((name) => (
            <li
              key={name}
              className="search-bar__suggestion"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(name);
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
