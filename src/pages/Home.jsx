import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/Altar Pro Logo.svg';
import styles from '../styles/Home.module.css';
import SearchBar from "../components/SearchBar";
import { useAuth } from "../context/AuthContext";

// Simple helper: guess if input looks like a Bible reference
function looksLikeBibleRef(raw) {
  const text = raw.trim();
  if (!text) return false;

  // If it has a colon, it's very likely "Juan 3:16" / "Filipenses 4:13-15"
  if (text.includes(":")) return true;

  // If it ends with a number (e.g. "Salmo 23", "Juan 3")
  const endsWithNumber = /\d+$/.test(text);
  if (endsWithNumber) return true;

  return false;
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [homeInput, setHomeInput] = useState("");

  function handleHomeSearch() {
    const value = homeInput.trim();
    if (!value) return;

    const isBible = looksLikeBibleRef(value);

    if (isBible) {
      // always send Bible refs to Biblia
      navigate("/bible", { state: { input: value } });
    } else if (user) {
      // logged in + not a ref → search songs in Música
      navigate("/music", { state: { input: value } });
    } else {
      // not logged in → keep old behavior (always Biblia)
      navigate("/bible", { state: { input: value } });
    }
  }

  return (
    <div className={styles.home}>
      <div className={styles.home__header}>
        <img src={logo} alt="Altar Pro Logo" className={styles.home__logo} />
        <h1 className={styles.home__brand}>
          <span className={styles.home__brandTop}>Altar</span>
          <span className={styles.home__brandBottom}>Pro</span>
        </h1>
      </div>

      <div className={styles.home__card}>
        <SearchBar
          value={homeInput}
          onChange={setHomeInput}
          onSubmit={handleHomeSearch}
          placeholder="Cita bíblica, música, alabanza"
          className={styles.home__searchForm}
          inputClassName={styles.home__searchbar}
        />

        <div className={styles.home__modes}>
          <button
            className={`${styles.home__button} ${styles.primary}`}
            onClick={() => navigate("/bible")}
          >
            Biblia
          </button>
          <button
            className={styles.home__button}
            onClick={() => navigate('/music')}
          >
            Música
          </button>
          <button
            className={styles.home__button}
            onClick={() => navigate("/operator")}
          >
            Ajustes
          </button>
        </div>

        <div className={styles.home__intro}>
          <p>
            <strong>¡Bienvenido!</strong><br />
            Con Altar Pro puedes proyectar pasajes bíblicos de forma clara, elegante y organizada
            para tus estudios, prédicas, partes especiales y más. Diseñado para el altar, esta app
            transforma cualquier pantalla o proyector en una herramienta de presentación poderosa,
            moderna y sencilla de usar.
          </p>
          <p>
            Muy pronto también podrás agregar y guardar letras de adoraciones, himnos y coros
            para que toda la iglesia pueda seguirte durante la alabanza.
          </p>
        </div>

        <p className={styles.home__tip}>
          Consejo: usa iPhone/iPad con “Duplicar pantalla” (AirPlay) y presenta
         en la TV.
        </p>
      </div>
    </div>
  );
}
