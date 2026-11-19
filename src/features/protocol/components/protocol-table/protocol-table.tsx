"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { getColumns } from "./column";
import { ProtocolFormDialog } from "./protocol-form-dialog";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ViewDialog, ViewField } from "@/components/view-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchProtocols,
  removeProtocol,
  resetSave,
} from "@/lib/store/protocolsSlice";
import { fetchTours } from "@/lib/store/toursSlice";
import { Protocol } from "@/services/protocol-service";
import { toErrorMessage } from "@/lib/api-client";

const protocolFields: ViewField[] = [
  { key: "id", label: "ID" },
  { key: "tourId", label: "Tour (ID)" },
  { key: "title", label: "Título" },
  { key: "description", label: "Descripción" },
];

const ProtocolList = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.protocols.items);
  const listStatus = useAppSelector((state) => state.protocols.listStatus);
  const listError = useAppSelector((state) => state.protocols.listError);
  const tours = useAppSelector((state) => state.tours.items);
  const toursStatus = useAppSelector((state) => state.tours.listStatus);

  const [selected, setSelected] = useState<Protocol | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Protocol | null>(null);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchProtocols());
    }
    if (toursStatus === "idle") {
      dispatch(fetchTours());
    }
  }, [dispatch, listStatus, toursStatus]);

  const openCreate = () => {
    dispatch(resetSave());
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (protocol: Protocol) => {
    dispatch(resetSave());
    setEditing(protocol);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este protocolo?",
    );
    if (!isConfirmed) return;

    try {
      await dispatch(removeProtocol(id)).unwrap();
      toast.success("Protocolo eliminado con éxito");
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  if (listStatus === "loading" || listStatus === "idle") {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Cargando protocolos…
      </p>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm font-medium text-red-600">{listError}</p>
        <Button onClick={() => dispatch(fetchProtocols())} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Crear protocolo
        </Button>
      </div>
      <DataTable
        placeholder="Buscar por título..."
        columns={getColumns(setSelected, openEdit, handleDelete)}
        filterColumn="title"
        data={items}
      />
      <ViewDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Detalle del protocolo"
        description="Información completa del protocolo."
        data={selected}
        fields={protocolFields}
      />
      <ProtocolFormDialog
        key={`${editing?.id ?? "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        protocol={editing}
        tours={tours}
      />
    </>
  );
};

export default ProtocolList;
