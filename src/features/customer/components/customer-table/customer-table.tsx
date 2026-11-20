"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getColumns } from "./column";
import { useSession } from "@/lib/session";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ViewDialog, ViewField } from "@/components/view-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchCustomers,
  removeCustomer,
} from "@/lib/store/customersSlice";
import { Customer } from "@/services/customer-service";
import { toErrorMessage } from "@/lib/api-client";

const customerFields: ViewField[] = [
  { key: "id", label: "ID" },
  { key: "nombre", label: "Nombre" },
  { key: "telefono", label: "Teléfono" },
  { key: "correo", label: "Correo" },
  { key: "mensaje", label: "Mensaje" },
  { key: "createdAt", label: "Recibido" },
];

const CustomerList = () => {
  const dispatch = useAppDispatch();
  const { canWrite } = useSession();
  const items = useAppSelector((state) => state.customers.items);
  const listStatus = useAppSelector((state) => state.customers.listStatus);
  const listError = useAppSelector((state) => state.customers.listError);
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchCustomers());
    }
  }, [dispatch, listStatus]);

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este cliente?",
    );
    if (!isConfirmed) return;

    try {
      await dispatch(removeCustomer(id)).unwrap();
      toast.success("Cliente eliminado con éxito");
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  if (listStatus === "loading" || listStatus === "idle") {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Cargando clientes…
      </p>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm font-medium text-red-600">{listError}</p>
        <Button onClick={() => dispatch(fetchCustomers())} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <DataTable
        placeholder="Buscar por nombre..."
        columns={getColumns(handleDelete, setSelected, canWrite)}
        filterColumn="nombre"
        data={items}
      />
      <ViewDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Detalle del cliente"
        description="Información completa del mensaje de contacto."
        data={selected}
        fields={customerFields}
      />
    </>
  );
};

export default CustomerList;
