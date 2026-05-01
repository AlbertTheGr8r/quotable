"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, FileText, Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useRateData } from "@/hooks/use-rate-data";
import { applyModifiers, computeBase } from "@/lib/engine";
import { Money } from "@/lib/engine/money";
import type { LineItem, ModifierResult, Service } from "@/lib/schema/rates";
import { LogoStorage } from "@/lib/storage/idb";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/company-store";
import { useProjectStore } from "@/stores/project-store";
import { CompanyProfileDialog } from "../layout/CompanyProfileDialog";
import { QuotePDF } from "./QuotePDF";

export function ReceiptPanel() {
  const { projects, activeProjectId } = useProjectStore();
  const project = projects.find((p) => p.id === activeProjectId);
  const { data: rates } = useRateData(project?.yamlUrl || "");

  const [showWorksheet, setShowWorksheet] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("showWorksheet");
    return stored !== null ? stored === "true" : true;
  });
  const [includeVat, setIncludeVat] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { profile } = useCompanyStore();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const isProfileEmpty = !profile.name || !profile.email;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("showWorksheet", String(showWorksheet));
  }, [showWorksheet]);

  useEffect(() => {
    // Fetch logo
    let currentUrl: string | null = null;
    if (profile.logoId) {
      LogoStorage.getLogo(profile.logoId).then((record) => {
        if (record) {
          const url = URL.createObjectURL(record.data);
          currentUrl = url;
          setLogoUrl(url);
        }
      });
    }

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [profile.logoId]);

  const results = useMemo(() => {
    if (!project || !rates) return [];

    return project.quoteItems
      .map((item) => {
        let service = null;
        for (const cat of rates.categories) {
          service = cat.services.find((s) => s.id === item.serviceId);
          if (service) break;
        }

        if (!service) return null;

        const { lineItems, subtotal } = computeBase(service, item.quantity, item.params);
        const { modifiers, total } = applyModifiers(subtotal, service, item.modifiers);

        return {
          id: item.id,
          service,
          lineItems,
          subtotal,
          modifiers,
          total,
        } as {
          id: string;
          service: Service;
          lineItems: LineItem[];
          subtotal: Money;
          modifiers: ModifierResult[];
          total: Money;
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [project, rates]);

  const totals = useMemo(() => {
    let subtotalCents = 0;
    for (const res of results) {
      if (res) subtotalCents += res.total.cents;
    }

    const subtotalMoney = new Money(subtotalCents);
    const vatMoney = includeVat ? subtotalMoney.multiply(rates?.meta.vat_rate || 0.12) : Money.zero();
    const grandTotal = subtotalMoney.add(vatMoney);

    return {
      subtotal: subtotalMoney.format(),
      vat: vatMoney.format(),
      grand: grandTotal.format(),
    };
  }, [results, includeVat, rates]);

  if (!project) return null;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-6 h-16 border-b flex items-center justify-between bg-primary shrink-0">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary-foreground" />
          <h2 className="font-bold uppercase tracking-tight text-sm text-primary-foreground">Receipt Summary</h2>
        </div>

        <div className="flex gap-2">
          {results.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 transition-all text-primary-foreground",
                "hover:bg-primary-foreground/10 hover:text-primary-foreground",
                showWorksheet && "bg-primary-foreground/20",
              )}
              onClick={() => setShowWorksheet(!showWorksheet)}
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {results.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-50">
            <Receipt className="h-12 w-12 mb-4" />
            <p className="text-sm font-medium">Add your first service to build a quote.</p>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              {results.map((res) => (
                <div key={res.id} className="flex flex-col gap-1">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-0.5">
                      <h4 className="font-semibold text-sm">{res?.service.label}</h4>
                    </div>
                    <span className="text-sm tabular-nums font-semibold">{res?.total.format()}</span>
                  </div>

                  {showWorksheet && (
                    <div className="ml-2 pl-3 border-l-2 border-muted py-1 flex flex-col gap-1">
                      {res.lineItems.map((li) => (
                        <div key={li.id} className="flex justify-between text-[11px] text-muted-foreground">
                          <span>{li.label}</span>
                          <span>{li.formattedAmount}</span>
                        </div>
                      ))}
                      {res.modifiers.map((mod) => (
                        <div key={mod.id} className="flex justify-between text-[11px] text-success italic">
                          <span>
                            {mod.label}: {mod.optionLabel}
                          </span>
                          <span>+{mod.formattedAmount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{totals.subtotal}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="vat"
                    checked={includeVat}
                    onCheckedChange={(checked: boolean | "indeterminate") => setIncludeVat(!!checked)}
                  />
                  <label
                    htmlFor="vat"
                    className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  >
                    VAT (12%)
                  </label>
                </div>
                <span className="text-sm font-medium">{totals.vat}</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic -mt-2">
                Note: System automatically handles vatable vs non-vatable services based on the rate schedule schema.
              </p>

              <div className="mt-2 p-4 bg-primary/5 rounded-lg border border-primary/20 transition-all hover:bg-primary/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-primary/60">Grand Total</span>
                  <span className="text-2xl font-bold text-primary tracking-tighter tabular-nums">{totals.grand}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              {isClient &&
                (isProfileEmpty ? (
                  <Button
                    className="w-full gap-2 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => setIsExportDialogOpen(true)}
                  >
                    <Download className="h-4 w-4" /> EXPORT PDF
                  </Button>
                ) : (
                  <PDFDownloadLink
                    document={
                      <QuotePDF
                        project={project}
                        results={results}
                        totals={totals}
                        branding={{ ...profile, logoUrl }}
                      />
                    }
                    fileName={`Quote-${project.name.replace(/\s+/g, "-")}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        className="w-full gap-2 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={loading}
                      >
                        <Download className="h-4 w-4" /> {loading ? "PREPARING..." : "EXPORT PDF"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                ))}
              {!isClient && (
                <Button className="w-full gap-2 font-bold shadow-lg opacity-50" disabled>
                  <Download className="h-4 w-4" /> EXPORT PDF
                </Button>
              )}
              <p className="text-[10px] text-center text-muted-foreground px-4">
                All quotes generated are based on user submitted rates and are subject to final adjustment.
              </p>
            </div>
          </div>
        )}
      </ScrollArea>

      <AlertDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Incomplete Company Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Your company profile is missing some details (name or email). This information is used in the quote header
              for professional branding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex flex-col sm:flex-row gap-2 sm:mr-auto w-full sm:w-auto">
              <AlertDialogCancel className="w-full sm:w-auto sm:mt-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 dark:hover:bg-destructive/20 transition-colors">
                Cancel
              </AlertDialogCancel>
              {isClient && (
                <PDFDownloadLink
                  document={
                    <QuotePDF project={project} results={results} totals={totals} branding={{ ...profile, logoUrl }} />
                  }
                  fileName={`Quote-${project.name.replace(/\s+/g, "-")}.pdf`}
                >
                  {({ loading }) => (
                    <Button
                      variant="ghost"
                      className="w-full sm:w-auto font-bold"
                      disabled={loading}
                      onClick={() => setIsExportDialogOpen(false)}
                    >
                      {loading ? "Preparing..." : "Not now"}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
            <CompanyProfileDialog
              trigger={
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-primary text-primary hover:bg-primary dark:hover:bg-primary hover:text-primary-foreground font-bold"
                >
                  Complete Profile
                </Button>
              }
              onComplete={() => setIsExportDialogOpen(false)}
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
