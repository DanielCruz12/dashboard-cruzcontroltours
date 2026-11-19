import axios from "axios";

// URL base del backend (incluye /api/v1).
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// El backend envuelve las respuestas en `{ data }`: desenvolver automáticamente.
apiClient.interceptors.response.use((res) => {
  if (res.data && typeof res.data === "object" && "data" in res.data) {
    res.data = (res.data as { data: unknown }).data;
  }
  return res;
});

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
