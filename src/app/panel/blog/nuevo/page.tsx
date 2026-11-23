"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layouts/page-container";
import RequireRole from "@/components/require-role";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostForm } from "@/features/post/components/post-table/post-form";
import { useAppDispatch } from "@/lib/store/hooks";
import { resetSave } from "@/lib/store/postsSlice";

export default function NewPostPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetSave());
  }, [dispatch]);

  const back = () => router.push("/panel/blog");

  return (
    <RequireRole allow={["superadmin", "admin"]} fallback="/panel/blog">
      <PageContainer>
        <div className="flex w-full flex-1 flex-col space-y-4 p-4">
          <div className="flex flex-col items-start gap-2">
            <Button variant="outline" size="sm" onClick={back}>
              Volver
            </Button>
            <Heading
              title="Crear artículo"
              description="Completa los datos del nuevo artículo."
            />
          </div>
          <Card className="w-full">
            <CardContent className="pt-6">
              <PostForm post={null} onSuccess={back} onCancel={back} />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </RequireRole>
  );
}
