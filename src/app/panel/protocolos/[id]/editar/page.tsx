"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/layouts/page-container";
import RequireRole from "@/components/require-role";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProtocolForm } from "@/features/protocol/components/protocol-table/protocol-form";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchTours } from "@/lib/store/toursSlice";
import { resetSave } from "@/lib/store/protocolsSlice";
import { getProtocol, Protocol } from "@/services/protocol-service";
import { toErrorMessage } from "@/lib/api-client";

export default function EditProtocolPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const tours = useAppSelector((state) => state.tours.items);
  const toursStatus = useAppSelector((state) => state.tours.listStatus);

  const protocolId = params.id;

  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(resetSave());
    if (toursStatus === "idle") {
      dispatch(fetchTours());
    }
  }, [dispatch, toursStatus]);

  useEffect(() => {
    if (!protocolId) {
      setLoading(false);
      setError("Protocolo no válido.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProtocol(protocolId)
      .then((data) => {
        if (!cancelled) setProtocol(data);
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
  }, [protocolId]);

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
              title="Editar protocolo"
              description="Modifica los datos del protocolo y guarda los cambios."
            />
          </div>

          {loading && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Cargando protocolo…
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

          {!loading && !error && protocol && (
            <Card className="w-full">
              <CardContent className="pt-6">
                <ProtocolForm
                  protocol={protocol}
                  tours={tours}
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
