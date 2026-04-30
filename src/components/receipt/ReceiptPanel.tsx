"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, FileText, Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useYamlData } from "@/hooks/use-yaml-data";
import { ComputationEngine, type LineItem, type ModifierResult } from "@/lib/engine";
import { Money } from "@/lib/engine/money";
import type { Service } from "@/lib/schema/rates";
import { LogoStorage } from "@/lib/storage/idb";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/company-store";
import { useProjectStore } from "@/stores/project-store";
import { QuotePDF } from "./QuotePDF";

export function ReceiptPanel() {
  const { projects, activeProjectId } = useProjectStore();
  const project = projects.find((p) => p.id === activeProjectId);
  const { data: rates } = useYamlData(project?.yamlUrl || "");

  const [showWorksheet, setShowWorksheet] = useState(false);
  const [includeVat, setIncludeVat] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { profile } = useCompanyStore();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

        const { lineItems, subtotal } = ComputationEngine.computeBase(service, item.quantity, item.params);
        const { modifiers, total } = ComputationEngine.applyModifiers(subtotal, service, item.modifiers);

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
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <h2 className="font-bold uppercase tracking-tight text-sm">Receipt Summary</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", showWorksheet && "bg-primary/10 text-primary")}
            onClick={() => setShowWorksheet(!showWorksheet)}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
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
                <label htmlFor="vat" className="text-sm text-muted-foreground cursor-pointer">
                  VAT (12%)
                </label>
              </div>
              <span className="text-sm font-medium">{totals.vat}</span>
            </div>

            <div className="mt-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase font-bold text-primary/60">Grand Total</span>
                <span className="text-2xl font-bold text-primary tracking-tighter tabular-nums">{totals.grand}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            {isClient && (
              <PDFDownloadLink
                document={
                  <QuotePDF project={project} results={results} totals={totals} branding={{ ...profile, logoUrl }} />
                }
                fileName={`Quote-${project.name.replace(/\s+/g, "-")}.pdf`}
              >
                {({ loading }) => (
                  <Button className="w-full gap-2 font-bold shadow-lg shadow-primary/20" disabled={loading}>
                    <Download className="h-4 w-4" /> {loading ? "PREPARING..." : "EXPORT PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
            {!isClient && (
              <Button className="w-full gap-2 font-bold shadow-lg opacity-50" disabled>
                <Download className="h-4 w-4" /> EXPORT PDF
              </Button>
            )}
            <p className="text-[10px] text-center text-muted-foreground px-4">
              All quotes generated are based on current legislative rates and are subject to final adjustment.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
