"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  Eye,
  Layers,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormDetailDialog } from "./form-detail-dialog";
import { DuplicateDialog } from "./duplicate-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchForms, removeForm, resetSave } from "@/lib/store/reviewFormsSlice";
import {
  copyText,
  reviewLinkFor,
  ReviewFormListItem,
} from "@/services/review-form-service";
import { useSession } from "@/lib/session";
import { toErrorMessage } from "@/lib/api-client";

const PAGE_SIZE = 10;

const FormList = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { canWrite } = useSession();
  const items = useAppSelector((state) => state.reviewForms.items);
  const listStatus = useAppSelector((state) => state.reviewForms.listStatus);
  const listError = useAppSelector((state) => state.reviewForms.listError);

  const [selected, setSelected] = useState<ReviewFormListItem | null>(null);
  const [duplicating, setDuplicating] = useState<ReviewFormListItem | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchForms(undefined));
    }
  }, [dispatch, listStatus]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.title.toLowerCase().includes(term));
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const openCreate = () => {
    dispatch(resetSave());
    router.push("/panel/formularios/nuevo");
  };

  const openEdit = (form: ReviewFormListItem) => {
    dispatch(resetSave());
    router.push(`/panel/formularios/${form.id}/editar`);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      const result = await dispatch(removeForm(deleteId)).unwrap();
      if (result.deleted) {
        toast.success("Formulario eliminado con éxito");
      } else {
        toast.success("Tenía respuestas: se desactivó en su lugar");
        dispatch(fetchForms(undefined));
      }
      setDeleteId(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = async (form: ReviewFormListItem) => {
    const ok = await copyText(reviewLinkFor(form.token));
    if (ok) toast.success("Link copiado");
    else toast.error("No se pudo copiar el link");
  };

  if (listStatus === "loading" || listStatus === "idle") {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Cargando formularios…
      </p>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm font-medium text-red-600">{listError}</p>
        <Button onClick={() => dispatch(fetchForms(undefined))} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar por título..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          className="max-w-sm"
        />
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Crear formulario
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tour</TableHead>
              <TableHead>Preguntas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>{form.id}</TableCell>
                  <TableCell className="font-medium">{form.title}</TableCell>
                  <TableCell className="max-w-52 truncate">
                    {form.tourTitle}
                  </TableCell>
                  <TableCell>
                    {form.questions.length === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <ul className="max-w-xs space-y-1">
                        {form.questions.slice(0, 3).map((question) => (
                          <li
                            key={question.id}
                            className="flex items-center gap-1.5 text-sm"
                          >
                            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                              {question.type === "stars" ? "★ 1-5" : "Texto"}
                            </span>
                            <span className="truncate">{question.label}</span>
                          </li>
                        ))}
                        {form.questions.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{form.questions.length - 3} más…
                          </li>
                        )}
                      </ul>
                    )}
                  </TableCell>
                  <TableCell>
                    {form.isActive ? (
                      <Badge variant="default">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">opciones</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setSelected(form)}
                        >
                          <Eye className="w-4 h-4" /> Ver formulario
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleCopyLink(form)}
                        >
                          <Copy className="w-4 h-4" /> Copiar link
                        </DropdownMenuItem>
                        {canWrite && (
                          <>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => openEdit(form)}
                            >
                              <Edit className="w-4 h-4" /> Editar formulario
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => setDuplicating(form)}
                            >
                              <Layers className="w-4 h-4" /> Duplicar formulario
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleDelete(form.id)}
                            >
                              <Trash2 className="w-4 h-4" /> Borrar formulario
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {items.length} formulario(s)
        </p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            Página {safePage + 1} de {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage <= 0}
            onClick={() => setPage((value) => value - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((value) => value + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <FormDetailDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        form={selected}
      />
      <DuplicateDialog
        key={`${duplicating?.id ?? "none"}-${duplicating !== null}`}
        open={duplicating !== null}
        onOpenChange={(open) => {
          if (!open) setDuplicating(null);
        }}
        form={duplicating}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Eliminar formulario"
        description="¿Estás seguro de que deseas eliminar este formulario? Si ya tiene respuestas, se desactivará en su lugar."
        busy={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default FormList;
