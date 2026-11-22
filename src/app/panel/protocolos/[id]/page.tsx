"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Copy, Download } from "lucide-react";
import PageContainer from "@/components/layouts/page-container";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/session";
import { getProtocol, Protocol } from "@/services/protocol-service";
import { Tour } from "@/services/tour-service";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchTours } from "@/lib/store/toursSlice";
import { shortId } from "@/lib/utils";
import { createProtocol } from "@/lib/store/protocolsSlice";
import { ProtocolDuplicateDialog } from "@/features/protocol/components/protocol-table/protocol-duplicate-dialog";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { toErrorMessage } from "@/lib/api-client";

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "protocolo";
}

/** Funciones de color que html2canvas no sabe interpretar. */
const UNSAFE_CSS_RE = /oklch|oklab|[^a-z]lab\(|[^a-z]lch\(|color-mix|light-dark/i;

/** Quita del clon las declaraciones CSS que romperían la conversión a PDF. */
function sanitizeCloneForCanvas(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  const elements: HTMLElement[] = [root];
  let node: Node | null = walker.nextNode();
  while (node) {
    elements.push(node as HTMLElement);
    node = walker.nextNode();
  }
  elements.forEach((element) => {
    const style = element.getAttribute("style");
    if (!style || !UNSAFE_CSS_RE.test(style)) return;
    const kept = style
      .split(";")
      .map((part) => part.trim())
      .filter((part) => part && !UNSAFE_CSS_RE.test(part));
    if (kept.length > 0) {
      element.setAttribute("style", kept.join("; "));
    } else {
      element.removeAttribute("style");
    }
  });
}

export default function ViewProtocolPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { canWrite } = useSession();
  const tours = useAppSelector((state) => state.tours.items);
  const toursStatus = useAppSelector((state) => state.tours.listStatus);
  const saveStatus = useAppSelector((state) => state.protocols.saveStatus);

  const protocolId = params.id;

  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cleanHtml, setCleanHtml] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        if (cancelled) return;
        setProtocol(data);
        setCleanHtml(data.description ? sanitizeHtml(data.description) : "");
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
  }, [protocolId]);

  const back = () => router.push("/panel/protocolos");
  const tour: Tour | undefined = tours.find(
    (item) => item.id === protocol?.tourId,
  );
  const tourLabel = protocol
    ? (tour
        ? `#${shortId(tour.id)} — ${tour.title}`
        : `#${shortId(protocol.tourId)}`)
    : "";

  const handleDownloadPdf = async () => {
    if (!protocol || !pdfRef.current || pdfBusy) return;
    setPdfBusy(true);
    const stage = document.createElement("div");
    stage.style.cssText =
      "position:fixed;left:-10000px;top:0;width:794px;background:#ffffff;";
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      const clone = pdfRef.current.cloneNode(true) as HTMLElement;
      sanitizeCloneForCanvas(clone);
      stage.appendChild(clone);
      document.body.appendChild(stage);
      await html2pdf()
        .set({
          margin: [12, 12, 12, 12],
          filename: `${slugify(protocol.title)}.pdf`,
          image: { type: "jpeg", quality: 0.96 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(clone)
        .save();
      toast.success("PDF descargado con éxito");
    } catch (err: unknown) {
      toast.error(toErrorMessage(err) || "No se pudo generar el PDF.");
    } finally {
      stage.remove();
      setPdfBusy(false);
    }
  };

  const handleDuplicate = () => {
    setDuplicateOpen(true);
  };

  const handleConfirmDuplicate = async (tourId: string) => {
    if (!protocol) return;
    try {
      const copy = await dispatch(
        createProtocol({
          tourId,
          title: `${protocol.title} (copia)`,
          description: protocol.description,
        }),
      ).unwrap();
      toast.success("Protocolo duplicado con éxito");
      setDuplicateOpen(false);
      router.push(`/panel/protocolos/${copy.id}`);
    } catch (err: unknown) {
      toast.error(toErrorMessage(err));
    }
  };

  return (
    <PageContainer>
      <div className="flex w-full flex-1 flex-col space-y-4 p-4">
        <div className="flex flex-col items-start gap-2">
          <Button variant="outline" size="sm" onClick={back}>
            Volver
          </Button>
          <div className="flex w-full flex-wrap items-end justify-between gap-2">
            <Heading
              title={protocol?.title ?? "Ver protocolo"}
              description={
                protocol ? `Tour: ${tourLabel}` : "Detalle del protocolo."
              }
            />
            {protocol && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadPdf}
                  disabled={pdfBusy}
                >
                  <Download className="h-4 w-4" />
                  {pdfBusy ? "Generando…" : "Descargar PDF"}
                </Button>
                {canWrite && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDuplicate}
                    >
                      <Copy className="h-4 w-4" /> Duplicar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/panel/protocolos/${protocol.id}/editar`)
                      }
                    >
                      Editar protocolo
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
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
                  Este protocolo no tiene descripción.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {protocol && (
          <div
            aria-hidden
            style={{
              position: "fixed",
              left: "-10000px",
              top: 0,
              width: "794px",
              backgroundColor: "#ffffff",
            }}
          >
            <div
              ref={pdfRef}
              style={{
                backgroundColor: "#ffffff",
                color: "#111111",
                fontFamily: "Arial, Helvetica, sans-serif",
                padding: "32px",
              }}
            >
              <div
                style={{
                  borderBottom: "2px solid #111111",
                  paddingBottom: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}
                >
                  {protocol.title}
                </div>
                <div style={{ fontSize: "12px", color: "#555555", marginTop: "4px" }}>
                  {`Tour: ${tourLabel}`}
                </div>
              </div>
              {cleanHtml ? (
                <div
                  className="rich-text-content"
                  style={{ fontSize: "13px" }}
                  dangerouslySetInnerHTML={{ __html: cleanHtml }}
                />
              ) : (
                <p style={{ fontSize: "13px", color: "#555555" }}>
                  Este protocolo no tiene descripción.
                </p>
              )}
            </div>
          </div>
        )}

        <ProtocolDuplicateDialog
          key={`view-${duplicateOpen}`}
          open={duplicateOpen}
          onOpenChange={setDuplicateOpen}
          protocol={protocol}
          tours={tours}
          saving={saveStatus === "loading"}
          onConfirm={handleConfirmDuplicate}
        />
      </div>
    </PageContainer>
  );
}
