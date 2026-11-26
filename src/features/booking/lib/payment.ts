import type { Booking } from "@/services/booking-service";
import type { Departure } from "@/services/departure-service";
import type { Tour } from "@/services/tour-service";

/** `price` llega como string (numeric de Postgres): "$120.00". */
export function formatPrice(
  price: string | number | null | undefined,
): string {
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : "—";
}

/**
 * Estado del pago de una reserva, comparando lo registrado
 * contra lo esperado (precio del tour —o de la salida— × personas).
 */
export type PaymentState =
  | "cancelled"
  | "no-tour"
  | "complete"
  | "incomplete"
  | "overpaid";

export type PaymentInfo = {
  state: PaymentState;
  /** Precio unitario × personas. null si no hay tour de referencia. */
  expected: number | null;
  /** Total registrado en la reserva. */
  registered: number;
  /** Dinero que falta (> 0 solo si incompleta). */
  missing: number;
  /** Dinero de más (> 0 solo si excedente). */
  extra: number;
  /** % registrado vs esperado (0–100). */
  percent: number;
  /** Precio unitario usado (salida o tour). */
  unitPrice: number | null;
  /** true si el precio viene de la salida (precio especial). */
  fromDeparture: boolean;
};

const EPS = 0.005;
const round2 = (n: number) => Math.round(n * 100) / 100;

export function getPaymentInfo(
  booking: Pick<Booking, "guests" | "totalPrice" | "status">,
  tour?: Tour,
  departure?: Departure,
): PaymentInfo {
  const registered = round2(Number(booking.totalPrice) || 0);

  if (booking.status === "cancelled") {
    return {
      state: "cancelled",
      expected: null,
      registered,
      missing: 0,
      extra: 0,
      percent: 0,
      unitPrice: null,
      fromDeparture: false,
    };
  }

  let unitPrice: number | null = null;
  let fromDeparture = false;
  const override = departure?.priceOverride;
  if (
    override !== null &&
    override !== undefined &&
    String(override).trim() !== "" &&
    Number(override) > 0
  ) {
    unitPrice = Number(override);
    fromDeparture = true;
  } else if (tour) {
    const n = Number(tour.price);
    unitPrice = Number.isFinite(n) ? n : null;
  }

  if (unitPrice === null) {
    return {
      state: "no-tour",
      expected: null,
      registered,
      missing: 0,
      extra: 0,
      percent: 100,
      unitPrice: null,
      fromDeparture: false,
    };
  }

  const expected = round2(unitPrice * (booking.guests || 0));
  const diff = round2(expected - registered);
  const percent =
    expected > 0 ? Math.max(0, Math.min(100, (registered / expected) * 100)) : 0;

  if (diff > EPS) {
    return {
      state: "incomplete",
      expected,
      registered,
      missing: diff,
      extra: 0,
      percent,
      unitPrice,
      fromDeparture,
    };
  }
  if (diff < -EPS) {
    return {
      state: "overpaid",
      expected,
      registered,
      missing: 0,
      extra: round2(-diff),
      percent: 100,
      unitPrice,
      fromDeparture,
    };
  }
  return {
    state: "complete",
    expected,
    registered,
    missing: 0,
    extra: 0,
    percent: 100,
    unitPrice,
    fromDeparture,
  };
}

export const PAYMENT_BADGE_CLASSES: Record<PaymentState, string> = {
  cancelled:
    "border-transparent bg-muted text-muted-foreground hover:bg-muted",
  "no-tour": "border-transparent bg-muted text-muted-foreground hover:bg-muted",
  complete:
    "border-transparent bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  incomplete:
    "border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100",
  overpaid: "border-transparent bg-blue-100 text-blue-900 hover:bg-blue-100",
};

export function paymentBadgeText(info: PaymentInfo): string {
  switch (info.state) {
    case "cancelled":
      return "—";
    case "no-tour":
      return "Sin precio";
    case "complete":
      return "Completo";
    case "incomplete":
      return `Faltan ${formatPrice(info.missing)}`;
    case "overpaid":
      return `De más ${formatPrice(info.extra)}`;
  }
}

export type DebtSummary = {
  /** Suma de faltantes (sin canceladas). */
  total: number;
  incompleteCount: number;
  overpaidCount: number;
  withoutTour: number;
};

export function summarizeDebt(
  bookings: Pick<Booking, "guests" | "totalPrice" | "status" | "tourId" | "departureId">[],
  toursById: Map<string, Tour>,
  departuresById: Map<string, Departure>,
): DebtSummary {
  let total = 0;
  let incompleteCount = 0;
  let overpaidCount = 0;
  let withoutTour = 0;
  for (const booking of bookings) {
    const info = getPaymentInfo(
      booking,
      toursById.get(booking.tourId),
      booking.departureId
        ? departuresById.get(booking.departureId)
        : undefined,
    );
    if (info.state === "incomplete") {
      total = round2(total + info.missing);
      incompleteCount += 1;
    } else if (info.state === "overpaid") {
      overpaidCount += 1;
    } else if (info.state === "no-tour") {
      withoutTour += 1;
    }
  }
  return { total, incompleteCount, overpaidCount, withoutTour };
}
