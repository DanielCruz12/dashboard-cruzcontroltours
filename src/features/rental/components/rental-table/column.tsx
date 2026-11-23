import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column";
import { Rental, RentalStatus } from "@/services/rental-service";

type RentalAction = (rental: Rental) => void;

const STATUS_STYLES: Record<RentalStatus, string> = {
  pending: "border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100",
  paid: "border-transparent bg-blue-100 text-blue-900 hover:bg-blue-100",
  en_route:
    "border-transparent bg-violet-100 text-violet-900 hover:bg-violet-100",
  completed:
    "border-transparent bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  cancelled: "border-transparent bg-red-100 text-red-900 hover:bg-red-100",
};

export const STATUS_LABELS: Record<RentalStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  en_route: "En ruta",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const getColumns = (
  handleView: RentalAction,
  handleEdit: RentalAction,
): ColumnDef<Rental>[] => [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{row.original.date}</span>
    ),
  },
  {
    accessorKey: "time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {row.original.time.slice(0, 5)}
      </span>
    ),
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.customerName}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <Badge className={STATUS_STYLES[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "pickupPlace",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Recogida" />
    ),
    cell: ({ row }) => (
      <div className="max-w-45 truncate">{row.original.pickupPlace}</div>
    ),
  },
  {
    accessorKey: "destination",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Destino" />
    ),
    cell: ({ row }) => (
      <div className="max-w-45 truncate">{row.original.destination}</div>
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
            <Eye className="w-4 h-4" /> Ver despacho
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="w-4 h-4" /> Editar despacho
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
