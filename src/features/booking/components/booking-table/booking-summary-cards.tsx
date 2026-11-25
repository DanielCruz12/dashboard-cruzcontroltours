"use client";

import { useMemo } from "react";
import { Banknote, CalendarCheck, Clock, Users } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { formatPrice } from "./column";
import type { Booking } from "@/services/booking-service";

/** Resumen tipo dashboard calculado desde las reservas cargadas. */
export function BookingSummaryCards({ items }: { items: Booking[] }) {
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
    const guests = items
      .filter((item) => item.status !== "cancelled")
      .reduce((sum, item) => sum + (item.guests || 0), 0);
    return {
      paid: paid.length,
      pending: pending.length,
      cancelled: cancelled.length,
      revenue,
      pendingTotal,
      guests,
    };
  }, [items]);

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
        icon={Users}
        label="Personas"
        value={String(stats.guests)}
        hint="Sin contar canceladas"
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
