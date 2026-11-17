import PageContainer from "@/components/layouts/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import PostList from "@/features/post/components/post-table/post-table";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

const ListPost = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Noticias"
            description="En esta sección, podrás gestionar y visualizar todos los detalles de las noticias."
          />
          <Link
            href="/panel/noticias/crear"
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <Plus className="" /> Crear Noticia
          </Link>
        </div>
        <PostList />
      </div>
    </PageContainer>
  );
};

export default ListPost;
