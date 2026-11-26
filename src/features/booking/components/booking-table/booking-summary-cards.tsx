"use client";

import { useMemo } from "react";
import { Banknote, CalendarCheck, Clock, Wallet } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { formatPrice, summarizeDebt } from "../../lib/payment";
import type { Booking } from "@/services/booking-service";
import type { Departure } from "@/services/departure-service";
import type { Tour } from "@/services/tour-service";

type BookingSummaryCardsProps = {
  items: Booking[];
  tours: Tour[];
  departures?: Departure[];
};

/** Resumen tipo dashboard calculado desde las reservas cargadas. */
export function BookingSummaryCards({
  items,
  tours,
  departures = [],
}: BookingSummaryCardsProps) {
  const stats = useMemo(() => {
    const paid = items.filter((item) => item.status === "paid");
    const pending = items.filter((item) => item.status === "pending");
    const cancelled = items.filter((item) => item.status === "cancelled");
    const revenue = paid.reduce(
      (sum, item) => sum + (Number(item.totalPrice) || 0),
      0,
    );
    const pendingTotal = pending.reduce(
      (sum, item) => sum + (Number(item.totalPrice) || 0),
      0,
    );
    const debt = summarizeDebt(
      items,
      new Map(tours.map((tour) => [tour.id, tour])),
      new Map(departures.map((departure) => [departure.id, departure])),
    );
    return {
      paid: paid.length,
      pending: pending.length,
      cancelled: cancelled.length,
      revenue,
      pendingTotal,
      debt,
    };
  }, [items, tours, departures]);

  const debtHint =
    stats.debt.incompleteCount === 0
      ? "Todo completo, sin deudas"
      : `${stats.debt.incompleteCount} ${
          stats.debt.incompleteCount === 1
            ? "reserva incompleta"
            : "reservas incompletas"
        } · vs precio del tour`;

  return (
    <div className="rise-group grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={CalendarCheck}
        label="Total reservas"
        value={String(items.length)}
        hint={`${stats.paid} pagadas · ${stats.pending} pendientes · ${stats.cancelled} canceladas`}
      />
      <StatCard
        icon={Banknote}
        label="Ingresos cobrados"
        value={formatPrice(stats.revenue)}
        hint="Suma de reservas pagadas"
      />
      <StatCard
        icon={Wallet}
        label="Deben en total"
        value={formatPrice(stats.debt.total)}
        hint={debtHint}
        tone={stats.debt.total > 0 ? "danger" : "success"}
      />
      <StatCard
        icon={Clock}
        label="Pendientes de pago"
        value={String(stats.pending)}
        hint={`${formatPrice(stats.pendingTotal)} por cobrar`}
      />
    </div>
  );
}
