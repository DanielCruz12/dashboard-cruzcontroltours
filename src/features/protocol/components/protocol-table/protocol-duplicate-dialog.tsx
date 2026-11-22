"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { shortId } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Protocol } from "@/services/protocol-service";
import { Tour } from "@/services/tour-service";

type ProtocolDuplicateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocol: Protocol | null;
  tours: Tour[];
  saving: boolean;
  onConfirm: (tourId: string) => void;
};

export function ProtocolDuplicateDialog({
  open,
  onOpenChange,
  protocol,
  tours,
  saving,
  onConfirm,
}: ProtocolDuplicateDialogProps) {
  const [tourId, setTourId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const currentTour = tours.find((tour) => tour.id === protocol?.tourId);

  const handleConfirm = () => {
    if (!tourId) {
      setError("Debes seleccionar el tour de la copia.");
      return;
    }
    setError(null);
    onConfirm(tourId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicar protocolo</DialogTitle>
          <DialogDescription>
            {protocol ? (
              <>
                Se creará una copia de «{protocol.title}»
                {currentTour
                  ? ` (tour actual: #${shortId(currentTour.id)} — ${currentTour.title})`
                  : ""}
                . Elige el tour de la copia.
              </>
            ) : (
              "Elige el tour de la copia."
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="duplicate-tour">Tour de la copia</Label>
          <Select
            value={tourId}
            onValueChange={(value) => {
              setTourId(value);
              setError(null);
            }}
          >
            <SelectTrigger
              id="duplicate-tour"
              className={error ? "border-red-500" : ""}
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
                <SelectItem key={tour.id} value={String(tour.id)}>
                  #{shortId(tour.id)} — {tour.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-xs text-red-600">{error}</p>}
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
          <Button type="button" onClick={handleConfirm} disabled={saving}>
            {saving ? "Duplicando…" : "Duplicar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
