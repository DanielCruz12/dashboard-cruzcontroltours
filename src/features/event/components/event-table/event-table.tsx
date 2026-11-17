"use client";

import toast from "react-hot-toast";
import { getColumns } from "./column";
import useData from "@/hooks/use-data";
import { deleteEvent } from "@/services/event-service";
import { DataTable } from "@/components/ui/table/data-table";

const EventList = () => {
  const { events, setEvents } = useData("events", null);

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este evento?"
    );
    if (!isConfirmed) return;

    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      toast.success("Evento eliminado con éxito");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al eliminar el evento");
    }
  };

  return (
    <DataTable
      placeholder="Buscar por título..."
      columns={getColumns(handleDelete)}
      filterColumn="title"
      data={events}
    />
  );
};

export default EventList;
