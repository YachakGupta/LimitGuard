import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMe,
  selectCurrentUser,
  selectIsInitializing,
} from './features/auth/authSlice';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

// Protected Route Component: only accessible to authenticated users
function Protected({ children }) {
  const user = useSelector(selectCurrentUser);
  return user ? children : <Navigate to="/login" replace />;
}

// GuestOnly Route Component: accessible only when NOT logged in (e.g. login, register)
function GuestOnly({ children }) {
  const user = useSelector(selectCurrentUser);
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  const dispatch = useDispatch();
  const initializing = useSelector(selectIsInitializing);

  // Check session with GET /me on initial load
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  // While checking initial session, display centered spinner
  if (initializing) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FFFFFF] dark:bg-[#0A0A0A] transition-colors duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            {/* Outer spinning ring */}
            <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-[#8B7CF6] animate-spin" />
            {/* Center pulsing shield/dot */}
            <div className="absolute w-4 h-4 rounded-full bg-[#8B7CF6] animate-pulse" />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#6B6B6B] dark:text-[#8A8A8A] font-semibold">
            LimitGuard
          </span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/settings"
        element={
          <Protected>
            <Settings />
          </Protected>
        }
      />
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
