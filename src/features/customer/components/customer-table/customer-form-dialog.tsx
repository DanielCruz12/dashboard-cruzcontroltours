"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { createCustomer } from "@/lib/store/customersSlice";
import { toErrorMessage } from "@/lib/api-client";

type CustomerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FieldErrors = {
  nombre?: string;
  telefono?: string;
  telefonoSecundario?: string;
  fechaNacimiento?: string;
  correo?: string;
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateFechaNacimiento(value: string): string | null {
  if (!value) return null;
  if (!FECHA_RE.test(value)) return "Usa el formato AAAA-MM-DD.";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return "Fecha inválida.";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() > today.getTime())
    return "La fecha de nacimiento no puede ser futura.";
  return null;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
}: CustomerFormDialogProps) {
  const dispatch = useAppDispatch();
  const saveStatus = useAppSelector((state) => state.customers.saveStatus);
  const saveError = useAppSelector((state) => state.customers.saveError);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [telefonoSecundario, setTelefonoSecundario] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const saving = saveStatus === "loading";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: FieldErrors = {};
    if (!nombre.trim()) next.nombre = "El nombre es requerido.";
    if (!telefono.trim()) next.telefono = "El teléfono es requerido.";
    if (telefonoSecundario.trim().length > 50)
      next.telefonoSecundario = "Máximo 50 caracteres.";
    const fechaError = validateFechaNacimiento(fechaNacimiento);
    if (fechaError) next.fechaNacimiento = fechaError;
    if (!correo.trim()) {
      next.correo = "El correo es requerido.";
    } else if (!EMAIL_RE.test(correo.trim())) {
      next.correo = "Correo inválido.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      await dispatch(
        createCustomer({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          telefonoSecundario: telefonoSecundario.trim() || undefined,
          fechaNacimiento: fechaNacimiento || undefined,
          correo: correo.trim(),
          mensaje: mensaje.trim() || undefined,
        }),
      ).unwrap();
      toast.success("Cliente creado con éxito");
      onOpenChange(false);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear cliente</DialogTitle>
          <DialogDescription>
            Carga manual de un cliente (los del sitio llegan solos desde el
            formulario de contacto).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer-nombre">Nombre</Label>
            <Input
              id="customer-nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="p. ej. María Pérez"
              className={errors.nombre ? "border-red-500" : ""}
            />
            {errors.nombre && (
              <p className="text-xs text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customer-telefono">Teléfono</Label>
              <Input
                id="customer-telefono"
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                placeholder="p. ej. +503 7000 0000"
                className={errors.telefono ? "border-red-500" : ""}
              />
              {errors.telefono && (
                <p className="text-xs text-red-600">{errors.telefono}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer-telefono-secundario">
                Teléfono secundario (opcional)
              </Label>
              <Input
                id="customer-telefono-secundario"
                value={telefonoSecundario}
                onChange={(event) =>
                  setTelefonoSecundario(event.target.value)
                }
                placeholder="p. ej. +503 7000 0001"
                className={errors.telefonoSecundario ? "border-red-500" : ""}
              />
              {errors.telefonoSecundario && (
                <p className="text-xs text-red-600">
                  {errors.telefonoSecundario}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customer-fecha-nacimiento">
                Fecha de nacimiento (opcional)
              </Label>
              <Input
                id="customer-fecha-nacimiento"
                type="date"
                value={fechaNacimiento}
                onChange={(event) => setFechaNacimiento(event.target.value)}
                className={errors.fechaNacimiento ? "border-red-500" : ""}
              />
              {errors.fechaNacimiento && (
                <p className="text-xs text-red-600">
                  {errors.fechaNacimiento}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer-correo">Correo</Label>
              <Input
                id="customer-correo"
                type="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="p. ej. maria@correo.com"
                className={errors.correo ? "border-red-500" : ""}
              />
              {errors.correo && (
                <p className="text-xs text-red-600">{errors.correo}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer-mensaje">Mensaje (opcional)</Label>
            <Textarea
              id="customer-mensaje"
              value={mensaje}
              onChange={(event) => setMensaje(event.target.value)}
              placeholder="Notas sobre el cliente…"
              rows={3}
            />
          </div>

          {saveError && (
            <p className="text-sm text-red-600">{saveError}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
