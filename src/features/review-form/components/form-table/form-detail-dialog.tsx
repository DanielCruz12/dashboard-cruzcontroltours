"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReviewFormListItem } from "@/services/review-form-service";
import moment from "moment";
import "moment/locale/es";

type FormDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ReviewFormListItem | null;
};

export function FormDetailDialog({
  open,
  onOpenChange,
  form,
}: FormDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del formulario</DialogTitle>
          <DialogDescription>
            Información y preguntas del formulario de reseñas.
          </DialogDescription>
        </DialogHeader>
        {form && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Título</dt>
              <dd className="text-right font-medium">{form.title}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Tour</dt>
              <dd className="text-right font-medium">{form.tourTitle}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Estado</dt>
              <dd>
                {form.isActive ? (
                  <Badge variant="default">Activo</Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Respuestas</dt>
              <dd className="font-medium">{form.responsesCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Creado</dt>
              <dd className="font-medium">
                {moment(form.createdAt).locale("es").format("LLL")}
              </dd>
            </div>
            <div className="border-t pt-3">
              <dt className="mb-2 text-muted-foreground">
                Preguntas ({form.questions.length})
              </dt>
              {form.questions.length === 0 ? (
                <p className="text-muted-foreground">—</p>
              ) : (
                <ol className="space-y-2">
                  {form.questions.map((question, index) => (
                    <li
                      key={question.id}
                      className={`rounded-lg border p-3 ${
                        question.isActive ? "" : "opacity-50"
                      }`}
                    >
                      <p className="font-medium">
                        {index + 1}. {question.label}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge variant="outline">
                          {question.type === "stars"
                            ? "Estrellas 1-5"
                            : "Texto libre"}
                        </Badge>
                        {question.required && (
                          <Badge variant="outline">Obligatoria</Badge>
                        )}
                        {!question.isActive && (
                          <Badge variant="secondary">Inactiva</Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </dl>
        )}
      </DialogContent>
    </Dialog>
  );
}
