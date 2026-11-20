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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { createUser, updateUser } from "@/lib/store/usersSlice";
import { PanelUser, PanelUserInput } from "@/services/user-service";
import type { RoleName } from "@/lib/session";
import { toErrorMessage } from "@/lib/api-client";
import { ROLE_LABELS } from "./column";

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PanelUser | null;
};

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

const ROLE_OPTIONS: RoleName[] = ["admin", "host", "superadmin"];

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const dispatch = useAppDispatch();
  const saveStatus = useAppSelector((state) => state.users.saveStatus);
  const saveError = useAppSelector((state) => state.users.saveError);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleName>(user?.role ?? "host");
  const [active, setActive] = useState(user ? String(user.active) : "true");
  const [errors, setErrors] = useState<FieldErrors>({});

  const saving = saveStatus === "loading";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: FieldErrors = {};
    if (!name.trim()) next.name = "El nombre es requerido.";
    if (!email.trim()) next.email = "El correo es requerido.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Correo inválido.";
    }
    if (!user && password.length < 6) {
      next.password = "Mínimo 6 caracteres.";
    }
    if (user && password.length > 0 && password.length < 6) {
      next.password = "Mínimo 6 caracteres.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const input: PanelUserInput = {
      name: name.trim(),
      email: email.trim(),
      role,
      active: active === "true",
    };
    // Vacía en edición = conservar la actual.
    if (!user || password.length > 0) input.password = password;

    try {
      if (user) {
        await dispatch(updateUser({ id: user.id, input })).unwrap();
        toast.success("Usuario actualizado con éxito");
      } else {
        await dispatch(createUser(input)).unwrap();
        toast.success("Usuario creado con éxito");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar usuario" : "Crear usuario"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Modifica los datos del usuario y guarda los cambios."
              : "Completa los datos del nuevo usuario."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="user-name">Nombre</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre completo"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-email">Correo</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {user?.role !== "superadmin" && (
            <div className="space-y-1.5">
              <Label htmlFor="user-password">Contraseña</Label>
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  user
                    ? "Vacía para conservar la actual"
                    : "Mínimo 6 caracteres"
                }
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="user-role">Rol</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as RoleName)}
            >
              <SelectTrigger id="user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {ROLE_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-active">Estado</Label>
            <Select value={active} onValueChange={setActive}>
              <SelectTrigger id="user-active">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
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
