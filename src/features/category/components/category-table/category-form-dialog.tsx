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
import { createCategory, updateCategory } from "@/lib/store/categoriesSlice";
import { Category } from "@/services/category-service";
import { toErrorMessage } from "@/lib/api-client";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type FieldErrors = {
  name?: string;
  slug?: string;
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const dispatch = useAppDispatch();
  const saveStatus = useAppSelector((state) => state.categories.saveStatus);
  const saveError = useAppSelector((state) => state.categories.saveError);

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [active, setActive] = useState(
    category ? String(category.active) : "true",
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const saving = saveStatus === "loading";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: FieldErrors = {};
    if (!name.trim()) next.name = "El nombre es requerido.";
    if (!slug.trim()) {
      next.slug = "El slug es requerido.";
    } else if (!SLUG_RE.test(slug.trim())) {
      next.slug = "Solo minúsculas, números y guiones (p. ej. mi-slug).";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const input = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      active: active === "true",
    };

    try {
      if (category) {
        await dispatch(updateCategory({ id: category.id, input })).unwrap();
        toast.success("Categoría actualizada con éxito");
      } else {
        await dispatch(createCategory(input)).unwrap();
        toast.success("Categoría creada con éxito");
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
            {category ? "Editar categoría" : "Crear categoría"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Modifica los datos de la categoría y guarda los cambios."
              : "Completa los datos de la nueva categoría."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="p. ej. Aventura"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category-slug">Slug</Label>
            <Input
              id="category-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="p. ej. aventura"
              className={errors.slug ? "border-red-500" : ""}
            />
            {errors.slug && (
              <p className="text-xs text-red-600">{errors.slug}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category-description">Descripción (opcional)</Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Qué agrupa esta categoría…"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category-active">Estado</Label>
            <Select value={active} onValueChange={setActive}>
              <SelectTrigger id="category-active">
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
