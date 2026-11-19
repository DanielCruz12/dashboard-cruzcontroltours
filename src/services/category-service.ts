import { apiClient } from "@/lib/api-client";

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
};

export type CategoryInput = {
  name: string;
  slug: string;
  description?: string | null;
  active?: boolean;
};

export const listCategories = async (): Promise<Category[]> => {
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
};

export const getCategory = async (id: number): Promise<Category> => {
  const { data } = await apiClient.get<Category>(`/categories/${id}`);
  return data;
};

export const createCategory = async (
  input: CategoryInput,
): Promise<Category> => {
  const { data } = await apiClient.post<Category>("/categories", input);
  return data;
};

export const updateCategory = async (
  id: number,
  input: CategoryInput,
): Promise<Category> => {
  const { data } = await apiClient.put<Category>(`/categories/${id}`, input);
  return data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};
