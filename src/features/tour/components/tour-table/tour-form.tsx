"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { createTour, updateTour } from "@/lib/store/toursSlice";
import { Category } from "@/services/category-service";
import { Tour } from "@/services/tour-service";
import { uploadFiles } from "@/services/upload-service";
import { toErrorMessage } from "@/lib/api-client";

type TourFormProps = {
  tour: Tour | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
};

const PRICE_RE = /^\d+(\.\d{1,2})?$/;

type FieldErrors = {
  title?: string;
  price?: string;
  durationDays?: string;
};

function toLines(values: string[]): string {
  return values.join("\n");
}

function fromLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TourForm({ tour, categories, onSuccess, onCancel }: TourFormProps) {
  const dispatch = useAppDispatch();
  const saveStatus = useAppSelector((state) => state.tours.saveStatus);
  const saveError = useAppSelector((state) => state.tours.saveError);

  const [title, setTitle] = useState(tour?.title ?? "");
  const [description, setDescription] = useState(tour?.description ?? "");
  const [price, setPrice] = useState(tour ? String(Number(tour.price)) : "");
  const [durationDays, setDurationDays] = useState(
    tour ? String(tour.durationDays) : "1",
  );
  const [active, setActive] = useState(tour ? tour.active : true);
  const [categoryId, setCategoryId] = useState(
    tour?.categoryId ? String(tour.categoryId) : "none",
  );
  const [keptImages, setKeptImages] = useState<string[]>(tour?.images ?? []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [keptVideos, setKeptVideos] = useState<string[]>(tour?.videos ?? []);
  const [newVideoFiles, setNewVideoFiles] = useState<File[]>([]);
  const [reviewCriteria, setReviewCriteria] = useState(
    toLines(tour?.reviewCriteria ?? []),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [uploading, setUploading] = useState(false);

  const saving = saveStatus === "loading" || uploading;

  const pickFiles = (
    event: React.ChangeEvent<HTMLInputElement>,
    add: (files: File[]) => void,
  ) => {
    add(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: FieldErrors = {};
    if (!title.trim()) next.title = "El título es requerido.";
    if (!price.trim()) {
      next.price = "El precio es requerido.";
    } else if (!PRICE_RE.test(price.trim()) || Number(price) <= 0) {
      next.price = "Precio inválido (número positivo, máx. 2 decimales).";
    }
    const days = Number(durationDays);
    if (!Number.isInteger(days) || days < 1) {
      next.durationDays = "La duración debe ser 1 día o más.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const category = categoryId === "none" ? null : Number(categoryId);

    setUploading(true);
    try {
      const [uploadedImages, uploadedVideos] = await Promise.all([
        newImageFiles.length > 0 ? uploadFiles(newImageFiles) : [],
        newVideoFiles.length > 0 ? uploadFiles(newVideoFiles) : [],
      ]);

      const input = {
        title: title.trim(),
        description: description.trim() || undefined,
        price: price.trim(),
        durationDays: days,
        active,
        categoryId: category,
        images: [...keptImages, ...uploadedImages.map((file) => file.url)],
        videos: [...keptVideos, ...uploadedVideos.map((file) => file.url)],
        reviewCriteria: fromLines(reviewCriteria),
      };

      if (tour) {
        await dispatch(updateTour({ id: tour.id, input })).unwrap();
        toast.success("Tour actualizado con éxito");
      } else {
        await dispatch(createTour(input)).unwrap();
        toast.success("Tour creado con éxito");
      }
      onSuccess();
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tour-title">Título</Label>
        <Input
          id="tour-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="p. ej. Ruta de las Flores"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-xs text-red-600">{errors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tour-description">Descripción (opcional)</Label>
        <Textarea
          id="tour-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Qué incluye, a dónde van…"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="tour-price">Precio (USD)</Label>
          <Input
            id="tour-price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="120.00"
            inputMode="decimal"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-xs text-red-600">{errors.price}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tour-duration">Duración (días)</Label>
          <Input
            id="tour-duration"
            type="number"
            min={1}
            step={1}
            value={durationDays}
            onChange={(event) => setDurationDays(event.target.value)}
            className={errors.durationDays ? "border-red-500" : ""}
          />
          {errors.durationDays && (
            <p className="text-xs text-red-600">{errors.durationDays}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tour-category">Categoría (opcional)</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger id="tour-category">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ninguna</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tour-images">Imágenes</Label>
        {keptImages.length > 0 && (
          <ul className="space-y-2">
            {keptImages.map((url) => (
              <li
                key={url}
                className="flex items-center gap-3 rounded-md border p-2"
              >
                <img
                  src={url}
                  alt=""
                  className="size-12 shrink-0 rounded object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {url}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label="Quitar imagen"
                  onClick={() =>
                    setKeptImages((prev) => prev.filter((item) => item !== url))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {newImageFiles.length > 0 && (
          <ul className="space-y-2">
            {newImageFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-md border border-dashed p-2"
              >
                <span className="min-w-0 flex-1 truncate text-xs">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label="Quitar archivo"
                  onClick={() =>
                    setNewImageFiles((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Input
          id="tour-images"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) =>
            pickFiles(event, (files) =>
              setNewImageFiles((prev) => [...prev, ...files]),
            )
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tour-videos">Videos</Label>
        {keptVideos.length > 0 && (
          <ul className="space-y-2">
            {keptVideos.map((url) => (
              <li
                key={url}
                className="flex items-center gap-3 rounded-md border p-2"
              >
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {url}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label="Quitar video"
                  onClick={() =>
                    setKeptVideos((prev) => prev.filter((item) => item !== url))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {newVideoFiles.length > 0 && (
          <ul className="space-y-2">
            {newVideoFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-md border border-dashed p-2"
              >
                <span className="min-w-0 flex-1 truncate text-xs">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label="Quitar archivo"
                  onClick={() =>
                    setNewVideoFiles((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Input
          id="tour-videos"
          type="file"
          accept="video/*"
          multiple
          onChange={(event) =>
            pickFiles(event, (files) =>
              setNewVideoFiles((prev) => [...prev, ...files]),
            )
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tour-criteria">
          Criterios de reseña (uno por línea)
        </Label>
        <Textarea
          id="tour-criteria"
          value={reviewCriteria}
          onChange={(event) => setReviewCriteria(event.target.value)}
          placeholder="Guía&#10;Transporte&#10;Comida"
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border px-4 py-3">
        <Label htmlFor="tour-active">Activo</Label>
        <Switch
          id="tour-active"
          ariaLabel="Tour activo"
          checked={active}
          onCheckedChange={setActive}
        />
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
          {uploading
            ? "Subiendo archivos…"
            : saveStatus === "loading"
              ? "Guardando…"
              : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
