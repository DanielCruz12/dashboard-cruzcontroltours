"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getColumns } from "./column";
import { useSession } from "@/lib/session";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ViewDialog, ViewField } from "@/components/view-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchReviews, removeReview } from "@/lib/store/reviewsSlice";
import { Rating, Review } from "@/services/review-service";
import { toErrorMessage } from "@/lib/api-client";

const reviewFields: ViewField[] = [
  { key: "id", label: "ID" },
  { key: "tourId", label: "Tour (ID)" },
  { key: "bookingId", label: "Reserva (ID)" },
  { key: "userId", label: "Usuario" },
  {
    key: "ratings",
    label: "Notas",
    format: (value) =>
      (value as Rating[])
        .map((rating) => `${rating.criterion}: ${rating.score}/5`)
        .join(" · "),
  },
  {
    key: "avgRating",
    label: "Promedio",
    format: (value) => `${Number(value).toFixed(2)} / 5`,
  },
  { key: "comment", label: "Comentario" },
  { key: "createdAt", label: "Creada" },
];

const ReviewList = () => {
  const dispatch = useAppDispatch();
  const { canWrite } = useSession();
  const items = useAppSelector((state) => state.reviews.items);
  const listStatus = useAppSelector((state) => state.reviews.listStatus);
  const listError = useAppSelector((state) => state.reviews.listError);
  const [selected, setSelected] = useState<Review | null>(null);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchReviews());
    }
  }, [dispatch, listStatus]);

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar esta reseña?",
    );
    if (!isConfirmed) return;

    try {
      await dispatch(removeReview(id)).unwrap();
      toast.success("Reseña eliminada con éxito");
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  if (listStatus === "loading" || listStatus === "idle") {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Cargando reseñas…
      </p>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm font-medium text-red-600">{listError}</p>
        <Button onClick={() => dispatch(fetchReviews())} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <DataTable
        placeholder="Buscar por usuario..."
        columns={getColumns(handleDelete, setSelected, canWrite)}
        filterColumn="userId"
        data={items}
      />
      <ViewDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Detalle de la reseña"
        description="Información completa de la reseña."
        data={selected}
        fields={reviewFields}
      />
    </>
  );
};

export default ReviewList;
