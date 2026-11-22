"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { getColumns } from "./column";
import { useSession } from "@/lib/session";
import { FaqFormDialog } from "./faq-form-dialog";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ViewDialog, ViewField } from "@/components/view-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchFaqs, removeFaq, resetSave } from "@/lib/store/faqsSlice";
import { Faq } from "@/services/faq-service";
import { toErrorMessage } from "@/lib/api-client";

const faqFields: ViewField[] = [
  { key: "id", label: "ID" },
  { key: "question", label: "Pregunta" },
  { key: "answer", label: "Respuesta" },
  {
    key: "active",
    label: "Estado",
    format: (value) => (value ? "Activo" : "Inactivo"),
  },
];

const FaqList = () => {
  const dispatch = useAppDispatch();
  const { canWrite } = useSession();
  const items = useAppSelector((state) => state.faqs.items);
  const listStatus = useAppSelector((state) => state.faqs.listStatus);
  const listError = useAppSelector((state) => state.faqs.listError);

  const [selected, setSelected] = useState<Faq | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchFaqs());
    }
  }, [dispatch, listStatus]);

  const openCreate = () => {
    dispatch(resetSave());
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (faq: Faq) => {
    dispatch(resetSave());
    setEditing(faq);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await dispatch(removeFaq(deleteId)).unwrap();
      toast.success("Pregunta eliminada con éxito");
      setDeleteId(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  if (listStatus === "loading" || listStatus === "idle") {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Cargando preguntas…
      </p>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm font-medium text-red-600">{listError}</p>
        <Button onClick={() => dispatch(fetchFaqs())} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      {canWrite && (
        <div className="flex justify-end">
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Crear pregunta
          </Button>
        </div>
      )}
      <DataTable
        placeholder="Buscar por pregunta..."
        columns={getColumns(setSelected, openEdit, handleDelete, canWrite)}
        filterColumn="question"
        data={items}
      />
      <ViewDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Detalle de la pregunta"
        description="Información completa de la pregunta frecuente."
        data={selected}
        fields={faqFields}
      />
      <FaqFormDialog
        key={`${editing?.id ?? "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        faq={editing}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Eliminar pregunta"
        description="¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer."
        busy={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default FaqList;
