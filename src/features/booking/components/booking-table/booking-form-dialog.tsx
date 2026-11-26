"use client";

import { useMemo, useState } from "react";
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
import {
  Departure,
  formatDepartureDateTime,
  sortDepartures,
} from "@/services/departure-service";
import { Tour } from "@/services/tour-service";
import { toErrorMessage } from "@/lib/api-client";
import { formatPrice } from "../../lib/payment";

type BookingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  tours: Tour[];
  departures?: Departure[];
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
  departures = [],
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
  const [departureId, setDepartureId] = useState(
    booking?.departureId ?? "none",
  );
  const [status, setStatus] = useState<BookingStatus>(
    booking ? booking.status : "pending",
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const saving = saveStatus === "loading";

  const selectedTour = useMemo(
    () => tours.find((tour) => tour.id === tourId),
    [tours, tourId],
  );
  const tourDepartures = useMemo(
    () =>
      tourId
        ? sortDepartures(departures.filter((item) => item.tourId === tourId))
        : [],
    [departures, tourId],
  );
  const selectedDeparture = useMemo(
    () =>
      departureId !== "none"
        ? tourDepartures.find((item) => item.id === departureId)
        : undefined,
    [tourDepartures, departureId],
  );

  const expected = useMemo(() => {
    if (!selectedTour) return null;
    const g = Number(guests);
    if (!Number.isInteger(g) || g < 1) return null;
    const override = selectedDeparture?.priceOverride;
    const unit =
      override !== null &&
      override !== undefined &&
      String(override).trim() !== "" &&
      Number(override) > 0
        ? Number(override)
        : Number(selectedTour.price);
    if (!Number.isFinite(unit)) return null;
    return Math.round(unit * g * 100) / 100;
  }, [selectedTour, selectedDeparture, guests]);

  const entered =
    totalPrice.trim() !== "" && Number.isFinite(Number(totalPrice))
      ? Number(totalPrice)
      : null;

  const handleTourChange = (value: string) => {
    setTourId(value);
    setDepartureId("none");
    if (!booking && totalPrice.trim() === "") {
      const tour = tours.find((item) => item.id === value);
      const g = Number(guests);
      if (tour && Number.isInteger(g) && g >= 1) {
        const unit = Number(tour.price);
        if (Number.isFinite(unit)) {
          setTotalPrice(String(Math.round(unit * g * 100) / 100));
        }
      }
    }
  };

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

    const departure = departureId === "none" ? null : departureId;
    try {
      if (booking) {
        await dispatch(
          updateBooking({
            id: booking.id,
            input: {
              guests: g,
              totalPrice: totalPrice.trim(),
              status,
              departureId: departure,
            },
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
            departureId: departure,
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
                <Select value={tourId} onValueChange={handleTourChange}>
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
                        {tour.title} — {formatPrice(tour.price)}
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

          <div className="space-y-1.5">
            <Label htmlFor="booking-departure">
              Salida / fecha (opcional)
            </Label>
            <Select
              value={departureId}
              onValueChange={setDepartureId}
              disabled={!tourId || tourDepartures.length === 0}
            >
              <SelectTrigger id="booking-departure">
                <SelectValue
                  placeholder={
                    !tourId
                      ? "Primero elige un tour"
                      : tourDepartures.length === 0
                        ? "Este tour no tiene fechas"
                        : "Sin salida asignada"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin salida asignada</SelectItem>
                {tourDepartures.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {formatDepartureDateTime(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          {selectedTour && expected !== null ? (
            <div className="space-y-2 rounded-md border bg-muted/50 px-4 py-3 text-sm">
              <p className="text-muted-foreground">
                Esperado: {formatPrice(expected)}{" "}
                <span className="text-xs">
                  ({formatPrice(selectedTour.price)} × {guests}{" "}
                  {Number(guests) === 1 ? "persona" : "personas"}
                  {selectedDeparture?.priceOverride
                    ? " · precio especial de la salida"
                    : ""}
                  )
                </span>
              </p>
              {entered === null ? (
                <p>Escribe el total cobrado para comparar.</p>
              ) : expected - entered > 0.005 ? (
                <p className="font-medium text-amber-700">
                  Faltan {formatPrice(expected - entered)} · quedará
                  Incompleta.
                </p>
              ) : entered - expected > 0.005 ? (
                <p className="font-medium text-blue-700">
                  Excede por {formatPrice(entered - expected)}.
                </p>
              ) : (
                <p className="font-medium text-emerald-700">
                  Completo · cubre el precio del tour.
                </p>
              )}
              {entered !== expected ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTotalPrice(String(expected))}
                >
                  Usar {formatPrice(expected)}
                </Button>
              ) : null}
            </div>
          ) : null}

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
