import { Event } from "@/hooks/use-data";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_URL_FEDEB;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

const handleError = (error: unknown, action: string): never => {
  if (axios.isAxiosError(error)) {
    console.error(
      `Axios error ${action}:`,
      error.response?.data || error.message
    );
  } else {
    console.error(`Unexpected error ${action}:`, error);
  }
  throw error;
};

export const getEvents = async () => {
  try {
    const { data } = await apiClient.get<Event[]>("/api/v1/events/");
    return data;
  } catch (error) {
    handleError(error, "getting events");
  }
};

export const createEvent = async (formData: FormData): Promise<undefined> => {
  try {
    const { data } = await apiClient.post("/api/v1/events/s3", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    console.error("Error creando el evento:", error);
    throw error;
  }
};

export const deleteEvent = async (id: number) => {
  try {
    const { data } = await apiClient.delete(`/api/v1/events/s3/${id}`);
    return data;
  } catch (error) {
    handleError(error, "Error eliminando el evento");
  }
};
