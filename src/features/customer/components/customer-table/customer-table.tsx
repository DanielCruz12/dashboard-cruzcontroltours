"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getColumns } from "./column";
import { useSession } from "@/lib/session";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchCustomers());
    }
  }, [dispatch, listStatus]);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await dispatch(removeCustomer(deleteId)).unwrap();
      toast.success("Cliente eliminado con éxito");
      setDeleteId(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setDeleting(false);
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
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Eliminar cliente"
        description="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
        busy={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default CustomerList;
