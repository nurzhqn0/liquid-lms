import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      const data = await apiFetch("/api/auth/me");
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const login = async (identifier, password) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password })
    });
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh: loadMe }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
