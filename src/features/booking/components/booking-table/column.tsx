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
import {
  Departure,
  formatDepartureDateTime,
} from "@/services/departure-service";
import { Tour } from "@/services/tour-service";
import {
  formatPrice,
  getPaymentInfo,
  PAYMENT_BADGE_CLASSES,
  paymentBadgeText,
} from "../../lib/payment";
import moment from "moment";
import "moment/locale/es";

export { formatPrice };

type BookingAction = (booking: Booking) => void;
type DeleteBookingFunction = (id: string) => void;

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  cancelled: "Cancelada",
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100",
  paid: "border-transparent bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  cancelled: "border-transparent bg-red-100 text-red-900 hover:bg-red-100",
};

export const getColumns = (
  handleView: BookingAction,
  handleEdit: BookingAction,
  handleDelete: DeleteBookingFunction,
  canWrite = true,
  tours: Tour[] = [],
  departures: Departure[] = [],
): ColumnDef<Booking>[] => {
  const toursById = new Map(tours.map((tour) => [tour.id, tour]));
  const departuresById = new Map(
    departures.map((departure) => [departure.id, departure]),
  );

  return [
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
          <div className="max-w-45 truncate font-medium" title={tour.title}>
            {tour.title}
          </div>
        );
      },
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
      accessorKey: "departureId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Salida" />
      ),
      cell: ({ row }) => {
        if (!row.original.departureId) {
          return <span className="text-muted-foreground">—</span>;
        }
        const departure = departuresById.get(row.original.departureId);
        if (!departure) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <span className="whitespace-nowrap">
            {formatDepartureDateTime(departure)}
          </span>
        );
      },
    },
    {
      accessorKey: "totalPrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => {
        const info = getPaymentInfo(
          row.original,
          toursById.get(row.original.tourId),
          row.original.departureId
            ? departuresById.get(row.original.departureId)
            : undefined,
        );
        return (
          <div className="whitespace-nowrap">
            <span className="font-medium">
              {formatPrice(row.original.totalPrice)}
            </span>
            {info.expected !== null &&
            info.state !== "cancelled" &&
            info.state !== "complete" ? (
              <span className="text-muted-foreground">
                {" "}
                de {formatPrice(info.expected)}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "payment",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pago" />
      ),
      cell: ({ row }) => {
        const info = getPaymentInfo(
          row.original,
          toursById.get(row.original.tourId),
          row.original.departureId
            ? departuresById.get(row.original.departureId)
            : undefined,
        );
        return (
          <Badge className={PAYMENT_BADGE_CLASSES[info.state]}>
            {paymentBadgeText(info)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => (
        <Badge className={STATUS_STYLES[row.original.status]}>
          {STATUS_LABEL[row.original.status]}
        </Badge>
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
};
