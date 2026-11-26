"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { getColumns } from "./column";
import { useSession } from "@/lib/session";
import { TourDetailDialog } from "./tour-detail-dialog";
import { TourFormDialog } from "./tour-form-dialog";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchTours, removeTour, resetSave } from "@/lib/store/toursSlice";
import { fetchCategories } from "@/lib/store/categoriesSlice";
import { Tour } from "@/services/tour-service";
import {
  Departure,
  listDepartures,
} from "@/services/departure-service";
import { toErrorMessage } from "@/lib/api-client";

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

  const [departures, setDepartures] = useState<Departure[]>([]);
  const [selected, setSelected] = useState<Tour | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tour | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDepartures = useCallback(() => {
    listDepartures()
      .then(setDepartures)
      .catch(() => setDepartures([]));
  }, []);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchTours());
    }
    if (categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }
  }, [dispatch, listStatus, categoriesStatus]);

  useEffect(() => {
    fetchDepartures();
  }, [fetchDepartures]);

  const openCreate = () => {
    dispatch(resetSave());
    router.push("/panel/tours/nuevo");
  };

  const openEdit = (tour: Tour) => {
    dispatch(resetSave());
    setEditing(tour);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await dispatch(removeTour(deleteId)).unwrap();
      toast.success("Tour eliminado con éxito");
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
        columns={getColumns(
          setSelected,
          openEdit,
          handleDelete,
          canWrite,
          departures,
        )}
        filterColumn="title"
        data={items}
      />
      <TourDetailDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        tour={selected}
        categories={categories}
        departures={departures}
        canWrite={canWrite}
        onDeparturesChanged={fetchDepartures}
      />
      <TourFormDialog
        key={`${editing?.id ?? "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        tour={editing}
        categories={categories}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Eliminar tour"
        description="¿Estás seguro de que deseas eliminar este tour? Esta acción no se puede deshacer."
        busy={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default TourList;
