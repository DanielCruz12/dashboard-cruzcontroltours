import { apiClient } from "@/lib/api-client";

export type BookingStatus = "pending" | "paid" | "cancelled";

export type Booking = {
  id: string;
  tourId: string;
  departureId: string | null;
  userId: string;
  guests: number;
  totalPrice: string;
  status: BookingStatus;
  createdAt: string;
};

export type BookingCreateInput = {
  tourId: string;
  departureId?: string | null;
  userId: string;
  guests: number;
  totalPrice: number | string;
  status?: BookingStatus;
};

export type BookingUpdateInput = {
  guests?: number;
  totalPrice?: number | string;
  status?: BookingStatus;
};

export const listBookings = async (): Promise<Booking[]> => {
  const { data } = await apiClient.get<Booking[]>("/bookings");
  return data;
};

export const getBooking = async (id: string): Promise<Booking> => {
  const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
  return data;
};

export const createBooking = async (
  input: BookingCreateInput,
): Promise<Booking> => {
  const { data } = await apiClient.post<Booking>("/bookings", input);
  return data;
};

export const updateBooking = async (
  id: string,
  input: BookingUpdateInput,
): Promise<Booking> => {
  const { data } = await apiClient.put<Booking>(`/bookings/${id}`, input);
  return data;
};

export const deleteBooking = async (id: string): Promise<void> => {
  await apiClient.delete(`/bookings/${id}`);
};
