"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchTours } from "@/lib/store/toursSlice";
import {
  createForm,
  fetchForms,
  updateForm,
} from "@/lib/store/reviewFormsSlice";
import {
  createQuestion,
  deleteQuestion,
  getForm,
  updateQuestion,
  type FormQuestion,
  type QuestionType,
} from "@/services/review-form-service";
import { toErrorMessage } from "@/lib/api-client";

type ReviewFormFormProps = {
  formId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type QuestionRow = {
  key: string;
  id: string | null;
  label: string;
  type: QuestionType;
  required: boolean;
  isActive: boolean;
};

let rowCounter = 0;
const nextKey = () => `row-${Date.now()}-${rowCounter++}`;

const blankRow = (): QuestionRow => ({
  key: nextKey(),
  id: null,
  label: "",
  type: "stars",
  required: false,
  isActive: true,
});

export function ReviewFormForm({
  formId,
  onSuccess,
  onCancel,
}: ReviewFormFormProps) {
  const dispatch = useAppDispatch();
  const tours = useAppSelector((state) => state.tours.items);
  const toursStatus = useAppSelector((state) => state.tours.listStatus);
  const saveStatus = useAppSelector((state) => state.reviewForms.saveStatus);
  const saveError = useAppSelector((state) => state.reviewForms.saveError);

  const [loading, setLoading] = useState(formId !== null);
  const [title, setTitle] = useState("");
  const [tourId, setTourId] = useState("");
  const [active, setActive] = useState(true);
  const [questions, setQuestions] = useState<QuestionRow[]>([blankRow()]);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [working, setWorking] = useState(false);

  const saving = saveStatus === "loading" || working;

  useEffect(() => {
    if (toursStatus === "idle") dispatch(fetchTours());
  }, [dispatch, toursStatus]);

  useEffect(() => {
    if (formId === null) return;
    let cancelled = false;
    setLoading(true);
    getForm(formId)
      .then((form) => {
        if (cancelled) return;
        setTitle(form.title);
        setTourId(String(form.tourId));
        setActive(form.isActive);
        setQuestions(
          form.questions.map((question: FormQuestion) => ({
            key: `id-${question.id}`,
            id: question.id,
            label: question.label,
            type: (question.type === "text" ? "text" : "stars") as QuestionType,
            required: question.required,
            isActive: question.isActive,
          })),
        );
        setOriginalIds(form.questions.map((q) => q.id));
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(toErrorMessage(error));
        onCancel();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const moveRow = (key: string, direction: -1 | 1) => {
    setQuestions((rows) => {
      const index = rows.findIndex((row) => row.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= rows.length) return rows;
      const next = [...rows];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const patchRow = (key: string, patch: Partial<QuestionRow>) => {
    setQuestions((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "El título es requerido.";
    if (!tourId) next.tourId = "Elige el tour.";
    if (questions.length === 0) next.questions = "Agrega al menos una pregunta.";
    for (const row of questions) {
      if (!row.label.trim()) next[row.key] = "Escribe la pregunta.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const ordered = questions.map((row, index) => ({ ...row, position: index }));
    setWorking(true);
    try {
      if (formId === null) {
        await dispatch(
          createForm({
            tourId: tourId,
            title: title.trim(),
            questions: ordered.map((row) => ({
              label: row.label.trim(),
              type: row.type,
              required: row.required,
              position: row.position,
              isActive: row.isActive,
            })),
          }),
        ).unwrap();
        toast.success("Formulario creado con éxito");
      } else {
        await dispatch(
          updateForm({
            id: formId,
            input: {
              title: title.trim(),
              tourId: tourId,
              isActive: active,
            },
          }),
        ).unwrap();
        // Diff de preguntas contra las originales.
        const currentIds = new Set(
          ordered.filter((row) => row.id !== null).map((row) => row.id as string),
        );
        for (const id of originalIds) {
          if (!currentIds.has(id)) await deleteQuestion(id);
        }
        for (const row of ordered) {
          if (row.id === null) {
            await createQuestion(formId, {
              label: row.label.trim(),
              type: row.type,
              required: row.required,
              position: row.position,
              isActive: row.isActive,
            });
          } else {
            await updateQuestion(row.id, {
              label: row.label.trim(),
              type: row.type,
              required: row.required,
              position: row.position,
              isActive: row.isActive,
            });
          }
        }
        toast.success("Formulario actualizado con éxito");
      }
      dispatch(fetchForms(undefined));
      onSuccess();
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Cargando formulario…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="form-title">Título</Label>
        <Input
          id="form-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="p. ej. Encuesta post-tour"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-xs text-red-600">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="form-tour">Tour</Label>
          <Select value={tourId} onValueChange={setTourId}>
            <SelectTrigger
              id="form-tour"
              className={errors.tourId ? "border-red-500" : ""}
            >
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
          {errors.tourId && (
            <p className="text-xs text-red-600">{errors.tourId}</p>
          )}
        </div>

        {formId !== null && (
          <div className="space-y-1.5">
            <Label htmlFor="form-active">Estado</Label>
            <Select
              value={String(active)}
              onValueChange={(value) => setActive(value === "true")}
            >
              <SelectTrigger id="form-active">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Preguntas</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setQuestions((rows) => [...rows, blankRow()])}
          >
            <Plus className="h-4 w-4" /> Agregar
          </Button>
        </div>
        {errors.questions && (
          <p className="text-xs text-red-600">{errors.questions}</p>
        )}
        {questions.map((row, index) => (
          <div key={row.key} className="space-y-3 rounded-lg border p-3">
            <div className="flex items-start gap-2">
              <span className="mt-2 w-6 shrink-0 text-center text-xs font-bold text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex-1 space-y-1.5">
                <Input
                  value={row.label}
                  onChange={(event) =>
                    patchRow(row.key, { label: event.target.value })
                  }
                  placeholder="p. ej. ¿Cómo calificarías el tour?"
                  className={errors[row.key] ? "border-red-500" : ""}
                />
                {errors[row.key] && (
                  <p className="text-xs text-red-600">{errors[row.key]}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Subir pregunta"
                  disabled={index === 0}
                  onClick={() => moveRow(row.key, -1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Bajar pregunta"
                  disabled={index === questions.length - 1}
                  onClick={() => moveRow(row.key, 1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-red-600 hover:text-red-700"
                aria-label="Quitar pregunta"
                onClick={() =>
                  setQuestions((rows) =>
                    rows.filter((item) => item.key !== row.key),
                  )
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pl-8">
              <Select
                value={row.type}
                onValueChange={(value) =>
                  patchRow(row.key, {
                    type: value as QuestionType,
                  })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stars">Estrellas (1-5)</SelectItem>
                  <SelectItem value="text">Texto libre</SelectItem>
                </SelectContent>
              </Select>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                <Switch
                  checked={row.required}
                  onCheckedChange={(checked) =>
                    patchRow(row.key, { required: checked })
                  }
                />
                Obligatoria
              </label>
              {row.id !== null && (
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                  <Switch
                    checked={row.isActive}
                    onCheckedChange={(checked) =>
                      patchRow(row.key, { isActive: checked })
                    }
                  />
                  Activa
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
