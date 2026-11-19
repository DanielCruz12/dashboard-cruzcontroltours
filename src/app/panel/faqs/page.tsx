import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import FaqList from "@/features/faq/components/faq-table/faq-table";

const ListFaqs = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <Heading
          title="Preguntas frecuentes"
          description="Crea, edita y gestiona las preguntas del sitio."
        />
        <FaqList />
      </div>
    </PageContainer>
  );
};

export default ListFaqs;
