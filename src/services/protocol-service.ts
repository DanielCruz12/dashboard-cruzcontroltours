import { apiClient } from "@/lib/api-client";

export type Protocol = {
  id: string;
  tourId: string;
  title: string;
  description: string | null;
};

export type ProtocolInput = {
  tourId: string;
  title: string;
  description?: string | null;
};

export const listProtocols = async (): Promise<Protocol[]> => {
  const { data } = await apiClient.get<Protocol[]>("/protocols");
  return data;
};

export const getProtocol = async (id: string): Promise<Protocol> => {
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
  id: string,
  input: ProtocolInput,
): Promise<Protocol> => {
  const { data } = await apiClient.put<Protocol>(`/protocols/${id}`, input);
  return data;
};

export const deleteProtocol = async (id: string): Promise<void> => {
  await apiClient.delete(`/protocols/${id}`);
};
