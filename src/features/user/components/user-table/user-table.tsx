"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { getColumns, ROLE_LABELS } from "./column";
import { UserFormDialog } from "./user-form-dialog";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ViewDialog, ViewField } from "@/components/view-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchUsers, removeUser, resetSave } from "@/lib/store/usersSlice";
import { PanelUser } from "@/services/user-service";
import { toErrorMessage } from "@/lib/api-client";

const userFields: ViewField[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Nombre" },
  { key: "email", label: "Correo" },
  {
    key: "role",
    label: "Rol",
    format: (value) =>
      ROLE_LABELS[value as PanelUser["role"]] ?? String(value),
  },
  {
    key: "active",
    label: "Estado",
    format: (value) => (value ? "Activo" : "Inactivo"),
  },
  { key: "createdAt", label: "Creado" },
];

const UserList = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.users.items);
  const listStatus = useAppSelector((state) => state.users.listStatus);
  const listError = useAppSelector((state) => state.users.listError);

  const [selected, setSelected] = useState<PanelUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PanelUser | null>(null);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchUsers());
    }
  }, [dispatch, listStatus]);

  const openCreate = () => {
    dispatch(resetSave());
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (user: PanelUser) => {
    dispatch(resetSave());
    setEditing(user);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este usuario?",
    );
    if (!isConfirmed) return;

    try {
      await dispatch(removeUser(id)).unwrap();
      toast.success("Usuario eliminado con éxito");
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  if (listStatus === "loading" || listStatus === "idle") {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Cargando usuarios…
      </p>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm font-medium text-red-600">{listError}</p>
        <Button onClick={() => dispatch(fetchUsers())} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Crear usuario
        </Button>
      </div>
      <DataTable
        placeholder="Buscar por nombre..."
        columns={getColumns(setSelected, openEdit, handleDelete)}
        filterColumn="name"
        data={items}
      />
      <ViewDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Detalle del usuario"
        description="Información completa del usuario."
        data={selected}
        fields={userFields}
      />
      <UserFormDialog
        key={`${editing?.id ?? "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
      />
    </>
  );
};

export default UserList;
