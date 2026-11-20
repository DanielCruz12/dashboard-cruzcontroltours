"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layouts/page-container";
import RequireRole from "@/components/require-role";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TourForm } from "@/features/tour/components/tour-table/tour-form";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchCategories } from "@/lib/store/categoriesSlice";
import { resetSave } from "@/lib/store/toursSlice";

export default function NewTourPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.items);
  const categoriesStatus = useAppSelector(
    (state) => state.categories.listStatus,
  );

  useEffect(() => {
    dispatch(resetSave());
    if (categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoriesStatus]);

  const back = () => router.push("/panel/tours");

  return (
    <RequireRole allow={["superadmin", "admin"]} fallback="/panel/tours">
      <PageContainer>
        <div className="flex w-full flex-1 flex-col space-y-4 p-4">
          <div className="flex flex-col items-start gap-2">
            <Button variant="outline" size="sm" onClick={back}>
              Volver
            </Button>
            <Heading
              title="Crear tour"
              description="Completa los datos del nuevo tour."
            />
          </div>
          <Card className="w-full">
            <CardContent className="pt-6">
              <TourForm
                tour={null}
                categories={categories}
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
