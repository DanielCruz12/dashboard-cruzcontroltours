import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type StatCardTone = "default" | "success" | "warning" | "danger";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: StatCardTone;
};

const TONE_ICON: Record<StatCardTone, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-100 text-emerald-900",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-900",
};

const TONE_VALUE: Record<StatCardTone, string> = {
  default: "",
  success: "text-emerald-700",
  warning: "text-amber-700",
  danger: "text-red-700",
};

/** Tarjeta de resumen tipo dashboard: icono + etiqueta + valor + detalle. */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: StatCardProps) {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              TONE_ICON[tone],
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <p
          className={cn(
            "mt-3 text-2xl font-medium tracking-tight",
            TONE_VALUE[tone],
          )}
        >
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </Card>
  );
}
