import { apiClient } from "@/lib/api-client";

// Clientes del formulario de contacto (tabla `customers` del backend).
export type Customer = {
  id: string;
  nombre: string;
  telefono: string;
  telefonoSecundario: string | null;
  fechaNacimiento: string | null;
  correo: string;
  mensaje: string | null;
  createdAt: string;
};

export type CustomerInput = {
  nombre: string;
  telefono: string;
  telefonoSecundario?: string;
  fechaNacimiento?: string;
  correo: string;
  mensaje?: string;
};

export const getCustomers = async (): Promise<Customer[]> => {
  const { data } = await apiClient.get<Customer[]>("/customers");
  return data;
};

export const createCustomer = async (
  input: CustomerInput,
): Promise<Customer> => {
  const { data } = await apiClient.post<Customer>("/customers", input);
  return data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await apiClient.delete(`/customers/${id}`);
};
