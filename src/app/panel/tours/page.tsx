import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import TourList from "@/features/tour/components/tour-table/tour-table";

const ListTours = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <Heading
          title="Tours"
          description="Crea, edita y gestiona el catálogo de tours."
        />
        <TourList />
      </div>
    </PageContainer>
  );
};

export default ListTours;
