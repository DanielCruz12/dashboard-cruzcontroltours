"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { formatPrice, getColumns } from "./column";
import { useSession } from "@/lib/session";
import { TourFormDialog } from "./tour-form-dialog";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ViewDialog, ViewField } from "@/components/view-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchTours, removeTour, resetSave } from "@/lib/store/toursSlice";
import { fetchCategories } from "@/lib/store/categoriesSlice";
import { Tour } from "@/services/tour-service";
import { toErrorMessage } from "@/lib/api-client";

const tourFields: ViewField[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Título" },
  { key: "description", label: "Descripción" },
  {
    key: "price",
    label: "Precio",
    format: (value) => formatPrice(value as string),
  },
  { key: "durationDays", label: "Duración (días)" },
  {
    key: "active",
    label: "Estado",
    format: (value) => (value ? "Activo" : "Inactivo"),
  },
  { key: "categoryId", label: "Categoría (ID)" },
  {
    key: "images",
    label: "Imágenes",
    format: (value) => (value as string[]).join(", ") || "—",
  },
  {
    key: "videos",
    label: "Videos",
    format: (value) => (value as string[]).join(", ") || "—",
  },
  {
    key: "reviewCriteria",
    label: "Criterios",
    format: (value) => (value as string[]).join(" · ") || "—",
  },
  { key: "createdAt", label: "Creado" },
];

const TourList = () => {
  const dispatch = useAppDispatch();
  const { canWrite } = useSession();
  const router = useRouter();
  const items = useAppSelector((state) => state.tours.items);
  const listStatus = useAppSelector((state) => state.tours.listStatus);
  const listError = useAppSelector((state) => state.tours.listError);
  const categories = useAppSelector((state) => state.categories.items);
  const categoriesStatus = useAppSelector(
    (state) => state.categories.listStatus,
  );

  const [selected, setSelected] = useState<Tour | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tour | null>(null);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchTours());
    }
    if (categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }
  }, [dispatch, listStatus, categoriesStatus]);

  const openCreate = () => {
    dispatch(resetSave());
    router.push("/panel/tours/nuevo");
  };

  const openEdit = (tour: Tour) => {
    dispatch(resetSave());
    setEditing(tour);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este tour?",
    );
    if (!isConfirmed) return;

    try {
      await dispatch(removeTour(id)).unwrap();
      toast.success("Tour eliminado con éxito");
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  if (listStatus === "loading" || listStatus === "idle") {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Cargando tours…
      </p>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm font-medium text-red-600">{listError}</p>
        <Button onClick={() => dispatch(fetchTours())} className="mt-4">
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
            <Plus className="h-4 w-4" /> Crear tour
          </Button>
        )}
      </div>
      <DataTable
        placeholder="Buscar por título..."
        columns={getColumns(setSelected, openEdit, handleDelete, canWrite)}
        filterColumn="title"
        data={items}
      />
      <ViewDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Detalle del tour"
        description="Información completa del tour."
        data={selected}
        fields={tourFields}
      />
      <TourFormDialog
        key={`${editing?.id ?? "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        tour={editing}
        categories={categories}
      />
    </>
  );
};

export default TourList;
