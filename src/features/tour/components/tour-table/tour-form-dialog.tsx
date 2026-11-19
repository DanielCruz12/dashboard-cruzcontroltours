"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Category } from "@/services/category-service";
import { Tour } from "@/services/tour-service";
import { TourForm } from "./tour-form";

type TourFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Tour | null;
  categories: Category[];
};

export function TourFormDialog({
  open,
  onOpenChange,
  tour,
  categories,
}: TourFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tour ? "Editar tour" : "Crear tour"}</DialogTitle>
          <DialogDescription>
            {tour
              ? "Modifica los datos del tour y guarda los cambios."
              : "Completa los datos del nuevo tour."}
          </DialogDescription>
        </DialogHeader>
        <TourForm
          tour={tour}
          categories={categories}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
