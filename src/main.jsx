// main.jsx 
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import App from './App';
import AccountPage from "./pages/AccountPage";
import Home from './pages/Home';
import BibleSearch from './pages/BibleSearch';
import Operator from './pages/Operator';
import Present from './pages/Present';
import { MusicModePage } from "./music/MusicModePage";
import LoginPage from "./pages/LoginPage";
import { MusicPlayerProvider } from "./context/MusicPlayerContext"; // 🔹 NEW
import './styles/global.css';

// Small wrapper to protect routes
function RequireAuth({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div style={{ color: "#fff", padding: 20 }}>
        Cargando…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  // 🌐 Main app (operator mode)
  {
    path: '/',
    element: (
      <SettingsProvider mode="operator">
        <MusicPlayerProvider>   {/* 🔹 envuelve toda la app principal */}
          <App />
        </MusicPlayerProvider>
      </SettingsProvider>
    ),
    children: [
      { index: true, element: <Home /> },

      // public login route
      { path: 'login', element: <LoginPage /> },

      // public (for now) routes
      { path: 'bible', element: <BibleSearch /> },
      { path: 'operator', element: <Operator /> },

      // protected music route
      {
        path: 'music',
        element: (
          <RequireAuth>
            <MusicModePage />
          </RequireAuth>
        ),
      },

      // protected account route
      {
        path: 'account',
        element: (
          <RequireAuth>
            <AccountPage />
          </RequireAuth>
        ),
      },

      // catch-all redirect
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },

  // 🎥 Presenter window (present mode) – NOT inside App
  {
    path: '/present',
    element: (
      <SettingsProvider mode="present">
        <Present />
      </SettingsProvider>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
