import { apiClient } from "@/lib/api-client";

export type Faq = {
  id: number;
  question: string;
  answer: string;
  active: boolean;
};

export type FaqInput = {
  question: string;
  answer: string;
  active?: boolean;
};

export const listFaqs = async (): Promise<Faq[]> => {
  const { data } = await apiClient.get<Faq[]>("/faqs");
  return data;
};

export const getFaq = async (id: number): Promise<Faq> => {
  const { data } = await apiClient.get<Faq>(`/faqs/${id}`);
  return data;
};

export const createFaq = async (input: FaqInput): Promise<Faq> => {
  const { data } = await apiClient.post<Faq>("/faqs", input);
  return data;
};

export const updateFaq = async (
  id: number,
  input: FaqInput,
): Promise<Faq> => {
  const { data } = await apiClient.put<Faq>(`/faqs/${id}`, input);
  return data;
};

export const deleteFaq = async (id: number): Promise<void> => {
  await apiClient.delete(`/faqs/${id}`);
};
