// src/components/SearchBar.jsx
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Escribe aquí…",
  className = "",        // wrapper form class (for layout)
  inputClassName = "",   // input class (so you can style via CSS modules)
  autoFocus = false,
}) {
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit?.(e);
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <input
        className={inputClassName}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    </form>
  );
}
