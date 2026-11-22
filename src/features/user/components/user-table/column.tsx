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
import { PanelUser } from "@/services/user-service";

type UserAction = (user: PanelUser) => void;
type DeleteUserFunction = (id: string) => void;

export const ROLE_LABELS: Record<PanelUser["role"], string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  host: "Host",
};

export const getColumns = (
  handleView: UserAction,
  handleEdit: UserAction,
  handleDelete: DeleteUserFunction,
): ColumnDef<PanelUser>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Correo" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rol" />
    ),
    cell: ({ row }) => (
      <Badge variant="default">{ROLE_LABELS[row.original.role]}</Badge>
    ),
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) =>
      row.original.active ? (
        <Badge variant="default">Activo</Badge>
      ) : (
        <Badge variant="secondary">Inactivo</Badge>
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
            <Eye className="w-4 h-4" /> Ver usuario
          </DropdownMenuItem>
          {row.original.role !== "superadmin" && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleEdit(row.original)}
              >
                <Edit className="w-4 h-4" /> Editar usuario
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleDelete(row.original.id)}
              >
                <Trash2 className="w-4 h-4" /> Borrar usuario
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
