import { Outlet, Link, useLocation } from 'react-router-dom'

export default function App() {
  const { pathname } = useLocation()
  const showHeader = pathname !== '/present'
  return (
    <div className="app">
      {showHeader && (
        <header className="app__header">
          <Link to="/" className="app__brand">Iglesia Presenter</Link>
          <nav className="app__nav">
            <Link to="/operator" className="app__nav-link">Operator</Link>
          </nav>
        </header>
      )}
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  )
}
