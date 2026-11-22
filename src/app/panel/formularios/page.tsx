import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import FormList from "@/features/review-form/components/form-table/form-table";
import ResponsesTab from "@/features/review-form/components/form-table/responses-tab";

const ListForms = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <Heading
          title="Formularios de reseñas"
          description="Crea formularios por tour, comparte el link y revisa las respuestas."
        />
        <Tabs defaultValue="forms">
          <TabsList>
            <TabsTrigger value="forms">Formularios</TabsTrigger>
            <TabsTrigger value="responses">Respuestas</TabsTrigger>
          </TabsList>
          <TabsContent value="forms" className="space-y-4">
            <FormList />
          </TabsContent>
          <TabsContent value="responses" className="space-y-4">
            <ResponsesTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default ListForms;
