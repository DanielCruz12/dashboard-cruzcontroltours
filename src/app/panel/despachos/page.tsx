import PageContainer from "@/components/layouts/page-container";
import RequireRole from "@/components/require-role";
import { Heading } from "@/components/ui/heading";
import RentalList from "@/features/rental/components/rental-table/rental-table";

const ListRentals = () => {
  return (
    <RequireRole allow={["superadmin", "host", "admin"]}>
      <PageContainer scrollable={false}>
        <div className="flex flex-1 flex-col space-y-4">
          <Heading
            title="Despachos"
            description="Crea, edita y gestiona los despachos de traslados."
          />
          <RentalList />
        </div>
      </PageContainer>
    </RequireRole>
  );
};

export default ListRentals;
