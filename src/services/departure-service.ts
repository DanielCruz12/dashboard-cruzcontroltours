import moment from "moment";
import "moment/locale/es";
import { apiClient } from "@/lib/api-client";

export type DepartureStatus = "open" | "closed" | "cancelled";

export const DEPARTURE_STATUS_LABEL: Record<DepartureStatus, string> = {
  open: "Abierta",
  closed: "Cerrada",
  cancelled: "Cancelada",
};

/** Fecha disponible (salida) de un tour. */
export type Departure = {
  id: string;
  tourId: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  /** HH:MM:SS o null si aún no tiene hora exacta. */
  startTime: string | null;
  capacity: number;
  /** Precio especial de esta salida (null = usa el del tour). */
  priceOverride: string | null;
  status: DepartureStatus;
};

export type DepartureCreateInput = {
  tourId: string;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  capacity: number;
  priceOverride?: number | string | null;
  status?: DepartureStatus;
};

export type DepartureUpdateInput = {
  startDate?: string;
  endDate?: string;
  startTime?: string | null;
  capacity?: number;
  priceOverride?: number | string | null;
  status?: DepartureStatus;
};

export const listDepartures = async (
  tourId?: string,
): Promise<Departure[]> => {
  const { data } = await apiClient.get<Departure[]>("/departures", {
    params: tourId ? { tourId } : undefined,
  });
  return data;
};

export const getDeparture = async (id: string): Promise<Departure> => {
  const { data } = await apiClient.get<Departure>(`/departures/${id}`);
  return data;
};

export const createDeparture = async (
  input: DepartureCreateInput,
): Promise<Departure> => {
  const { data } = await apiClient.post<Departure>("/departures", input);
  return data;
};

export const updateDeparture = async (
  id: string,
  input: DepartureUpdateInput,
): Promise<Departure> => {
  const { data } = await apiClient.put<Departure>(`/departures/${id}`, input);
  return data;
};

export const deleteDeparture = async (id: string): Promise<void> => {
  await apiClient.delete(`/departures/${id}`);
};

/** "2026-12-15" -> "15 dic 2026". */
export function formatDepartureDate(value: string): string {
  const m = moment(value, "YYYY-MM-DD", true);
  return m.isValid() ? m.locale("es").format("D MMM YYYY") : value;
}

/** "09:00:00" -> "09:00". */
export function formatDepartureTime(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
}

/** "15 dic 2026 · 09:00" (o "15 dic 2026 · sin hora"). */
export function formatDepartureDateTime(departure: Departure): string {
  const time = formatDepartureTime(departure.startTime);
  return time
    ? `${formatDepartureDate(departure.startDate)} · ${time}`
    : `${formatDepartureDate(departure.startDate)} · sin hora`;
}

/** Orden cronológico por fecha y hora de inicio. */
export function sortDepartures(departures: Departure[]): Departure[] {
  return [...departures].sort((a, b) => {
    if (a.startDate !== b.startDate)
      return a.startDate < b.startDate ? -1 : 1;
    return (a.startTime ?? "") < (b.startTime ?? "") ? -1 : 1;
  });
}
