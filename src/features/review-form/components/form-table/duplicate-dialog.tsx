"use client";

import { useEffect, useState } from "react";
import axios from "axios";
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
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchTours } from "@/lib/store/toursSlice";
import { fetchForms } from "@/lib/store/reviewFormsSlice";
import {
  copyText,
  duplicateForm,
  reviewLinkFor,
  ReviewFormListItem,
} from "@/services/review-form-service";
import { toErrorMessage } from "@/lib/api-client";

type DuplicateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ReviewFormListItem | null;
};

export function DuplicateDialog({
  open,
  onOpenChange,
  form,
}: DuplicateDialogProps) {
  const dispatch = useAppDispatch();
  const tours = useAppSelector((state) => state.tours.items);
  const toursStatus = useAppSelector((state) => state.tours.listStatus);

  const [tourId, setTourId] = useState("");
  const [title, setTitle] = useState(
    form ? `Copia de ${form.title}` : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (toursStatus === "idle") dispatch(fetchTours());
  }, [dispatch, toursStatus]);

  if (!form) return null;

  const runDuplicate = async (deactivateExisting: boolean) => {
    if (!tourId) {
      setError("Elige el tour destino.");
      return;
    }
    if (!title.trim()) {
      setError("El título es requerido.");
      return;
    }
    setError(null);
    setWorking(true);
    try {
      const created = await duplicateForm(form.id, {
        tourId: tourId,
        title: title.trim(),
        deactivateExisting,
      });
      setConflict(null);
      setNewToken(created.token);
      dispatch(fetchForms(undefined));
      toast.success("Formulario duplicado");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        const existing = (
          err.response.data as {
            existingForm?: { title?: string };
          }
        ).existingForm;
        setConflict(
          existing?.title
            ? `Ese tour ya tiene un formulario activo (“${existing.title}”).`
            : "Ese tour ya tiene un formulario activo.",
        );
      } else {
        toast.error(toErrorMessage(err));
      }
    } finally {
      setWorking(false);
    }
  };

  const handleCopy = async () => {
    if (!newToken) return;
    const ok = await copyText(reviewLinkFor(newToken));
    if (ok) toast.success("Link copiado");
    else toast.error("No se pudo copiar el link");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Duplicar formulario</DialogTitle>
          <DialogDescription>
            Se copian las preguntas (orden y tipo) a otro tour, con un link
            nuevo. Las respuestas no se copian.
          </DialogDescription>
        </DialogHeader>

        {newToken ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Listo. Este es el link del nuevo formulario:
            </p>
            <p className="break-all rounded-md bg-muted px-3 py-2 text-sm font-medium">
              {reviewLinkFor(newToken)}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
              <Button type="button" onClick={handleCopy}>
                Copiar link
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dup-tour">Tour destino</Label>
              <Select value={tourId} onValueChange={setTourId}>
                <SelectTrigger id="dup-tour">
                  <SelectValue placeholder="Elige un tour" />
                </SelectTrigger>
                <SelectContent>
                  {tours.map((tour) => (
                    <SelectItem key={tour.id} value={String(tour.id)}>
                      {tour.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dup-title">Título</Label>
              <Input
                id="dup-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={`Copia de ${form.title}`}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {conflict && (
              <div className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">{conflict}</p>
                <p className="text-sm text-amber-800">
                  ¿Desactivar el anterior y continuar?
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={working}
                    onClick={() => setConflict(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled={working}
                    onClick={() => runDuplicate(true)}
                  >
                    {working ? "Duplicando…" : "Desactivar y duplicar"}
                  </Button>
                </div>
              </div>
            )}

            {!conflict && (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={working}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={working}
                  onClick={() => runDuplicate(false)}
                >
                  {working ? "Duplicando…" : "Duplicar"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
