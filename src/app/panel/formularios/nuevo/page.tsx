"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layouts/page-container";
import RequireRole from "@/components/require-role";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewFormForm } from "@/features/review-form/components/form-table/review-form-form";
import { useAppDispatch } from "@/lib/store/hooks";
import { resetSave } from "@/lib/store/reviewFormsSlice";

export default function NewFormPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetSave());
  }, [dispatch]);

  const back = () => router.push("/panel/formularios");

  return (
    <RequireRole allow={["superadmin", "admin"]} fallback="/panel/formularios">
      <PageContainer>
        <div className="flex w-full flex-1 flex-col space-y-4 p-4">
          <div className="flex flex-col items-start gap-2">
            <Button variant="outline" size="sm" onClick={back}>
              Volver
            </Button>
            <Heading
              title="Crear formulario"
              description="Define el tour, el título y las preguntas que verá el visitante."
            />
          </div>
          <Card className="w-full">
            <CardContent className="pt-6">
              <ReviewFormForm
                formId={null}
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
