"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { getColumns } from "./column";
import { ProtocolDuplicateDialog } from "./protocol-duplicate-dialog";
import { useSession } from "@/lib/session";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  createProtocol,
  fetchProtocols,
  removeProtocol,
} from "@/lib/store/protocolsSlice";
import { fetchTours } from "@/lib/store/toursSlice";
import { Protocol } from "@/services/protocol-service";
import { toErrorMessage } from "@/lib/api-client";

const ProtocolList = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { canWrite } = useSession();
  const items = useAppSelector((state) => state.protocols.items);
  const listStatus = useAppSelector((state) => state.protocols.listStatus);
  const listError = useAppSelector((state) => state.protocols.listError);
  const saveStatus = useAppSelector((state) => state.protocols.saveStatus);
  const tours = useAppSelector((state) => state.tours.items);
  const toursStatus = useAppSelector((state) => state.tours.listStatus);

  const [duplicateTarget, setDuplicateTarget] = useState<Protocol | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchProtocols());
    }
    if (toursStatus === "idle") {
      dispatch(fetchTours());
    }
  }, [dispatch, listStatus, toursStatus]);

  const openCreate = () => {
    router.push("/panel/protocolos/nuevo");
  };

  const openView = (protocol: Protocol) => {
    router.push(`/panel/protocolos/${protocol.id}`);
  };

  const openEdit = (protocol: Protocol) => {
    router.push(`/panel/protocolos/${protocol.id}/editar`);
  };

  const handleDuplicate = (protocol: Protocol) => {
    setDuplicateTarget(protocol);
  };

  const handleConfirmDuplicate = async (tourId: string) => {
    if (!duplicateTarget) return;
    try {
      await dispatch(
        createProtocol({
          tourId,
          title: `${duplicateTarget.title} (copia)`,
          description: duplicateTarget.description,
        }),
      ).unwrap();
      toast.success("Protocolo duplicado con éxito");
      setDuplicateTarget(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await dispatch(removeProtocol(deleteId)).unwrap();
      toast.success("Protocolo eliminado con éxito");
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
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Crear protocolo
          </Button>
        )}
      </div>
      <DataTable
        placeholder="Buscar por título..."
        columns={getColumns(
          openView,
          openEdit,
          handleDuplicate,
          handleDelete,
          canWrite,
        )}
        filterColumn="title"
        data={items}
      />
      <ProtocolDuplicateDialog
        key={`${duplicateTarget?.id ?? "none"}-${duplicateTarget !== null}`}
        open={duplicateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDuplicateTarget(null);
        }}
        protocol={duplicateTarget}
        tours={tours}
        saving={saveStatus === "loading"}
        onConfirm={handleConfirmDuplicate}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Eliminar protocolo"
        description="¿Estás seguro de que deseas eliminar este protocolo? Esta acción no se puede deshacer."
        busy={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ProtocolList;
