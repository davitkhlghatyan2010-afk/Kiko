"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { clearToken, getMe, getToken, setToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Always starts true (both server and client render the same "loading" markup on first
  // paint) — reading getToken() here instead would return null during SSR (no window) but
  // a real value during client hydration, so the two render passes would produce different
  // markup and React would throw a hydration mismatch.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      // Nothing to await here, so there's no way to move this off the effect's first tick.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    getMe()
      .then(({ user }) => setUser(user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  function signIn(token, user) {
    setToken(token);
    setUser(user);
  }

  function signOut() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
