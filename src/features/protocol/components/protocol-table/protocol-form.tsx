"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { shortId } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { createProtocol, updateProtocol } from "@/lib/store/protocolsSlice";
import { Protocol } from "@/services/protocol-service";
import { Tour } from "@/services/tour-service";
import { toErrorMessage } from "@/lib/api-client";

type ProtocolFormProps = {
  protocol: Protocol | null;
  tours: Tour[];
  onSuccess: () => void;
  onCancel: () => void;
};

type FieldErrors = {
  tourId?: string;
  title?: string;
};

export function ProtocolForm({
  protocol,
  tours,
  onSuccess,
  onCancel,
}: ProtocolFormProps) {
  const dispatch = useAppDispatch();
  const saveStatus = useAppSelector((state) => state.protocols.saveStatus);
  const saveError = useAppSelector((state) => state.protocols.saveError);

  const [tourId, setTourId] = useState(
    protocol ? String(protocol.tourId) : "",
  );
  const [title, setTitle] = useState(protocol?.title ?? "");
  const [description, setDescription] = useState(protocol?.description ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

  const saving = saveStatus === "loading";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: FieldErrors = {};
    if (!tourId) next.tourId = "Debes seleccionar un tour.";
    if (!title.trim()) next.title = "El título es requerido.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const input = {
      tourId: tourId,
      title: title.trim(),
      description: description.trim() ? description : null,
    };

    try {
      if (protocol) {
        await dispatch(updateProtocol({ id: protocol.id, input })).unwrap();
        toast.success("Protocolo actualizado con éxito");
      } else {
        await dispatch(createProtocol(input)).unwrap();
        toast.success("Protocolo creado con éxito");
      }
      onSuccess();
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="protocol-tour">Tour</Label>
        <Select value={tourId} onValueChange={setTourId}>
          <SelectTrigger
            id="protocol-tour"
            className={errors.tourId ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Selecciona un tour" />
          </SelectTrigger>
          <SelectContent>
            {tours.length === 0 && (
              <SelectItem value="none" disabled>
                Sin tours disponibles
              </SelectItem>
            )}
            {tours.map((tour) => (
              <SelectItem key={tour.id} value={String(tour.id)}>
                #{shortId(tour.id)} — {tour.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tourId && (
          <p className="text-xs text-red-600">{errors.tourId}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="protocol-title">Título</Label>
        <Input
          id="protocol-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="p. ej. Protocolo de seguridad acuática"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-xs text-red-600">{errors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="protocol-description">Descripción (opcional)</Label>
        <RichTextEditor
          id="protocol-description"
          value={description}
          onChange={setDescription}
        />
      </div>

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
