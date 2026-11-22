import { apiClient } from "@/lib/api-client";
import type { RoleName } from "@/lib/session";

export type PanelUser = {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  active: boolean;
  createdAt: string;
};

export type PanelUserInput = {
  name: string;
  email: string;
  password?: string;
  role: RoleName;
  active?: boolean;
};

export type Role = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export const listUsers = async (): Promise<PanelUser[]> => {
  const { data } = await apiClient.get<PanelUser[]>("/users");
  return data;
};

export const getUser = async (id: string): Promise<PanelUser> => {
  const { data } = await apiClient.get<PanelUser>(`/users/${id}`);
  return data;
};

export const createUser = async (
  input: PanelUserInput,
): Promise<PanelUser> => {
  const { data } = await apiClient.post<PanelUser>("/users", input);
  return data;
};

export const updateUser = async (
  id: string,
  input: PanelUserInput,
): Promise<PanelUser> => {
  const { data } = await apiClient.put<PanelUser>(`/users/${id}`, input);
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};

export const listRoles = async (): Promise<Role[]> => {
  const { data } = await apiClient.get<Role[]>("/roles");
  return data;
};
