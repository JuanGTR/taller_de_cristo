import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home container">
      <h1 className="home__title">Bienvenido — Iglesia Presenter</h1>

      <div className="card home__search">
        <div className="search-bar">
          <input
            className="search-bar__input"
            placeholder="Escribe aquí (opcional)…"
          />
        </div>

        <div className="home__modes">
          <button
            className="button button--primary button--lg"
            onClick={() => navigate("/bible")}
          >
            Biblia
          </button>
          <button
            className="button button--lg"
            onClick={() => navigate("/operator")}
          >
            Letras
          </button>
        </div>

        <p className="fullscreen-hint">
          Consejo: usa iPhone/iPad con “Duplicar pantalla” (AirPlay) y abre{" "}
          <code>/present</code> en la TV.
        </p>
      </div>
    </div>
  );
}
