"use client";

import moment from "moment";
import "moment/locale/es";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Modal genérico de "Ver detalle": sirve para CUALQUIER tabla del panel.
// Se le pasa la fila (`data`) y opcionalmente la config de campos (`fields`).
// Sin `fields`, deriva las filas de las claves del objeto.
export type ViewField = {
  key: string;
  label: string;
  /** Formato personalizado. Si no se da, se usa `defaultFormat`. */
  format?: (value: unknown) => React.ReactNode;
};

type ViewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  data: Record<string, unknown> | null;
  fields?: ViewField[];
  /** Claves a ocultar cuando `fields` no se da (p. ej. ["id"]). */
  hiddenKeys?: string[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function defaultFormat(key: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (
    typeof value === "string" &&
    (ISO_DATE.test(value) || key.toLowerCase().includes("date") || key.toLowerCase().includes("created"))
  ) {
    const m = moment(value);
    if (m.isValid()) return m.locale("es").format("LLL");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** "createdAt" -> "Created At" (etiqueta legible cuando no hay `fields`). */
function prettyLabel(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function ViewDialog({
  open,
  onOpenChange,
  title,
  description,
  data,
  fields,
  hiddenKeys = [],
}: ViewDialogProps) {
  const rows: { label: string; content: React.ReactNode; key: string }[] = [];

  if (data) {
    if (fields) {
      for (const field of fields) {
        const value = data[field.key];
        rows.push({
          key: field.key,
          label: field.label,
          content: field.format
            ? field.format(value)
            : defaultFormat(field.key, value),
        });
      }
    } else {
      for (const key of Object.keys(data)) {
        if (hiddenKeys.includes(key)) continue;
        rows.push({
          key,
          label: prettyLabel(key),
          content: defaultFormat(key, data[key]),
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <dl className="divide-y divide-border rounded-md border">
          {rows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-3 gap-4 px-4 py-3 text-sm"
            >
              <dt className="font-medium text-muted-foreground">{row.label}</dt>
              <dd className="col-span-2 break-words">{row.content}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
