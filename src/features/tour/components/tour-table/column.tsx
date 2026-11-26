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
import { Tour } from "@/services/tour-service";
import {
  Departure,
  formatDepartureDateTime,
} from "@/services/departure-service";
import moment from "moment";
import "moment/locale/es";

type TourAction = (tour: Tour) => void;
type DeleteTourFunction = (id: string) => void;

/** `price` llega como string (numeric de Postgres): "$120.00". */
export function formatPrice(price: string | number): string {
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : String(price);
}

export const getColumns = (
  handleView: TourAction,
  handleEdit: TourAction,
  handleDelete: DeleteTourFunction,
  canWrite = true,
  departures: Departure[] = []
): ColumnDef<Tour>[] => [
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
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{formatPrice(row.original.price)}</span>
    ),
  },
  {
    accessorKey: "durationDays",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duración" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {row.original.durationDays}{" "}
        {row.original.durationDays === 1 ? "día" : "días"}
      </span>
    ),
  },
  {
    id: "nextDeparture",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Próxima salida" />
    ),
    cell: ({ row }) => {
      const today = moment().format("YYYY-MM-DD");
      const upcoming = departures
        .filter(
          (item) =>
            item.tourId === row.original.id &&
            item.status === "open" &&
            item.startDate >= today,
        )
        .sort((a, b) =>
          a.startDate !== b.startDate
            ? a.startDate < b.startDate
              ? -1
              : 1
            : (a.startTime ?? "") < (b.startTime ?? "")
              ? -1
              : 1,
        )[0];
      if (!upcoming) {
        return <span className="text-muted-foreground">Sin fechas</span>;
      }
      return (
        <span className="whitespace-nowrap">
          {formatDepartureDateTime(upcoming)}
        </span>
      );
    },
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
            <Eye className="w-4 h-4" /> Ver tour
          </DropdownMenuItem>
          {canWrite && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleEdit(row.original)}
              >
                <Edit className="w-4 h-4" /> Editar tour
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleDelete(row.original.id)}
              >
                <Trash2 className="w-4 h-4" /> Borrar tour
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
