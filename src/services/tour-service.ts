import { apiClient } from "@/lib/api-client";

export type Tour = {
  id: number;
  title: string;
  description: string | null;
  price: string;
  durationDays: number;
  active: boolean;
  categoryId: number | null;
  images: string[];
  videos: string[];
  reviewCriteria: string[];
  createdAt: string;
};

export type NewTourInput = {
  title: string;
  description?: string;
  price: number | string;
  durationDays?: number;
  active?: boolean;
  categoryId?: number | null;
  images?: string[];
  videos?: string[];
  reviewCriteria?: string[];
};

export const listTours = async (): Promise<Tour[]> => {
  const { data } = await apiClient.get<Tour[]>("/tours");
  return data;
};

export const getTour = async (id: number): Promise<Tour> => {
  const { data } = await apiClient.get<Tour>(`/tours/${id}`);
  return data;
};

export const createTour = async (input: NewTourInput): Promise<Tour> => {
  const { data } = await apiClient.post<Tour>("/tours", input);
  return data;
};

export const updateTour = async (
  id: number,
  input: NewTourInput,
): Promise<Tour> => {
  const { data } = await apiClient.put<Tour>(`/tours/${id}`, input);
  return data;
};

export const deleteTour = async (id: number): Promise<void> => {
  await apiClient.delete(`/tours/${id}`);
};
