import { apiClient } from "@/lib/api-client";
import type { SessionUser } from "@/lib/session";

export type LoginResult = {
  token: string;
  user: SessionUser;
};

export const login = async (
  email: string,
  password: string,
): Promise<LoginResult> => {
  const { data } = await apiClient.post<LoginResult>("/auth/login", {
    email,
    password,
  });
  return data;
};
