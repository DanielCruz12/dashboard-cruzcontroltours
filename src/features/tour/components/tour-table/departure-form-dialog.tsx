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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDeparture,
  DEPARTURE_STATUS_LABEL,
  Departure,
  DepartureStatus,
  updateDeparture,
} from "@/services/departure-service";
import { Tour } from "@/services/tour-service";
import { toErrorMessage } from "@/lib/api-client";

type DepartureFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Tour;
  departure: Departure | null;
  onSaved: () => void;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const PRICE_RE = /^\d+(\.\d{1,2})?$/;

type FieldErrors = {
  startDate?: string;
  startTime?: string;
  endDate?: string;
  capacity?: string;
  priceOverride?: string;
};

export function DepartureFormDialog({
  open,
  onOpenChange,
  tour,
  departure,
  onSaved,
}: DepartureFormDialogProps) {
  const [startDate, setStartDate] = useState(departure?.startDate ?? "");
  const [startTime, setStartTime] = useState(
    departure?.startTime ? departure.startTime.slice(0, 5) : "",
  );
  const [endDate, setEndDate] = useState(departure?.endDate ?? "");
  const [capacity, setCapacity] = useState(
    departure ? String(departure.capacity) : "",
  );
  const [priceOverride, setPriceOverride] = useState(
    departure?.priceOverride != null
      ? String(Number(departure.priceOverride))
      : "",
  );
  const [status, setStatus] = useState<DepartureStatus>(
    departure?.status ?? "open",
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (endDate === "") setEndDate(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: FieldErrors = {};
    if (!DATE_RE.test(startDate)) {
      next.startDate = "Elige la fecha de inicio.";
    }
    if (!TIME_RE.test(startTime)) {
      next.startTime = "Pon la hora exacta (p. ej. 09:00).";
    }
    if (!DATE_RE.test(endDate)) {
      next.endDate = "Elige la fecha de fin.";
    } else if (DATE_RE.test(startDate) && endDate < startDate) {
      next.endDate = "No puede ser antes del inicio.";
    }
    const cap = Number(capacity);
    if (!Number.isInteger(cap) || cap < 1) {
      next.capacity = "Debe ser 1 o más.";
    }
    if (
      priceOverride.trim() !== "" &&
      (!PRICE_RE.test(priceOverride.trim()) || Number(priceOverride) <= 0)
    ) {
      next.priceOverride = "Precio inválido (número positivo).";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      if (departure) {
        await updateDeparture(departure.id, {
          startDate,
          endDate,
          startTime,
          capacity: cap,
          priceOverride:
            priceOverride.trim() === "" ? null : priceOverride.trim(),
          status,
        });
        toast.success("Fecha actualizada con éxito");
      } else {
        await createDeparture({
          tourId: tour.id,
          startDate,
          endDate,
          startTime,
          capacity: cap,
          priceOverride:
            priceOverride.trim() === "" ? null : priceOverride.trim(),
          status,
        });
        toast.success("Fecha agregada con éxito");
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {departure ? "Editar fecha" : "Agregar fecha"} · {tour.title}
          </DialogTitle>
          <DialogDescription>
            Fecha y hora exacta en que sale este tour.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="departure-start-date">Fecha de inicio</Label>
              <Input
                id="departure-start-date"
                type="date"
                value={startDate}
                onChange={(event) =>
                  handleStartDateChange(event.target.value)
                }
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && (
                <p className="text-xs text-red-600">{errors.startDate}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="departure-start-time">Hora exacta</Label>
              <Input
                id="departure-start-time"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className={errors.startTime ? "border-red-500" : ""}
              />
              {errors.startTime && (
                <p className="text-xs text-red-600">{errors.startTime}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="departure-end-date">Fecha de fin</Label>
              <Input
                id="departure-end-date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className={errors.endDate ? "border-red-500" : ""}
              />
              {errors.endDate && (
                <p className="text-xs text-red-600">{errors.endDate}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="departure-capacity">Cupos</Label>
              <Input
                id="departure-capacity"
                type="number"
                min={1}
                step={1}
                value={capacity}
                placeholder="20"
                onChange={(event) => setCapacity(event.target.value)}
                className={errors.capacity ? "border-red-500" : ""}
              />
              {errors.capacity && (
                <p className="text-xs text-red-600">{errors.capacity}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="departure-price">
              Precio especial (opcional)
            </Label>
            <Input
              id="departure-price"
              value={priceOverride}
              onChange={(event) => setPriceOverride(event.target.value)}
              inputMode="decimal"
              placeholder={`Vacío = precio del tour ($${Number(tour.price).toFixed(2)})`}
              className={errors.priceOverride ? "border-red-500" : ""}
            />
            {errors.priceOverride && (
              <p className="text-xs text-red-600">{errors.priceOverride}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="departure-status">Estado</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as DepartureStatus)}
            >
              <SelectTrigger id="departure-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DEPARTURE_STATUS_LABEL) as DepartureStatus[]).map(
                  (value) => (
                    <SelectItem key={value} value={value}>
                      {DEPARTURE_STATUS_LABEL[value]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

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
