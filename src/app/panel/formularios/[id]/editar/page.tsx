"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/layouts/page-container";
import RequireRole from "@/components/require-role";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewFormForm } from "@/features/review-form/components/form-table/review-form-form";
import { useAppDispatch } from "@/lib/store/hooks";
import { resetSave } from "@/lib/store/reviewFormsSlice";

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const formId = Number(params.id);

  useEffect(() => {
    dispatch(resetSave());
  }, [dispatch]);

  const back = () => router.push("/panel/formularios");

  if (!Number.isInteger(formId) || formId < 1) {
    return (
      <PageContainer>
        <div className="flex w-full flex-1 flex-col space-y-4 p-4">
          <p className="text-sm text-muted-foreground">
            Formulario no válido.
          </p>
          <div>
            <Button variant="outline" size="sm" onClick={back}>
              Volver
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <RequireRole allow={["superadmin", "admin"]} fallback="/panel/formularios">
      <PageContainer>
        <div className="flex w-full flex-1 flex-col space-y-4 p-4">
          <div className="flex flex-col items-start gap-2">
            <Button variant="outline" size="sm" onClick={back}>
              Volver
            </Button>
            <Heading
              title="Editar formulario"
              description="Modifica el tour, el título y las preguntas."
            />
          </div>
          <Card className="w-full">
            <CardContent className="pt-6">
              <ReviewFormForm
                formId={formId}
                onSuccess={back}
                onCancel={back}
              />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </RequireRole>
  );
}
