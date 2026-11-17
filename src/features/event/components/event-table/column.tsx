"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import "moment/locale/es";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column";

interface Event {
  id: number;
  title: string;
  startDate: string;
  description: string;
  category?: string;
}

type DeleteEventFunction = (id: number) => void;

export const getColumns = (
  handleDelete: DeleteEventFunction
): ColumnDef<Event>[] => [
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de inicio" />
    ),
    cell: ({ row }) => (
      <span className="line-clamp-2 md:line-clamp-3">
        {moment(row.original.startDate).locale("es").format("LLL")}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Título" />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-2 md:line-clamp-3">{row.original.title}</div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-2 md:line-clamp-3">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
  },
  {
    id: "actions",
    accessorKey: "acciones",
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
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="w-4 h-4" /> Borrar evento
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => console.log(`Actualizar evento ${row.original.id}`)}
          >
            <Edit className="w-4 h-4" /> Actualizar evento
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
