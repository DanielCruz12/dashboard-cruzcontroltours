import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import FormList from "@/features/review-form/components/form-table/form-table";

const ListForms = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <Heading
          title="Formularios de reseñas"
          description="Crea formularios por tour y comparte el link."
        />
        <FormList />
      </div>
    </PageContainer>
  );
};

export default ListForms;
