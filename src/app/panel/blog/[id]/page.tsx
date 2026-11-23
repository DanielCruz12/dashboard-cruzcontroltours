"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/session";
import { getPost, Post } from "@/services/post-service";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { toErrorMessage } from "@/lib/api-client";
import moment from "moment";
import "moment/locale/es";

export default function ViewPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { canWrite } = useSession();

  const postId = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cleanHtml, setCleanHtml] = useState("");

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
        if (cancelled) return;
        setPost(data);
        setCleanHtml(data.content ? sanitizeHtml(data.content) : "");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(toErrorMessage(err));
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
    <PageContainer>
      <div className="flex w-full flex-1 flex-col space-y-4 p-4">
        <div className="flex flex-col items-start gap-2">
          <Button variant="outline" size="sm" onClick={back}>
            Volver
          </Button>
          <div className="flex w-full flex-wrap items-end justify-between gap-2">
            <Heading
              title={post?.title ?? "Ver artículo"}
              description={
                post
                  ? `Creado el ${moment(post.createdAt).locale("es").format("LLL")}`
                  : "Detalle del artículo."
              }
            />
            {post && canWrite && (
              <Button
                size="sm"
                onClick={() => router.push(`/panel/blog/${post.id}/editar`)}
              >
                Editar artículo
              </Button>
            )}
          </div>
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
          <>
            <div className="flex flex-wrap items-center gap-2">
              {post.published ? (
                <Badge variant="default">Publicado</Badge>
              ) : (
                <Badge variant="secondary">Borrador</Badge>
              )}
              {post.category && (
                <Badge variant="outline">{post.category}</Badge>
              )}
            </div>

            {post.coverImage && (
              <img
                src={post.coverImage}
                alt=""
                className="max-h-80 w-full rounded-md border object-cover"
              />
            )}

            {post.excerpt && (
              <Card className="w-full">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                </CardContent>
              </Card>
            )}

            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-base">Contenido</CardTitle>
              </CardHeader>
              <CardContent>
                {cleanHtml ? (
                  <div
                    className="rich-text-content text-sm"
                    dangerouslySetInnerHTML={{ __html: cleanHtml }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Este artículo no tiene contenido.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}
