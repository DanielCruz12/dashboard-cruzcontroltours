import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
};

/** Tarjeta de resumen tipo dashboard: icono + etiqueta + valor + detalle. */
export function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" />
          </span>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <p className="mt-3 text-2xl font-medium tracking-tight">{value}</p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </Card>
  );
}
