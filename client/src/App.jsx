import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { api } from './api.js';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const location = useLocation();

  // On first load (and whenever the route changes to a protected page) check
  // whether a valid session exists by hitting /api/me.
  useEffect(() => {
    let active = true;
    api
      .me()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setChecked(true));
    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (!checked) {
    return (
      <div className="app-loading">
        <span className="spinner" aria-label="Loading" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing user={user} />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard user={user} onUser={setUser} /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
