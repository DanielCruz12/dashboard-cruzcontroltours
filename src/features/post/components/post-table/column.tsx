import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column";
import { Post } from "@/services/post-service";
import moment from "moment";
import "moment/locale/es";

type PostAction = (post: Post) => void;
type DeletePostFunction = (id: string) => void;

export const getColumns = (
  handleView: PostAction,
  handleEdit: PostAction,
  handleDelete: DeletePostFunction,
  canWrite = true,
): ColumnDef<Post>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Título" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.title}</div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {row.original.category || "—"}
      </span>
    ),
  },
  {
    accessorKey: "published",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) =>
      row.original.published ? (
        <Badge variant="default">Publicado</Badge>
      ) : (
        <Badge variant="secondary">Borrador</Badge>
      ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {moment(row.original.createdAt).locale("es").format("LLL")}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
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
            onClick={() => handleView(row.original)}
          >
            <Eye className="w-4 h-4" /> Ver artículo
          </DropdownMenuItem>
          {canWrite && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleEdit(row.original)}
              >
                <Edit className="w-4 h-4" /> Editar artículo
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleDelete(row.original.id)}
              >
                <Trash2 className="w-4 h-4" /> Borrar artículo
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
