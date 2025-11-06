import { useNavigate } from "react-router-dom";
import logo from '../assets/Altar Pro Logo.svg';
import styles from '../styles/Home.module.css';

export default function Home() {
  const navigate = useNavigate();

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
        <input
          className={styles.home__searchbar}
          placeholder="Cita Bíblica, Música, Alabanza"
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
            onClick={() => alert('Muy pronto')}
          >
            Musica
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
            <strong>Bienvenido!</strong><br/>
            Con Altar Pro puedes proyectar pasajes bíblicos de forma clara, elegante y organizada para tus estudios, prédicas, partes especiales y más. Diseñado para el altar, esta app transforma cualquier pantalla o proyector en una herramienta de presentación poderosa, moderna y sencilla de usar.
          </p>
          <p>
            Muy pronto también podrás agregar y guardar letras de adoraciones, himnos y coros para que toda la iglesia pueda seguirte durante la alabanza.
          </p>
        </div>

        <p className={styles.home__tip}>
          Consejo: usa iPhone/iPad con “Duplicar pantalla” (AirPlay) y abre <code>/presenta</code> en la TV.
        </p>
      </div>
    </div>
  );
}
