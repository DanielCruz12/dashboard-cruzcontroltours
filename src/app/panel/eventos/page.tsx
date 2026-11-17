import PageContainer from "@/components/layouts/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import EventList from "@/features/event/components/event-table/event-table";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

const ListEvent = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Eventos"
            description="En esta sección, podrás gestionar y visualizar todos los detalles de los eventos."
          />
          <Link
            href="/panel/eventos/crear"
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <Plus className="" /> Crear Evento
          </Link>
        </div>
        <EventList />
      </div>
    </PageContainer>
  );
};

export default ListEvent;
