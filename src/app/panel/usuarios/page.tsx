import PageContainer from "@/components/layouts/page-container";
import RequireRole from "@/components/require-role";
import { Heading } from "@/components/ui/heading";
import UserList from "@/features/user/components/user-table/user-table";

const ListUsers = () => {
  return (
    <RequireRole allow={["superadmin"]}>
      <PageContainer scrollable={false}>
        <div className="flex flex-1 flex-col space-y-4">
          <Heading
            title="Usuarios"
            description="Crea y gestiona los usuarios del panel y sus roles."
          />
          <UserList />
        </div>
      </PageContainer>
    </RequireRole>
  );
};

export default ListUsers;
