declare module "html2pdf.js" {
  export type Html2PdfOptions = {
    margin?: number | [number, number] | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: Record<string, unknown>;
    pagebreak?: { mode?: string | string[] };
    [key: string]: unknown;
  };

  export type Html2PdfWorker = {
    set: (options: Html2PdfOptions) => Html2PdfWorker;
    from: (element: HTMLElement) => Html2PdfWorker;
    save: () => Promise<void>;
  };

  const html2pdf: () => Html2PdfWorker;
  export default html2pdf;
}
