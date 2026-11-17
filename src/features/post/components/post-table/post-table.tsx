"use client";

import toast from "react-hot-toast";
import useData from "@/hooks/use-data";
import { getColumns } from "./column";
import { deletePost } from "@/services/post-service";
import { DataTable } from "@/components/ui/table/data-table";

const PostList = () => {
  const { posts, setPosts } = useData(null, "posts");

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar esta noticia?"
    );
    if (!isConfirmed) return;

    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((post) => post.id !== id));
      toast.success("Noticia eliminada con éxito");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al eliminar la noticia");
    }
  };

  return (
    <DataTable
      columns={getColumns(handleDelete)}
      data={posts}
      placeholder="Buscar por título..."
      filterColumn="title"
    />
  );
};

export default PostList;
