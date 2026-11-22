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
import { shortId } from "@/lib/utils";
import { Booking, BookingStatus } from "@/services/booking-service";
import moment from "moment";
import "moment/locale/es";

type BookingAction = (booking: Booking) => void;
type DeleteBookingFunction = (id: string) => void;

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  cancelled: "Cancelada",
};

export function formatPrice(price: string | number): string {
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : String(price);
}

export const getColumns = (
  handleView: BookingAction,
  handleEdit: BookingAction,
  handleDelete: DeleteBookingFunction,
  canWrite = true
): ColumnDef<Booking>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">#{shortId(row.original.id)}</div>
    ),
  },
  {
    accessorKey: "tourId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tour" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">#{shortId(row.original.tourId)}</span>
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
    accessorKey: "guests",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Personas" />
    ),
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatPrice(row.original.totalPrice)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) =>
      row.original.status === "paid" ? (
        <Badge variant="default">{STATUS_LABEL[row.original.status]}</Badge>
      ) : (
        <Badge variant="secondary">{STATUS_LABEL[row.original.status]}</Badge>
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
            <Eye className="w-4 h-4" /> Ver reserva
          </DropdownMenuItem>
          {canWrite && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleEdit(row.original)}
              >
                <Edit className="w-4 h-4" /> Editar reserva
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleDelete(row.original.id)}
              >
                <Trash2 className="w-4 h-4" /> Borrar reserva
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
