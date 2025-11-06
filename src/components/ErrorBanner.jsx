// src/components/ErrorBanner.jsx
export default function ErrorBanner({ message }) {
  if (!message) return null;
  return <div style={{ color: "#ff8080" }}>{message}</div>;
}
