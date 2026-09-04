"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type SessionRole = "admin" | "visitor" | null;

interface AuthContextType {
  role: SessionRole;
  loading: boolean;
  isVisitor: boolean;
  isAdmin: boolean;
  passwordLogin: (password: string) => Promise<void>;
  visitorLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  loading: true,
  isVisitor: false,
  isAdmin: false,
  passwordLogin: async () => {},
  visitorLogin: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<SessionRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/admin/session", { credentials: "same-origin" });
        if (res.ok) {
          const data = await res.json();
          setRole(data.authenticated ? data.role : null);
        } else {
          setRole(null);
        }
      } catch {
        setRole(null);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  async function passwordLogin(password: string) {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      let msg = "Login failed";
      try {
        const data = await res.json();
        msg = data.error || msg;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }
    const data = await res.json();
    setRole(data.role || "admin");
    setLoading(false);
  }

  async function visitorLogin() {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
    });
    if (!res.ok) {
      let msg = "Login failed";
      try {
        const data = await res.json();
        msg = data.error || msg;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }
    const data = await res.json();
    setRole(data.role || "visitor");
    setLoading(false);
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE", credentials: "same-origin" });
    setRole(null);
  }

  return (
    <AuthContext.Provider
      value={{
        role,
        loading,
        isVisitor: role === "visitor",
        isAdmin: role === "admin",
        passwordLogin,
        visitorLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
