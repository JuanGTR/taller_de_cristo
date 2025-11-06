// src/components/PreviewCard.jsx
export default function PreviewCard({ refText, verses, onAction, actionLabel = "Enviar a Presentación" }) {
  return (
    <div className="card bible__preview preview">
      <div className="preview__ref">{refText}</div>
      <div className="preview__text">
        {Array.isArray(verses) && verses.map(v => (
          <div key={v.n}>
            <strong>{v.n}</strong> {v.t}
          </div>
        ))}
      </div>
      {onAction && (
        <button className="button button--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
