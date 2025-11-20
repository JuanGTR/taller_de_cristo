import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../src/assets/Altar Pro Logo.svg";
import { useAuth } from "./context/AuthContext";
import { NowPlayingBar } from "./music/NowPlayingBar"; // 🔹 NEW

export default function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const showHeader = pathname !== "/present";
  const isOperatorRoute = pathname.startsWith("/operator");

  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!user;

  // Small helper for initials
  const initials = (() => {
    if (!user) return "";
    if (user.displayName) {
      const parts = user.displayName.split(" ").filter(Boolean);
      const first = parts[0]?.[0] ?? "";
      const last = parts[1]?.[0] ?? "";
      return (first + last).toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "A";
  })();

  async function handleLogout() {
    try {
      await logout();
      setMenuOpen(false);
      navigate("/"); // back to home
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  }

  return (
    <div className="app">
      {showHeader && (
        <header className="app__header">
          <Link to="/" className="app__brand">
            <img src={logo} alt="Altar Pro" className="app__logo" />
            <span className="app__brand-text">altar pro</span>
          </Link>

          <nav className="app__nav">
            {/* 🔊 Now Playing bar, top-right in the header */}
           <Link to="/music" > <NowPlayingBar /></Link>

            {/* Ajustes stays */}
            <Link
              to="/operator"
              className={`app__nav-link ${
                isOperatorRoute ? "is-active" : ""
              }`}
            >
              Ajustes
            </Link>

            {/* Auth section */}
            {!isLoggedIn ? (
              <Link
                to="/login"
                className="app__nav-link app__nav-link--primary"
              >
                Iniciar sesión
              </Link>
            ) : (
              <div className="app__userMenu">
                <button
                  type="button"
                  className="app__userButton"
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <span className="app__userInitials">{initials}</span>
                </button>

                {menuOpen && (
                  <div className="app__userDropdown">
                    <Link
                      to="/account"
                      className="app__userDropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      Cuenta
                    </Link>
                    <button
                      type="button"
                      className="app__userDropdown-item app__userDropdown-item--danger"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </header>
      )}

      <main className="app__main">
        <Outlet />
      </main>
    </div>
  );
}
