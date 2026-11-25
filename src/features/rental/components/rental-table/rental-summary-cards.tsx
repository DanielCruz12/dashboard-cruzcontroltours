"use client";

import { useMemo } from "react";
import { CalendarDays, CircleCheck, Navigation, Truck } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import type { Rental } from "@/services/rental-service";

function todayKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Resumen tipo dashboard calculado desde los despachos cargados. */
export function RentalSummaryCards({ items }: { items: Rental[] }) {
  const stats = useMemo(() => {
    const today = todayKey();
    const todayItems = items.filter((item) => item.date === today);
    const enRoute = items.filter((item) => item.status === "en_route");
    const completed = items.filter((item) => item.status === "completed");
    const cancelled = items.filter((item) => item.status === "cancelled");
    const completedPct =
      items.length > 0
        ? Math.round((completed.length / items.length) * 100)
        : 0;
    return {
      today: todayItems.length,
      enRoute: enRoute.length,
      completed: completed.length,
      cancelled: cancelled.length,
      completedPct,
    };
  }, [items]);

  const todayLabel = new Date().toLocaleDateString("es", {
    day: "numeric",
    month: "long",
  });

  return (
    <div className="rise-group grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Truck}
        label="Total despachos"
        value={String(items.length)}
        hint={`${stats.completed} completados · ${stats.cancelled} cancelados`}
      />
      <StatCard
        icon={CalendarDays}
        label="Hoy"
        value={String(stats.today)}
        hint={`Programados para el ${todayLabel}`}
      />
      <StatCard
        icon={Navigation}
        label="En ruta"
        value={String(stats.enRoute)}
        hint="En curso ahora"
      />
      <StatCard
        icon={CircleCheck}
        label="Completados"
        value={String(stats.completed)}
        hint={`${stats.completedPct}% del total`}
      />
    </div>
  );
}
