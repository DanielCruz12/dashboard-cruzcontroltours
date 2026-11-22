import { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column";
import { shortId } from "@/lib/utils";
import { Review } from "@/services/review-service";
import moment from "moment";
import "moment/locale/es";

type DeleteReviewFunction = (id: string) => void;
type ViewReviewFunction = (review: Review) => void;

export const getColumns = (
  handleDelete: DeleteReviewFunction,
  handleView: ViewReviewFunction,
  canWrite = true
): ColumnDef<Review>[] => [
  {
    accessorKey: "tourId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tour" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">#{shortId(row.original.tourId)}</div>
    ),
  },
  {
    accessorKey: "userId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usuario" />
    ),
    cell: ({ row }) => (
      <span className="max-w-40 truncate">{row.original.userId}</span>
    ),
  },
  {
    accessorKey: "avgRating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Promedio" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {Number(row.original.avgRating).toFixed(2)} / 5
      </span>
    ),
  },
  {
    accessorKey: "comment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comentario" />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-2 max-w-md">
        {row.original.comment || "—"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creada" />
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
            <Eye className="w-4 h-4" /> Ver reseña
          </DropdownMenuItem>
          {canWrite && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="w-4 h-4" /> Borrar reseña
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
