import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import PostList from "@/features/post/components/post-table/post-table";

const ListPosts = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <Heading
          title="Blog"
          description="Crea, edita y gestiona los artículos del blog."
        />
        <PostList />
      </div>
    </PageContainer>
  );
};

export default ListPosts;
