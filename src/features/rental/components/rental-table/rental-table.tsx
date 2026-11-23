"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { getColumns, STATUS_LABELS } from "./column";
import { RentalFormDialog } from "./rental-form-dialog";
import { DataTable } from "@/components/ui/table/data-table";
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
import { ViewDialog, ViewField } from "@/components/view-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchRentals, resetSave } from "@/lib/store/rentalsSlice";
import { Rental, RentalStatus } from "@/services/rental-service";

const ALL = "all";

const STATUSES: RentalStatus[] = [
  "pending",
  "paid",
  "en_route",
  "completed",
  "cancelled",
];

const rentalFields: ViewField[] = [
  { key: "date", label: "Fecha" },
  { key: "time", label: "Hora" },
  { key: "status", label: "Estado" },
  { key: "customerName", label: "Cliente" },
  { key: "flightInfo", label: "Vuelo" },
  { key: "pickupPlace", label: "Recogida" },
  { key: "destination", label: "Destino" },
  { key: "driverName", label: "Conductor" },
  { key: "vehicle", label: "Vehículo" },
  { key: "notes", label: "Notas" },
  { key: "createdAt", label: "Creado" },
  { key: "updatedAt", label: "Actualizado" },
];

const RentalList = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.rentals.items);
  const listStatus = useAppSelector((state) => state.rentals.listStatus);
  const listError = useAppSelector((state) => state.rentals.listError);

  const [selected, setSelected] = useState<Rental | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Rental | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchRentals());
    }
  }, [dispatch, listStatus]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (dateFilter && item.date !== dateFilter) return false;
      if (statusFilter !== ALL && item.status !== statusFilter) return false;
      return true;
    });
  }, [items, dateFilter, statusFilter]);

  const hasFilters = dateFilter !== "" || statusFilter !== ALL;

  const openCreate = () => {
    dispatch(resetSave());
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (rental: Rental) => {
    dispatch(resetSave());
    setEditing(rental);
    setFormOpen(true);
  };

  if (listStatus === "loading" || listStatus === "idle") {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Cargando despachos…
      </p>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm font-medium text-red-600">{listError}</p>
        <Button onClick={() => dispatch(fetchRentals())} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="rental-filter-date">Fecha</Label>
            <Input
              id="rental-filter-date"
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rental-filter-status">Estado</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="rental-filter-status" className="w-40">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateFilter("");
                setStatusFilter(ALL);
              }}
            >
              Limpiar
            </Button>
          )}
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Crear despacho
        </Button>
      </div>
      <DataTable
        placeholder="Buscar por cliente..."
        columns={getColumns(setSelected, openEdit)}
        filterColumn="customerName"
        data={filtered}
      />
      <ViewDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Detalle del despacho"
        description="Información completa del despacho."
        data={selected}
        fields={rentalFields}
      />
      <RentalFormDialog
        key={`${editing?.id ?? "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        rental={editing}
      />
    </>
  );
};

export default RentalList;
