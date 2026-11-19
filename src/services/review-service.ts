import { apiClient } from "@/lib/api-client";

export type Rating = {
  criterion: string;
  score: number;
};

export type Review = {
  id: number;
  tourId: number;
  bookingId: number;
  userId: string;
  ratings: Rating[];
  avgRating: string;
  comment: string | null;
  createdAt: string;
};

export const listReviews = async (): Promise<Review[]> => {
  const { data } = await apiClient.get<Review[]>("/reviews");
  return data;
};

export const getReview = async (id: number): Promise<Review> => {
  const { data } = await apiClient.get<Review>(`/reviews/${id}`);
  return data;
};

export const deleteReview = async (id: number): Promise<void> => {
  await apiClient.delete(`/reviews/${id}`);
};
