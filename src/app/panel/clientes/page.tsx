import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import CustomerList from "@/features/customer/components/customer-table/customer-table";

const ListCustomers = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <Heading
          title="Clientes"
          description="Mensajes recibidos desde el formulario de contacto del sitio web."
        />
        <CustomerList />
      </div>
    </PageContainer>
  );
};

export default ListCustomers;
