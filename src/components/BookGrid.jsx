// src/components/BookGrid.jsx
export default function BookGrid({ books, onSelect }) {
  return (
    <div className="book-grid">
      {books.map(book => (
        <button
          key={book}
          className="button book-button"
          onClick={() => onSelect(book)}
        >
          {book}
        </button>
      ))}
    </div>
  );
}
