import axios from "axios";
import { clearSession, getToken } from "@/lib/session";

// URL base del backend (incluye /api/v1).
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Adjunta el JWT de la sesión a cada petición.
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// El backend envuelve las respuestas en `{ data }`: desenvolver automáticamente.
apiClient.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === "object" && "data" in res.data) {
      res.data = (res.data as { data: unknown }).data;
    }
    return res;
  },
  (error) => {
    // Sesión inválida o expirada dentro del panel: limpiar y volver al login.
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/panel")
    ) {
      clearSession();
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export function toErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = (
      error.response?.data as { message?: string } | undefined
    )?.message;
    if (message) return message;
    if (!error.response) {
      return "No se pudo conectar con el servidor. Revisa que el backend esté corriendo.";
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
