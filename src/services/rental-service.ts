import { apiClient } from "@/lib/api-client";

export type RentalStatus =
  | "pending"
  | "paid"
  | "en_route"
  | "completed"
  | "cancelled";

export type Rental = {
  id: string;
  date: string;
  time: string;
  status: RentalStatus;
  customerName: string;
  flightInfo: string | null;
  pickupPlace: string;
  destination: string;
  driverName: string | null;
  vehicle: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RentalInput = {
  date: string;
  time: string;
  status?: RentalStatus;
  customerName: string;
  flightInfo?: string | null;
  pickupPlace: string;
  destination: string;
  driverName?: string | null;
  vehicle?: string | null;
  notes?: string | null;
};

export const listRentals = async (): Promise<Rental[]> => {
  const { data } = await apiClient.get<Rental[]>("/rentals");
  return data;
};

export const getRental = async (id: string): Promise<Rental> => {
  const { data } = await apiClient.get<Rental>(`/rentals/${id}`);
  return data;
};

export const createRental = async (input: RentalInput): Promise<Rental> => {
  const { data } = await apiClient.post<Rental>("/rentals", input);
  return data;
};

export const updateRental = async (
  id: string,
  input: RentalInput,
): Promise<Rental> => {
  const { data } = await apiClient.put<Rental>(`/rentals/${id}`, input);
  return data;
};
