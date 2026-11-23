"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { createPost, updatePost } from "@/lib/store/postsSlice";
import { Post } from "@/services/post-service";
import { uploadFiles } from "@/services/upload-service";
import { toErrorMessage } from "@/lib/api-client";

type PostFormProps = {
  post: Post | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type FieldErrors = {
  title?: string;
};

export function PostForm({ post, onSuccess, onCancel }: PostFormProps) {
  const dispatch = useAppDispatch();
  const saveStatus = useAppSelector((state) => state.posts.saveStatus);
  const saveError = useAppSelector((state) => state.posts.saveError);

  const [title, setTitle] = useState(post?.title ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [published, setPublished] = useState(post ? post.published : true);
  const [keptCover, setKeptCover] = useState<string | null>(
    post?.coverImage ?? null,
  );
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [uploading, setUploading] = useState(false);

  const saving = saveStatus === "loading" || uploading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: FieldErrors = {};
    if (!title.trim()) next.title = "El título es requerido.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setUploading(true);
    try {
      const uploaded =
        newCoverFile !== null ? await uploadFiles([newCoverFile]) : [];

      const input = {
        title: title.trim(),
        category: category.trim() ? category.trim() : null,
        excerpt: excerpt.trim() ? excerpt.trim() : null,
        coverImage:
          uploaded.length > 0 ? uploaded[0].url : (keptCover ?? null),
        content: content.trim() ? content : null,
        published,
      };

      if (post) {
        await dispatch(updatePost({ id: post.id, input })).unwrap();
        toast.success("Artículo actualizado con éxito");
      } else {
        await dispatch(createPost(input)).unwrap();
        toast.success("Artículo creado con éxito");
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
        <Label htmlFor="post-title">Título</Label>
        <Input
          id="post-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="p. ej. Guía para subir el volcán de Santa Ana"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-xs text-red-600">{errors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-category">Categoría (opcional)</Label>
        <Input
          id="post-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="p. ej. Volcanes, Playas, Consejos"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-excerpt">Resumen (opcional)</Label>
        <Textarea
          id="post-excerpt"
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          placeholder="Una o dos líneas que inviten a leer el artículo…"
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-cover">Imagen de portada (opcional)</Label>
        {keptCover !== null && newCoverFile === null && (
          <div className="flex items-center gap-3 rounded-md border p-2">
            <img
              src={keptCover}
              alt=""
              className="size-12 shrink-0 rounded object-cover"
            />
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {keptCover}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              aria-label="Quitar portada"
              onClick={() => setKeptCover(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {newCoverFile !== null && (
          <div className="flex items-center gap-3 rounded-md border border-dashed p-2">
            <span className="min-w-0 flex-1 truncate text-xs">
              {newCoverFile.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              aria-label="Quitar archivo"
              onClick={() => setNewCoverFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Input
          id="post-cover"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            if (file) setNewCoverFile(file);
            event.target.value = "";
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-content">Contenido (opcional)</Label>
        <RichTextEditor
          id="post-content"
          value={content}
          onChange={setContent}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border px-4 py-3">
        <Label htmlFor="post-published">Publicado</Label>
        <Switch
          id="post-published"
          ariaLabel="Artículo publicado"
          checked={published}
          onCheckedChange={setPublished}
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
            ? "Subiendo imagen…"
            : saveStatus === "loading"
              ? "Guardando…"
              : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
