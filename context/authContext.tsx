"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
export interface AuthUser {
  id: string
  name?: string
  email?: string
}

interface AuthContextValue {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                   */
/* -------------------------------------------------------------------------- */
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/* -------------------------------------------------------------------------- */
/*  Provider                                                                  */
/* -------------------------------------------------------------------------- */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  /* ---------------------------------------------------------------------- */
  /*  Carrega usuário salvo no localStorage (opcional)                      */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem("fasttrack_user")
    if (raw && raw !== "undefined") {
      try {
        setUser(JSON.parse(raw))
      } catch {
        localStorage.removeItem("fasttrack_user")
      }
    }
  }, [])

  /* ---------------------------------------------------------------------- */
  /*  Métodos de login/logout (mock)                                        */
  /* ---------------------------------------------------------------------- */
  const login = (u: AuthUser) => {
    setUser(u)
    localStorage.setItem("fasttrack_user", JSON.stringify(u))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("fasttrack_user")
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

/* -------------------------------------------------------------------------- */
/*  Hook de consumo                                                           */
/* -------------------------------------------------------------------------- */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>")
  return ctx
}
