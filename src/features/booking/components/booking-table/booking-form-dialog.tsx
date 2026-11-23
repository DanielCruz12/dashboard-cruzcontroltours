"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shortId } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { createBooking, updateBooking } from "@/lib/store/bookingsSlice";
import { Booking, BookingStatus } from "@/services/booking-service";
import { Tour } from "@/services/tour-service";
import { toErrorMessage } from "@/lib/api-client";

type BookingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  tours: Tour[];
};

const PRICE_RE = /^\d+(\.\d{1,2})?$/;

type FieldErrors = {
  tourId?: string;
  userId?: string;
  guests?: string;
  totalPrice?: string;
};

export function BookingFormDialog({
  open,
  onOpenChange,
  booking,
  tours,
}: BookingFormDialogProps) {
  const dispatch = useAppDispatch();
  const saveStatus = useAppSelector((state) => state.bookings.saveStatus);
  const saveError = useAppSelector((state) => state.bookings.saveError);

  const [tourId, setTourId] = useState(booking ? booking.tourId : "");
  const [userId, setUserId] = useState(booking ? booking.userId : "");
  const [guests, setGuests] = useState(booking ? String(booking.guests) : "1");
  const [totalPrice, setTotalPrice] = useState(
    booking ? String(Number(booking.totalPrice)) : "",
  );
  const [status, setStatus] = useState<BookingStatus>(
    booking ? booking.status : "pending",
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const saving = saveStatus === "loading";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: FieldErrors = {};
    if (!booking) {
      if (!tourId) next.tourId = "Debes seleccionar un tour.";
      if (!userId.trim()) next.userId = "El usuario es requerido.";
    }
    const g = Number(guests);
    if (!Number.isInteger(g) || g < 1) {
      next.guests = "Debe ser 1 o más.";
    }
    if (!totalPrice.trim()) {
      next.totalPrice = "El total es requerido.";
    } else if (!PRICE_RE.test(totalPrice.trim()) || Number(totalPrice) <= 0) {
      next.totalPrice = "Precio inválido (número positivo, máx. 2 decimales).";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      if (booking) {
        await dispatch(
          updateBooking({
            id: booking.id,
            input: { guests: g, totalPrice: totalPrice.trim(), status },
          }),
        ).unwrap();
        toast.success("Reserva actualizada con éxito");
      } else {
        await dispatch(
          createBooking({
            tourId,
            userId: userId.trim(),
            guests: g,
            totalPrice: totalPrice.trim(),
            status,
          }),
        ).unwrap();
        toast.success("Reserva creada con éxito");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {booking
              ? `Editar reserva #${shortId(booking.id)}`
              : "Crear reserva"}
          </DialogTitle>
          <DialogDescription>
            {booking
              ? "Modifica los datos de la reserva y guarda los cambios."
              : "Carga manual de una reserva."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!booking && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="booking-tour">Tour</Label>
                <Select value={tourId} onValueChange={setTourId}>
                  <SelectTrigger
                    id="booking-tour"
                    className={errors.tourId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecciona un tour" />
                  </SelectTrigger>
                  <SelectContent>
                    {tours.length === 0 && (
                      <SelectItem value="none" disabled>
                        Sin tours disponibles
                      </SelectItem>
                    )}
                    {tours.map((tour) => (
                      <SelectItem key={tour.id} value={tour.id}>
                        #{shortId(tour.id)} — {tour.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tourId && (
                  <p className="text-xs text-red-600">{errors.tourId}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="booking-user">Usuario (ID o correo)</Label>
                <Input
                  id="booking-user"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder="p. ej. maria@correo.com"
                  className={errors.userId ? "border-red-500" : ""}
                />
                {errors.userId && (
                  <p className="text-xs text-red-600">{errors.userId}</p>
                )}
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="booking-guests">Personas</Label>
              <Input
                id="booking-guests"
                type="number"
                min={1}
                step={1}
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
                className={errors.guests ? "border-red-500" : ""}
              />
              {errors.guests && (
                <p className="text-xs text-red-600">{errors.guests}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="booking-total">Total (USD)</Label>
              <Input
                id="booking-total"
                value={totalPrice}
                onChange={(event) => setTotalPrice(event.target.value)}
                inputMode="decimal"
                className={errors.totalPrice ? "border-red-500" : ""}
              />
              {errors.totalPrice && (
                <p className="text-xs text-red-600">{errors.totalPrice}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="booking-status">Estado</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as BookingStatus)}
            >
              <SelectTrigger id="booking-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {saveError && (
            <p className="text-sm text-red-600">{saveError}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
