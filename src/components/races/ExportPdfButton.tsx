"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RacePdfData } from "./RacePdfDocument";

interface ExportPdfButtonProps {
  data: Omit<RacePdfData, "chartImageDataUrl">;
  chartElementId: string;
}

function buildFileName(name: string, startedAt: string): string {
  const safeName =
    name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "let";
  const d = new Date(startedAt);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `Let-${safeName}-${dd}-${mm}-${d.getFullYear()}.pdf`;
}

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function ExportPdfButton({ data, chartElementId }: ExportPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleExport() {
    setIsGenerating(true);
    try {
      // Teške biblioteke se učitavaju tek na klik — van inicijalnog bundle-a
      // i van SSR-a (html2canvas/@react-pdf koriste browser API-je).
      const [{ default: html2canvas }, { pdf }, { RacePdfDocument }] =
        await Promise.all([
          import("html2canvas"),
          import("@react-pdf/renderer"),
          import("./RacePdfDocument"),
        ]);

      const chartElement = document.getElementById(chartElementId);
      if (!chartElement) {
        throw new Error(`Element grafika "${chartElementId}" nije pronađen`);
      }

      const canvas = await html2canvas(chartElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        // U dark mode-u tekst grafika je svetlosiv — na beloj PDF pozadini bio
        // bi nevidljiv. Forsiramo tamni tekst u kloniranom snapshotu (u light
        // mode-u je ovo bezopasan no-op).
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement("style");
          style.textContent = `#${chartElementId} text { fill: #334155 !important; }`;
          clonedDoc.head.appendChild(style);
        },
      });
      const chartImageDataUrl = canvas.toDataURL("image/png");

      // Logo se pretvara u data URL — @react-pdf-ov fetch udaljenih slika ume
      // da padne na CORS-u. Ako logo ne uspe, PDF ide bez njega.
      let logoDataUrl: string | null = null;
      const rawLogo = data.drustvo?.logo_url ?? null;
      if (rawLogo) {
        try {
          logoDataUrl = rawLogo.startsWith("data:")
            ? rawLogo
            : await urlToDataUrl(rawLogo);
        } catch (logoError) {
          console.warn("Logo društva se ne može učitati:", logoError);
        }
      }

      const pdfData: RacePdfData = {
        ...data,
        drustvo: data.drustvo
          ? { name: data.drustvo.name, logo_url: logoDataUrl }
          : null,
        chartImageDataUrl,
      };

      const pdfBlob = await pdf(<RacePdfDocument {...pdfData} />).toBlob();

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildFileName(data.race.name, data.race.started_at);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF izveštaj je preuzet");
    } catch (error) {
      console.error("PDF export greška:", error);
      toast.error("Greška pri generisanju PDF-a", {
        description: "Pokušajte ponovo.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isGenerating}
      className="inline-flex items-center gap-1.5 px-3 py-1 xl:py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs xl:text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        <FileDown className="w-4 h-4" aria-hidden="true" />
      )}
      <span>{isGenerating ? "Generisanje..." : "Eksportuj PDF"}</span>
    </button>
  );
}
