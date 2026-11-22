"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { fetchResponses } from "@/lib/store/reviewFormsSlice";
import moment from "moment";
import "moment/locale/es";

const ALL = "all";

function Stars({ value, size = "h-3.5 w-3.5" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </span>
  );
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

const ResponsesTab = () => {
  const dispatch = useAppDispatch();
  const tours = useAppSelector((state) => state.tours.items);
  const toursStatus = useAppSelector((state) => state.tours.listStatus);
  const forms = useAppSelector((state) => state.reviewForms.items);
  const formsStatus = useAppSelector((state) => state.reviewForms.listStatus);
  const payload = useAppSelector((state) => state.reviewForms.responses);
  const listStatus = useAppSelector(
    (state) => state.reviewForms.responsesStatus,
  );
  const listError = useAppSelector(
    (state) => state.reviewForms.responsesError,
  );

  const [tourFilter, setTourFilter] = useState<string>(ALL);
  const [formFilter, setFormFilter] = useState<string>(ALL);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (toursStatus === "idle") dispatch(fetchTours());
    if (formsStatus === "idle") dispatch(fetchForms(undefined));
  }, [dispatch, toursStatus, formsStatus]);

  useEffect(() => {
    dispatch(
      fetchResponses({
        tourId: tourFilter === ALL ? undefined : Number(tourFilter),
        formId: formFilter === ALL ? undefined : Number(formFilter),
        page,
        limit: 20,
      }),
    );
  }, [dispatch, tourFilter, formFilter, page]);

  const visibleForms =
    tourFilter === ALL
      ? forms
      : forms.filter((form) => form.tourId === Number(tourFilter));

  const totalPages = payload
    ? Math.max(1, Math.ceil(payload.total / payload.limit))
    : 1;

  const overall = (() => {
    if (!payload) return null;
    let sum = 0;
    let count = 0;
    for (const average of payload.averages) {
      if (average.average === null) continue;
      sum += average.average * average.count;
      count += average.count;
    }
    if (count === 0) return null;
    return { average: sum / count, count };
  })();

  const reload = () =>
    dispatch(
      fetchResponses({
        tourId: tourFilter === ALL ? undefined : Number(tourFilter),
        formId: formFilter === ALL ? undefined : Number(formFilter),
        page,
        limit: 20,
      }),
    );

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="filter-tour">Tour</Label>
          <Select
            value={tourFilter}
            onValueChange={(value) => {
              setTourFilter(value);
              setFormFilter(ALL);
              setPage(1);
            }}
          >
            <SelectTrigger id="filter-tour">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los tours</SelectItem>
              {tours.map((tour) => (
                <SelectItem key={tour.id} value={String(tour.id)}>
                  {tour.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-form">Formulario</Label>
          <Select
            value={formFilter}
            onValueChange={(value) => {
              setFormFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger id="filter-form">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los formularios</SelectItem>
              {visibleForms.map((form) => (
                <SelectItem key={form.id} value={String(form.id)}>
                  {form.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumen */}
      {payload && payload.total > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Reseñas
            </p>
            <p className="mt-1 text-2xl font-bold">{payload.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Promedio general
            </p>
            {overall ? (
              <p className="mt-1 flex items-center gap-2">
                <Stars value={Math.round(overall.average)} />
                <span className="text-2xl font-bold">
                  {overall.average.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({overall.count})
                </span>
              </p>
            ) : (
              <p className="mt-1 text-2xl font-bold text-muted-foreground">—</p>
            )}
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Por pregunta
            </p>
            {payload.averages.length === 0 ? (
              <p className="mt-1 text-2xl font-bold text-muted-foreground">—</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {payload.averages.map((average) => (
                  <li
                    key={average.questionId}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate text-muted-foreground">
                      {average.questionLabel}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <Stars value={Math.round(average.average ?? 0)} />
                      <span className="font-bold">
                        {average.average === null
                          ? "—"
                          : average.average.toFixed(1)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {listStatus === "loading" || listStatus === "idle" ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Cargando respuestas…
        </p>
      ) : listStatus === "failed" ? (
        <div className="rounded-md border p-6 text-center">
          <p className="text-sm font-medium text-red-600">{listError}</p>
          <Button onClick={reload} className="mt-4">
            Reintentar
          </Button>
        </div>
      ) : !payload || payload.items.length === 0 ? (
        <p className="rounded-md border p-6 text-center text-sm text-muted-foreground">
          Aún no hay respuestas con estos filtros.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {payload.items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border bg-card p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold text-muted-foreground"
                    >
                      {item.authorName
                        ? initialsOf(item.authorName)
                        : "?"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {item.authorName || "Anónimo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {moment(item.createdAt).locale("es").format("LLL")}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                    <Badge variant="secondary">{item.tourTitle}</Badge>
                    <Badge variant="outline">{item.formTitle}</Badge>
                  </div>
                </div>
                <ul className="mt-4 space-y-3 border-t pt-4">
                  {item.answers.map((answer) => (
                    <li key={answer.id}>
                      <p className="text-sm font-medium">
                        {answer.questionLabel}
                      </p>
                      <div className="mt-1">
                        {answer.questionType === "stars" &&
                        answer.ratingValue !== null ? (
                          <Stars value={answer.ratingValue} />
                        ) : (
                          <p className="border-l-2 pl-3 text-sm italic text-muted-foreground">
                            {answer.textValue || "—"}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Página {payload.page} de {totalPages} · {payload.total} en total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResponsesTab;
