import { apiClient } from "@/lib/api-client";

export type BookingStatus = "pending" | "paid" | "cancelled";

export type Booking = {
  id: number;
  tourId: number;
  departureId: number | null;
  userId: string;
  guests: number;
  totalPrice: string;
  status: BookingStatus;
  createdAt: string;
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

export const getBooking = async (id: number): Promise<Booking> => {
  const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
  return data;
};

export const updateBooking = async (
  id: number,
  input: BookingUpdateInput,
): Promise<Booking> => {
  const { data } = await apiClient.put<Booking>(`/bookings/${id}`, input);
  return data;
};

export const deleteBooking = async (id: number): Promise<void> => {
  await apiClient.delete(`/bookings/${id}`);
};
