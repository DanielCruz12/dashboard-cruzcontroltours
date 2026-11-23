"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/layouts/page-container";
import RequireRole from "@/components/require-role";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostForm } from "@/features/post/components/post-table/post-form";
import { useAppDispatch } from "@/lib/store/hooks";
import { resetSave } from "@/lib/store/postsSlice";
import { getPost, Post } from "@/services/post-service";
import { toErrorMessage } from "@/lib/api-client";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const postId = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(resetSave());
  }, [dispatch]);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      setError("Artículo no válido.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPost(postId)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(toErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

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
              title="Editar artículo"
              description="Modifica los datos del artículo y guarda los cambios."
            />
          </div>

          {loading && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Cargando artículo…
            </p>
          )}

          {!loading && error && (
            <Card className="w-full">
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-red-600">{error}</p>
                <Button onClick={back} className="mt-4" variant="outline">
                  Volver al listado
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && post && (
            <Card className="w-full">
              <CardContent className="pt-6">
                <PostForm
                  post={post}
                  onSuccess={back}
                  onCancel={back}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </RequireRole>
  );
}
