import { apiClient } from "@/lib/api-client";

// Clientes del formulario de contacto (tabla `customers` del backend).
export type Customer = {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  mensaje: string | null;
  createdAt: string;
};

export const getCustomers = async (): Promise<Customer[]> => {
  const { data } = await apiClient.get<Customer[]>("/customers");
  return data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await apiClient.delete(`/customers/${id}`);
};
