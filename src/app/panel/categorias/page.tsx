import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import CategoryList from "@/features/category/components/category-table/category-table";

const ListCategories = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <Heading
          title="Categorías"
          description="Crea, edita y gestiona las categorías de tours."
        />
        <CategoryList />
      </div>
    </PageContainer>
  );
};

export default ListCategories;
