"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatPrice, getColumns } from "./column";
import { useSession } from "@/lib/session";
import { BookingFormDialog } from "./booking-form-dialog";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ViewDialog, ViewField } from "@/components/view-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchBookings,
  removeBooking,
  resetSave,
} from "@/lib/store/bookingsSlice";
import { Booking } from "@/services/booking-service";
import { toErrorMessage } from "@/lib/api-client";

const bookingFields: ViewField[] = [
  { key: "id", label: "ID" },
  { key: "tourId", label: "Tour (ID)" },
  { key: "departureId", label: "Salida (ID)" },
  { key: "userId", label: "Usuario" },
  { key: "guests", label: "Personas" },
  {
    key: "totalPrice",
    label: "Total",
    format: (value) => formatPrice(value as string),
  },
  { key: "status", label: "Estado" },
  { key: "createdAt", label: "Creada" },
];

const BookingList = () => {
  const dispatch = useAppDispatch();
  const { canWrite } = useSession();
  const items = useAppSelector((state) => state.bookings.items);
  const listStatus = useAppSelector((state) => state.bookings.listStatus);
  const listError = useAppSelector((state) => state.bookings.listError);

  const [selected, setSelected] = useState<Booking | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchBookings());
    }
  }, [dispatch, listStatus]);

  const openEdit = (booking: Booking) => {
    dispatch(resetSave());
    setEditing(booking);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await dispatch(removeBooking(deleteId)).unwrap();
      toast.success("Reserva eliminada con éxito");
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
        Cargando reservas…
      </p>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm font-medium text-red-600">{listError}</p>
        <Button onClick={() => dispatch(fetchBookings())} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <DataTable
        placeholder="Buscar por usuario..."
        columns={getColumns(setSelected, openEdit, handleDelete, canWrite)}
        filterColumn="userId"
        data={items}
      />
      <ViewDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Detalle de la reserva"
        description="Información completa de la reserva."
        data={selected}
        fields={bookingFields}
      />
      {editing && (
        <BookingFormDialog
          key={`${editing.id}-${formOpen}`}
          open={formOpen}
          onOpenChange={setFormOpen}
          booking={editing}
        />
      )}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Eliminar reserva"
        description="¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer."
        busy={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default BookingList;
