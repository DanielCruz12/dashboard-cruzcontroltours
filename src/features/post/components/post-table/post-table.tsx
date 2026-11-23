"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { getColumns } from "./column";
import { useSession } from "@/lib/session";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchPosts, removePost } from "@/lib/store/postsSlice";
import { Post } from "@/services/post-service";
import { toErrorMessage } from "@/lib/api-client";

const PostList = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { canWrite } = useSession();
  const items = useAppSelector((state) => state.posts.items);
  const listStatus = useAppSelector((state) => state.posts.listStatus);
  const listError = useAppSelector((state) => state.posts.listError);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchPosts());
    }
  }, [dispatch, listStatus]);

  const openCreate = () => {
    router.push("/panel/blog/nuevo");
  };

  const openView = (post: Post) => {
    router.push(`/panel/blog/${post.id}`);
  };

  const openEdit = (post: Post) => {
    router.push(`/panel/blog/${post.id}/editar`);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await dispatch(removePost(deleteId)).unwrap();
      toast.success("Artículo eliminado con éxito");
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
        Cargando artículos…
      </p>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm font-medium text-red-600">{listError}</p>
        <Button onClick={() => dispatch(fetchPosts())} className="mt-4">
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
            <Plus className="h-4 w-4" /> Crear artículo
          </Button>
        )}
      </div>
      <DataTable
        placeholder="Buscar por título..."
        columns={getColumns(openView, openEdit, handleDelete, canWrite)}
        filterColumn="title"
        data={items}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Eliminar artículo"
        description="¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer."
        busy={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default PostList;
