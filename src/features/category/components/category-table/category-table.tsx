"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { getColumns } from "./column";
import { useSession } from "@/lib/session";
import { CategoryFormDialog } from "./category-form-dialog";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ViewDialog, ViewField } from "@/components/view-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchCategories,
  removeCategory,
  resetSave,
} from "@/lib/store/categoriesSlice";
import { Category } from "@/services/category-service";
import { toErrorMessage } from "@/lib/api-client";

const categoryFields: ViewField[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Nombre" },
  { key: "slug", label: "Slug" },
  { key: "description", label: "Descripción" },
  {
    key: "active",
    label: "Estado",
    format: (value) => (value ? "Activo" : "Inactivo"),
  },
];

const CategoryList = () => {
  const dispatch = useAppDispatch();
  const { canWrite } = useSession();
  const items = useAppSelector((state) => state.categories.items);
  const listStatus = useAppSelector((state) => state.categories.listStatus);
  const listError = useAppSelector((state) => state.categories.listError);

  const [selected, setSelected] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchCategories());
    }
  }, [dispatch, listStatus]);

  const openCreate = () => {
    dispatch(resetSave());
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    dispatch(resetSave());
    setEditing(category);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await dispatch(removeCategory(deleteId)).unwrap();
      toast.success("Categoría eliminada con éxito");
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
        Cargando categorías…
      </p>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm font-medium text-red-600">{listError}</p>
        <Button onClick={() => dispatch(fetchCategories())} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Crear categoría
          </Button>
        )}
      </div>
      <DataTable
        placeholder="Buscar por nombre..."
        columns={getColumns(setSelected, openEdit, handleDelete, canWrite)}
        filterColumn="name"
        data={items}
      />
      <ViewDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Detalle de la categoría"
        description="Información completa de la categoría."
        data={selected}
        fields={categoryFields}
      />
      <CategoryFormDialog
        key={`${editing?.id ?? "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Eliminar categoría"
        description="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
        busy={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default CategoryList;
