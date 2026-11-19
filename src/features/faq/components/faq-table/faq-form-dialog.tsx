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
import { createFaq, updateFaq } from "@/lib/store/faqsSlice";
import { Faq } from "@/services/faq-service";
import { toErrorMessage } from "@/lib/api-client";

type FaqFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq: Faq | null;
};

type FieldErrors = {
  question?: string;
  answer?: string;
};

export function FaqFormDialog({
  open,
  onOpenChange,
  faq,
}: FaqFormDialogProps) {
  const dispatch = useAppDispatch();
  const saveStatus = useAppSelector((state) => state.faqs.saveStatus);
  const saveError = useAppSelector((state) => state.faqs.saveError);

  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [active, setActive] = useState(faq ? String(faq.active) : "true");
  const [errors, setErrors] = useState<FieldErrors>({});

  const saving = saveStatus === "loading";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: FieldErrors = {};
    if (!question.trim()) next.question = "La pregunta es requerida.";
    if (!answer.trim()) next.answer = "La respuesta es requerida.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const input = {
      question: question.trim(),
      answer: answer.trim(),
      active: active === "true",
    };

    try {
      if (faq) {
        await dispatch(updateFaq({ id: faq.id, input })).unwrap();
        toast.success("Pregunta actualizada con éxito");
      } else {
        await dispatch(createFaq(input)).unwrap();
        toast.success("Pregunta creada con éxito");
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
            {faq ? "Editar pregunta" : "Crear pregunta"}
          </DialogTitle>
          <DialogDescription>
            {faq
              ? "Modifica los datos de la pregunta y guarda los cambios."
              : "Completa los datos de la nueva pregunta."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="faq-question">Pregunta</Label>
            <Textarea
              id="faq-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="p. ej. ¿Cómo reservo un tour?"
              rows={2}
              className={errors.question ? "border-red-500" : ""}
            />
            {errors.question && (
              <p className="text-xs text-red-600">{errors.question}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="faq-answer">Respuesta</Label>
            <Textarea
              id="faq-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Respuesta que verá el cliente…"
              rows={4}
              className={errors.answer ? "border-red-500" : ""}
            />
            {errors.answer && (
              <p className="text-xs text-red-600">{errors.answer}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="faq-active">Estado</Label>
            <Select value={active} onValueChange={setActive}>
              <SelectTrigger id="faq-active">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
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
