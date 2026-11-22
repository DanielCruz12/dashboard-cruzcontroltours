"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layouts/page-container";
import RequireRole from "@/components/require-role";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProtocolForm } from "@/features/protocol/components/protocol-table/protocol-form";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchTours } from "@/lib/store/toursSlice";
import { resetSave } from "@/lib/store/protocolsSlice";

export default function NewProtocolPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tours = useAppSelector((state) => state.tours.items);
  const toursStatus = useAppSelector((state) => state.tours.listStatus);

  useEffect(() => {
    dispatch(resetSave());
    if (toursStatus === "idle") {
      dispatch(fetchTours());
    }
  }, [dispatch, toursStatus]);

  const back = () => router.push("/panel/protocolos");

  return (
    <RequireRole allow={["superadmin", "admin"]} fallback="/panel/protocolos">
      <PageContainer>
        <div className="flex w-full flex-1 flex-col space-y-4 p-4">
          <div className="flex flex-col items-start gap-2">
            <Button variant="outline" size="sm" onClick={back}>
              Volver
            </Button>
            <Heading
              title="Crear protocolo"
              description="Completa los datos del nuevo protocolo."
            />
          </div>
          <Card className="w-full">
            <CardContent className="pt-6">
              <ProtocolForm
                protocol={null}
                tours={tours}
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
