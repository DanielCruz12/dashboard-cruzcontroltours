import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import ResponsesList from "@/features/review/components/review-table/responses-list";

const ListReviews = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <Heading
          title="Reseñas"
          description="Respuestas de los formularios de reseñas, por tour."
        />
        <ResponsesList />
      </div>
    </PageContainer>
  );
};

export default ListReviews;
