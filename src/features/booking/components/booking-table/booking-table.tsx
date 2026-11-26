"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { getColumns } from "./column";
import { BookingDetailDialog } from "./booking-detail-dialog";
import { BookingSummaryCards } from "./booking-summary-cards";
import { useSession } from "@/lib/session";
import { BookingFormDialog } from "./booking-form-dialog";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchBookings,
  removeBooking,
  resetSave,
} from "@/lib/store/bookingsSlice";
import { fetchTours } from "@/lib/store/toursSlice";
import { Booking } from "@/services/booking-service";
import {
  Departure,
  listDepartures,
} from "@/services/departure-service";
import { toErrorMessage } from "@/lib/api-client";

const BookingList = () => {
  const dispatch = useAppDispatch();
  const { canWrite } = useSession();
  const items = useAppSelector((state) => state.bookings.items);
  const listStatus = useAppSelector((state) => state.bookings.listStatus);
  const listError = useAppSelector((state) => state.bookings.listError);
  const tours = useAppSelector((state) => state.tours.items);
  const toursStatus = useAppSelector((state) => state.tours.listStatus);

  const [departures, setDepartures] = useState<Departure[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchBookings());
    }
    if (toursStatus === "idle") {
      dispatch(fetchTours());
    }
  }, [dispatch, listStatus, toursStatus]);

  useEffect(() => {
    let active = true;
    listDepartures()
      .then((data) => {
        if (active) setDepartures(data);
      })
      .catch(() => {
        if (active) setDepartures([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    dispatch(resetSave());
    setEditing(null);
    setFormOpen(true);
  };

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
      <BookingSummaryCards items={items} tours={tours} departures={departures} />
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Crear reserva
        </Button>
      </div>
      <DataTable
        placeholder="Buscar por usuario..."
        columns={getColumns(
          setSelected,
          openEdit,
          handleDelete,
          canWrite,
          tours,
          departures,
        )}
        filterColumn="userId"
        data={items}
      />
      <BookingDetailDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        booking={selected}
        tours={tours}
        departures={departures}
      />
      <BookingFormDialog
        key={`${editing?.id ?? "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        booking={editing}
        tours={tours}
        departures={departures}
      />
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
