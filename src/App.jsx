import { Outlet, Link, useLocation } from 'react-router-dom';
import logo from '../src/assets/Altar Pro Logo.svg';

export default function App() {
  const { pathname } = useLocation();
  const showHeader = pathname !== '/present';
  const isOperatorRoute = pathname.startsWith('/operator');

  return (
    <div className="app">
      {showHeader && (
        <header className="app__header">
          <Link to="/" className="app__brand">
            {/* Logo image – put your logo file in /public and adjust the src if needed */}
            <img
              src={logo}
              alt="Altar Pro"
              className="app__logo"
            />
            <span className="app__brand-text">altar pro</span>
          </Link>

          <nav className="app__nav">
            <Link
              to="/operator"
              className={`app__nav-link ${isOperatorRoute ? 'is-active' : ''}`}
            >
              Ajustes
            </Link>
          </nav>
        </header>
      )}

      <main className="app__main">
        <Outlet />
      </main>
    </div>
  );
}
