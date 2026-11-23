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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { createRental, updateRental } from "@/lib/store/rentalsSlice";
import { Rental, RentalStatus } from "@/services/rental-service";
import { STATUS_LABELS } from "./column";
import { toErrorMessage } from "@/lib/api-client";

type RentalFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental: Rental | null;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const STATUSES: RentalStatus[] = [
  "pending",
  "paid",
  "en_route",
  "completed",
  "cancelled",
];

type FieldErrors = {
  date?: string;
  time?: string;
  customerName?: string;
  pickupPlace?: string;
  destination?: string;
};

const inputClass = (invalid?: string) => (invalid ? "border-red-500" : "");

export function RentalFormDialog({
  open,
  onOpenChange,
  rental,
}: RentalFormDialogProps) {
  const dispatch = useAppDispatch();
  const saveStatus = useAppSelector((state) => state.rentals.saveStatus);
  const saveError = useAppSelector((state) => state.rentals.saveError);

  const [date, setDate] = useState(rental?.date ?? "");
  const [time, setTime] = useState(rental ? rental.time.slice(0, 5) : "");
  const [status, setStatus] = useState<RentalStatus>(
    rental?.status ?? "pending",
  );
  const [customerName, setCustomerName] = useState(
    rental?.customerName ?? "",
  );
  const [flightInfo, setFlightInfo] = useState(rental?.flightInfo ?? "");
  const [pickupPlace, setPickupPlace] = useState(rental?.pickupPlace ?? "");
  const [destination, setDestination] = useState(rental?.destination ?? "");
  const [driverName, setDriverName] = useState(rental?.driverName ?? "");
  const [vehicle, setVehicle] = useState(rental?.vehicle ?? "");
  const [notes, setNotes] = useState(rental?.notes ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

  const saving = saveStatus === "loading";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: FieldErrors = {};
    if (!DATE_RE.test(date.trim()) || Number.isNaN(Date.parse(date.trim()))) {
      next.date = "Fecha inválida (AAAA-MM-DD).";
    }
    if (!TIME_RE.test(time.trim())) {
      next.time = "Hora inválida (HH:MM).";
    }
    if (!customerName.trim()) next.customerName = "El cliente es requerido.";
    if (!pickupPlace.trim())
      next.pickupPlace = "El lugar de recogida es requerido.";
    if (!destination.trim()) next.destination = "El destino es requerido.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const input = {
      date: date.trim(),
      time: time.trim(),
      status,
      customerName: customerName.trim(),
      flightInfo: flightInfo.trim() || null,
      pickupPlace: pickupPlace.trim(),
      destination: destination.trim(),
      driverName: driverName.trim() || null,
      vehicle: vehicle.trim() || null,
      notes: notes.trim() || null,
    };

    try {
      if (rental) {
        await dispatch(updateRental({ id: rental.id, input })).unwrap();
        toast.success("Despacho actualizado con éxito");
      } else {
        await dispatch(createRental(input)).unwrap();
        toast.success("Despacho creado con éxito");
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
            {rental ? "Editar despacho" : "Crear despacho"}
          </DialogTitle>
          <DialogDescription>
            {rental
              ? "Modifica los datos del despacho y guarda los cambios."
              : "Completa los datos del nuevo despacho."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rental-date">Fecha</Label>
              <Input
                id="rental-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={inputClass(errors.date)}
              />
              {errors.date && (
                <p className="text-xs text-red-600">{errors.date}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rental-time">Hora</Label>
              <Input
                id="rental-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className={inputClass(errors.time)}
              />
              {errors.time && (
                <p className="text-xs text-red-600">{errors.time}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rental-status">Estado</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as RentalStatus)}
              >
                <SelectTrigger id="rental-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rental-customer">Cliente</Label>
              <Input
                id="rental-customer"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="p. ej. María Pérez"
                className={inputClass(errors.customerName)}
              />
              {errors.customerName && (
                <p className="text-xs text-red-600">{errors.customerName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rental-flight">Vuelo (opcional)</Label>
              <Input
                id="rental-flight"
                value={flightInfo}
                onChange={(event) => setFlightInfo(event.target.value)}
                placeholder="p. ej. AV 456 · 14:30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rental-pickup">Recogida</Label>
              <Input
                id="rental-pickup"
                value={pickupPlace}
                onChange={(event) => setPickupPlace(event.target.value)}
                placeholder="p. ej. Aeropuerto SAL"
                className={inputClass(errors.pickupPlace)}
              />
              {errors.pickupPlace && (
                <p className="text-xs text-red-600">{errors.pickupPlace}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rental-destination">Destino</Label>
              <Input
                id="rental-destination"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="p. ej. Hotel Real"
                className={inputClass(errors.destination)}
              />
              {errors.destination && (
                <p className="text-xs text-red-600">{errors.destination}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rental-driver">Conductor (opcional)</Label>
              <Input
                id="rental-driver"
                value={driverName}
                onChange={(event) => setDriverName(event.target.value)}
                placeholder="p. ej. Carlos Cruz"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rental-vehicle">Vehículo (opcional)</Label>
              <Input
                id="rental-vehicle"
                value={vehicle}
                onChange={(event) => setVehicle(event.target.value)}
                placeholder="p. ej. Hiace blanca · P-123"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rental-notes">Notas (opcional)</Label>
            <Textarea
              id="rental-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Indicaciones, equipaje, contacto…"
              rows={3}
            />
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
