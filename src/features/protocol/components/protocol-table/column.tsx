import { ColumnDef } from "@tanstack/react-table";
import { Copy, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column";
import { Protocol } from "@/services/protocol-service";
import { Tour } from "@/services/tour-service";
import { shortId } from "@/lib/utils";
import { htmlToText } from "@/lib/sanitize-html";

type ProtocolAction = (protocol: Protocol) => void;
type DeleteProtocolFunction = (id: string) => void;

export const getColumns = (
  handleView: ProtocolAction,
  handleEdit: ProtocolAction,
  handleDuplicate: ProtocolAction,
  handleDelete: DeleteProtocolFunction,
  canWrite = true,
  tours: Tour[] = []
): ColumnDef<Protocol>[] => {
  const toursById = new Map(tours.map((tour) => [tour.id, tour]));

  return [
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
    accessorKey: "tourId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tour" />
    ),
    cell: ({ row }) => {
      const tour = toursById.get(row.original.tourId);
      if (!tour) {
        return (
          <span
            className="text-muted-foreground"
            title={`Tour #${shortId(row.original.tourId)} (no encontrado)`}
          >
            Tour eliminado
          </span>
        );
      }
      return (
        <div className="max-w-45 truncate" title={tour.title}>
          {tour.title}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-2 max-w-md">
        {htmlToText(row.original.description) || "—"}
      </div>
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
            <Eye className="w-4 h-4" /> Ver protocolo
          </DropdownMenuItem>
          {canWrite && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleEdit(row.original)}
              >
                <Edit className="w-4 h-4" /> Editar protocolo
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleDuplicate(row.original)}
              >
                <Copy className="w-4 h-4" /> Duplicar protocolo
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleDelete(row.original.id)}
              >
                <Trash2 className="w-4 h-4" /> Borrar protocolo
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  ];
};
