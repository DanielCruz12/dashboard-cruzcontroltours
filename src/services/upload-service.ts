import { apiClient } from "@/lib/api-client";

export type UploadedFile = {
  name: string;
  type: string;
  size: number;
  url: string;
  key: string;
};

export const uploadFiles = async (files: File[]): Promise<UploadedFile[]> => {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  const { data } = await apiClient.post<UploadedFile[]>("/uploads", form);
  return data;
};
