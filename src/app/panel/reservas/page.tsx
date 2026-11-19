import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import BookingList from "@/features/booking/components/booking-table/booking-table";

const ListBookings = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <Heading
          title="Reservas"
          description="Consulta, edita y gestiona las reservas de tours."
        />
        <BookingList />
      </div>
    </PageContainer>
  );
};

export default ListBookings;
