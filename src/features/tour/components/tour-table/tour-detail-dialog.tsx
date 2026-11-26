"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import moment from "moment";
import "moment/locale/es";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "./column";
import { DepartureFormDialog } from "./departure-form-dialog";
import { Category } from "@/services/category-service";
import {
  deleteDeparture,
  DEPARTURE_STATUS_LABEL,
  Departure,
  DepartureStatus,
  formatDepartureDate,
  formatDepartureDateTime,
  formatDepartureTime,
  sortDepartures,
} from "@/services/departure-service";
import { Tour } from "@/services/tour-service";
import { toErrorMessage } from "@/lib/api-client";

type TourDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Tour | null;
  categories: Category[];
  departures: Departure[];
  canWrite: boolean;
  onDeparturesChanged: () => void;
};

const DEPARTURE_STATUS_STYLES: Record<DepartureStatus, string> = {
  open: "border-transparent bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  closed: "border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100",
  cancelled: "border-transparent bg-red-100 text-red-900 hover:bg-red-100",
};

export function TourDetailDialog({
  open,
  onOpenChange,
  tour,
  categories,
  departures,
  canWrite,
  onDeparturesChanged,
}: TourDetailDialogProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Departure | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!tour) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const category = categories.find((item) => item.id === tour.categoryId);
  const tourDepartures = sortDepartures(
    departures.filter((item) => item.tourId === tour.id),
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (departure: Departure) => {
    setEditing(departure);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await deleteDeparture(deleteId);
      toast.success("Fecha eliminada con éxito");
      setDeleteId(null);
      onDeparturesChanged();
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tour.title}</DialogTitle>
          <DialogDescription>
            {formatPrice(tour.price)} por persona · {tour.durationDays}{" "}
            {tour.durationDays === 1 ? "día" : "días"} ·{" "}
            {tour.active ? "Activo" : "Inactivo"}
          </DialogDescription>
        </DialogHeader>

        <dl className="divide-y divide-border rounded-md border">
          {tour.description ? (
            <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
              <dt className="font-medium text-muted-foreground">Descripción</dt>
              <dd className="col-span-2 break-words">{tour.description}</dd>
            </div>
          ) : null}
          <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
            <dt className="font-medium text-muted-foreground">Categoría</dt>
            <dd className="col-span-2">
              {category ? (
                category.name
              ) : (
                <span className="text-muted-foreground">Ninguna</span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
            <dt className="font-medium text-muted-foreground">Creado</dt>
            <dd className="col-span-2">
              {moment(tour.createdAt).locale("es").format("LLL")}
            </dd>
          </div>
        </dl>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">
              Fechas disponibles ({tourDepartures.length})
            </h4>
            {canWrite && (
              <Button size="sm" onClick={openCreate}>
                <CalendarPlus className="h-4 w-4" /> Agregar fecha
              </Button>
            )}
          </div>

          {tourDepartures.length === 0 ? (
            <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              Este tour aún no tiene fechas disponibles.
            </p>
          ) : (
            <ul className="space-y-2">
              {tourDepartures.map((departure) => {
                const time = formatDepartureTime(departure.startTime);
                const multiDay = departure.endDate !== departure.startDate;
                return (
                  <li
                    key={departure.id}
                    className="flex items-center gap-3 rounded-md border px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {formatDepartureDateTime(departure)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {multiDay
                          ? `Hasta ${formatDepartureDate(departure.endDate)} · `
                          : ""}
                        {departure.capacity}{" "}
                        {departure.capacity === 1 ? "cupo" : "cupos"} ·{" "}
                        {departure.priceOverride != null
                          ? `${formatPrice(departure.priceOverride)} (especial)`
                          : `${formatPrice(tour.price)}`}
                        {time ? "" : " · hora por definir"}
                      </p>
                    </div>
                    <Badge
                      className={
                        DEPARTURE_STATUS_STYLES[departure.status]
                      }
                    >
                      {DEPARTURE_STATUS_LABEL[departure.status]}
                    </Badge>
                    {canWrite && (
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Editar fecha"
                          onClick={() => openEdit(departure)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Eliminar fecha"
                          onClick={() => setDeleteId(departure.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {tour && (
          <DepartureFormDialog
            key={`${editing?.id ?? "new"}-${formOpen}`}
            open={formOpen}
            onOpenChange={setFormOpen}
            tour={tour}
            departure={editing}
            onSaved={onDeparturesChanged}
          />
        )}
        <ConfirmDialog
          open={deleteId !== null}
          onOpenChange={(openValue) => {
            if (!openValue) setDeleteId(null);
          }}
          title="Eliminar fecha"
          description="¿Estás seguro de que deseas eliminar esta fecha? Las reservas que la usen quedarán sin salida asignada."
          busy={deleting}
          onConfirm={handleConfirmDelete}
        />
      </DialogContent>
    </Dialog>
  );
}
