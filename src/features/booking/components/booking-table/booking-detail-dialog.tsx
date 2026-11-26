"use client";

import moment from "moment";
import "moment/locale/es";
import {
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  PaymentState,
} from "../../lib/payment";

type BookingDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  tours: Tour[];
  departures: Departure[];
};

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

const PAYMENT_HEADLINE: Record<
  PaymentState,
  { icon: typeof CheckCircle2; text: string; className: string; bar: string }
> = {
  complete: {
    icon: CheckCircle2,
    text: "Pago completo",
    className: "text-emerald-700",
    bar: "bg-emerald-500",
  },
  incomplete: {
    icon: AlertTriangle,
    text: "Pago incompleto",
    className: "text-amber-700",
    bar: "bg-amber-500",
  },
  overpaid: {
    icon: TrendingUp,
    text: "Pagó de más",
    className: "text-blue-700",
    bar: "bg-blue-500",
  },
  "no-tour": {
    icon: MinusCircle,
    text: "Sin precio de referencia",
    className: "text-muted-foreground",
    bar: "bg-muted-foreground",
  },
  cancelled: {
    icon: MinusCircle,
    text: "Reserva cancelada",
    className: "text-muted-foreground",
    bar: "bg-muted-foreground",
  },
};

export function BookingDetailDialog({
  open,
  onOpenChange,
  booking,
  tours,
  departures,
}: BookingDetailDialogProps) {
  if (!booking) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const tour = tours.find((item) => item.id === booking.tourId);
  const departure = booking.departureId
    ? departures.find((item) => item.id === booking.departureId)
    : undefined;
  const info = getPaymentInfo(booking, tour, departure);
  const headline = PAYMENT_HEADLINE[info.state];
  const HeadlineIcon = headline.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reserva de {tour ? tour.title : "tour eliminado"}</DialogTitle>
          <DialogDescription>
            {booking.userId} · {booking.guests}{" "}
            {booking.guests === 1 ? "persona" : "personas"}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <HeadlineIcon className={`h-5 w-5 ${headline.className}`} />
            <p className={`text-base font-semibold ${headline.className}`}>
              {headline.text}
              {info.state === "incomplete"
                ? ` · faltan ${formatPrice(info.missing)}`
                : null}
              {info.state === "overpaid"
                ? ` · ${formatPrice(info.extra)} de más`
                : null}
            </p>
          </div>

          {info.expected !== null ? (
            <div className="space-y-2 px-4 py-3">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${headline.bar}`}
                  style={{ width: `${info.percent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPrice(info.registered)} registrados de{" "}
                {formatPrice(info.expected)} esperados
              </p>
            </div>
          ) : null}

          <dl className="divide-y divide-border border-t">
            <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
              <dt className="font-medium text-muted-foreground">Tour</dt>
              <dd className="col-span-2">
                {tour ? (
                  <>
                    {tour.title}{" "}
                    <span className="text-muted-foreground">
                      ({formatPrice(tour.price)} por persona)
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    Eliminado (#{shortId(booking.tourId)})
                  </span>
                )}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
              <dt className="font-medium text-muted-foreground">Salida</dt>
              <dd className="col-span-2">
                {departure ? (
                  formatDepartureDateTime(departure)
                ) : (
                  <span className="text-muted-foreground">Sin asignar</span>
                )}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
              <dt className="font-medium text-muted-foreground">Esperado</dt>
              <dd className="col-span-2">
                {info.expected !== null && info.unitPrice !== null ? (
                  <>
                    {formatPrice(info.expected)}{" "}
                    <span className="text-muted-foreground">
                      ({formatPrice(info.unitPrice)} × {booking.guests}{" "}
                      {booking.guests === 1 ? "persona" : "personas"}
                      {info.fromDeparture ? " · precio de la salida" : ""})
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    No se puede calcular: el tour ya no existe.
                  </span>
                )}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
              <dt className="font-medium text-muted-foreground">Registrado</dt>
              <dd className="col-span-2 font-medium">
                {formatPrice(info.registered)}
              </dd>
            </div>
            {info.state === "incomplete" ? (
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <dt className="font-medium text-muted-foreground">Faltan</dt>
                <dd className="col-span-2 font-semibold text-amber-700">
                  {formatPrice(info.missing)}
                </dd>
              </div>
            ) : null}
            {info.state === "overpaid" ? (
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <dt className="font-medium text-muted-foreground">De más</dt>
                <dd className="col-span-2 font-semibold text-blue-700">
                  {formatPrice(info.extra)}
                </dd>
              </div>
            ) : null}
            <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
              <dt className="font-medium text-muted-foreground">Estado</dt>
              <dd className="col-span-2">
                <Badge className={STATUS_STYLES[booking.status]}>
                  {STATUS_LABEL[booking.status]}
                </Badge>
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
              <dt className="font-medium text-muted-foreground">Creada</dt>
              <dd className="col-span-2">
                {moment(booking.createdAt).locale("es").format("LLL")}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
              <dt className="font-medium text-muted-foreground">ID</dt>
              <dd className="col-span-2 break-all font-mono text-xs">
                {booking.id}
              </dd>
            </div>
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
