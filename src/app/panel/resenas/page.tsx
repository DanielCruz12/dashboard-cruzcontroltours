import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import ReviewList from "@/features/review/components/review-table/review-table";

const ListReviews = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <Heading
          title="Reseñas"
          description="Consulta y modera las reseñas de tours."
        />
        <ReviewList />
      </div>
    </PageContainer>
  );
};

export default ListReviews;
