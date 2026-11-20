"use client";

import { useEffect, useState } from "react";

export type RoleName = "superadmin" | "admin" | "host";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: RoleName;
  active: boolean;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(localStorage.getItem("user") || "null");
    if (parsed && parsed.email && parsed.role) return parsed as SessionUser;
    return null;
  } catch {
    return null;
  }
}

function setAuthCookie(token: string) {
  // `Secure` solo en https: en http://localhost el navegador rechaza
  // la cookie y la sesión nunca persistiría.
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `auth_token=${token}; path=/; max-age=${
    60 * 60 * 12
  }${secure}; SameSite=Strict`;
}

export function saveSession(token: string, user: SessionUser) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  setAuthCookie(token);
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.cookie = "auth_token=; path=/; max-age=0";
}

/**
 * Sesión actual del panel.
 * - host: solo lectura (canWrite = false).
 * - admin: crear, editar y eliminar.
 * - superadmin: todo lo anterior + gestionar usuarios.
 */
export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  const role = user?.role ?? null;
  return {
    user,
    role,
    isSuperadmin: role === "superadmin",
    canWrite: role === "superadmin" || role === "admin",
  };
}
