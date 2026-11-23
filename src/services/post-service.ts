import { apiClient } from "@/lib/api-client";

export type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  coverImage: string | null;
  content: string | null;
  published: boolean;
  createdAt: string;
};

export type PostInput = {
  title: string;
  excerpt?: string | null;
  category?: string | null;
  coverImage?: string | null;
  content?: string | null;
  published?: boolean;
};

export const listPosts = async (): Promise<Post[]> => {
  const { data } = await apiClient.get<Post[]>("/posts");
  return data;
};

export const getPost = async (id: string): Promise<Post> => {
  const { data } = await apiClient.get<Post>(`/posts/${id}`);
  return data;
};

export const createPost = async (input: PostInput): Promise<Post> => {
  const { data } = await apiClient.post<Post>("/posts", input);
  return data;
};

export const updatePost = async (
  id: string,
  input: PostInput,
): Promise<Post> => {
  const { data } = await apiClient.put<Post>(`/posts/${id}`, input);
  return data;
};

export const deletePost = async (id: string): Promise<void> => {
  await apiClient.delete(`/posts/${id}`);
};
