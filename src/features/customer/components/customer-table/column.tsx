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
import { Customer } from "@/services/customer-service";
import moment from "moment";
import "moment/locale/es";

type DeleteCustomerFunction = (id: string) => void;
type ViewCustomerFunction = (customer: Customer) => void;

export const getColumns = (
  handleDelete: DeleteCustomerFunction,
  handleView: ViewCustomerFunction,
  canWrite = true
): ColumnDef<Customer>[] => [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.nombre}</div>
    ),
  },
  {
    accessorKey: "telefono",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teléfono" />
    ),
  },
  {
    accessorKey: "telefonoSecundario",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tel. secundario" />
    ),
    cell: ({ row }) => <span>{row.original.telefonoSecundario || "—"}</span>,
  },
  {
    accessorKey: "fechaNacimiento",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nacimiento" />
    ),
    cell: ({ row }) => {
      const value = row.original.fechaNacimiento;
      if (!value) return <span>—</span>;
      const parsed = moment(value, "YYYY-MM-DD", true);
      return (
        <span className="whitespace-nowrap">
          {parsed.isValid()
            ? parsed.locale("es").format("L")
            : row.original.fechaNacimiento}
        </span>
      );
    },
  },
  {
    accessorKey: "correo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Correo" />
    ),
  },
  {
    accessorKey: "mensaje",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mensaje" />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-2 md:line-clamp-3 max-w-md">
        {row.original.mensaje || "—"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Recibido" />
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
            <Eye className="w-4 h-4" /> Ver cliente
          </DropdownMenuItem>
          {canWrite && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="w-4 h-4" /> Borrar cliente
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
