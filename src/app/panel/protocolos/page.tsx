import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import ProtocolList from "@/features/protocol/components/protocol-table/protocol-table";

const ListProtocols = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <Heading
          title="Protocolos"
          description="Crea, edita y gestiona los protocolos de tours."
        />
        <ProtocolList />
      </div>
    </PageContainer>
  );
};

export default ListProtocols;
