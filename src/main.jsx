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
import LoginPage from "./pages/LoginPage"; // ⬅️ make sure this file exists
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
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },

      // 👇 public login route
      { path: 'login', element: <LoginPage /> },

      // 👇 public (for now) routes
      { path: 'bible', element: <BibleSearch /> },
      { path: 'operator', element: <Operator /> },
      { path: 'present', element: <Present /> },

      // 👇 protected music route
      {
        path: 'music',
        element: (
          <RequireAuth>
            <MusicModePage />
          </RequireAuth>
        ),
      },

      // 👇 protected account route
      {
        path: 'account',
        element: (
          <RequireAuth>
            <AccountPage />
          </RequireAuth>
        ),
      },

      // optional: catch-all redirect
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
