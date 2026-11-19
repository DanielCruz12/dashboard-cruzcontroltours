import { apiClient } from "@/lib/api-client";

export type Protocol = {
  id: number;
  tourId: number;
  title: string;
  description: string | null;
};

export type ProtocolInput = {
  tourId: number;
  title: string;
  description?: string | null;
};

export const listProtocols = async (): Promise<Protocol[]> => {
  const { data } = await apiClient.get<Protocol[]>("/protocols");
  return data;
};

export const getProtocol = async (id: number): Promise<Protocol> => {
  const { data } = await apiClient.get<Protocol>(`/protocols/${id}`);
  return data;
};

export const createProtocol = async (
  input: ProtocolInput,
): Promise<Protocol> => {
  const { data } = await apiClient.post<Protocol>("/protocols", input);
  return data;
};

export const updateProtocol = async (
  id: number,
  input: ProtocolInput,
): Promise<Protocol> => {
  const { data } = await apiClient.put<Protocol>(`/protocols/${id}`, input);
  return data;
};

export const deleteProtocol = async (id: number): Promise<void> => {
  await apiClient.delete(`/protocols/${id}`);
};
