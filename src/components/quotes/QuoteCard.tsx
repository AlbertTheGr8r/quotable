"use client";

import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyModifiers, computeBase } from "@/lib/engine";
import { convert, getRateFileUnits, getServiceAvailableUnits, normalizeQuantity } from "@/lib/engine/units";
import type { RateFile, Service } from "@/lib/schema/rates";
import { type Project, type QuoteItem, useProjectStore } from "@/stores/project-store";

interface QuoteCardProps {
  project: Project;
  item: QuoteItem;
  rates: RateFile | null;
}

export function QuoteCard({ project, item, rates }: QuoteCardProps) {
  const { actions } = useProjectStore();
  const [displayUnit, setDisplayUnit] = useState<string | null>(null);

  const service = useMemo(() => {
    if (!rates) return null;
    let found: Service | undefined;
    for (const cat of rates.categories) {
      found = cat.services.find((s) => s.id === item.serviceId);
      if (found) break;
    }
    if (!found && rates.uncategorized) {
      found = rates.uncategorized.find((s) => s.id === item.serviceId);
    }
    return found;
  }, [rates, item.serviceId]);

  const availableUnits = useMemo(() => {
    if (!rates || !service) return [];
    const unitsConfig = getRateFileUnits(rates);
    return getServiceAvailableUnits(service, unitsConfig);
  }, [rates, service]);

  const canonicalUnit = useMemo(() => {
    if (!rates || !service) return service?.unit || "";
    const unitsConfig = getRateFileUnits(rates);
    const category = service.unit_type;
    return unitsConfig[category]?.canonical || service.unit;
  }, [rates, service]);

  const currentDisplayUnit = displayUnit || canonicalUnit;

  const displayQuantity = useMemo(() => {
    if (!rates || !service) return item.quantity;
    const unitsConfig = getRateFileUnits(rates);
    return convert(item.quantity, canonicalUnit, currentDisplayUnit, unitsConfig);
  }, [rates, service, item.quantity, canonicalUnit, currentDisplayUnit]);

  const result = useMemo(() => {
    if (!service) return null;
    const { lineItems, subtotal } = computeBase(service, item.quantity, item.params);
    const { modifiers, total } = applyModifiers(subtotal, service, item.modifiers);

    return {
      subtotal: subtotal.format(),
      total: total.format(),
      lineItems,
      modifiers,
    };
  }, [service, item.quantity, item.params, item.modifiers]);

  const handleQuantityChange = (value: number, unit: string) => {
    if (!service || !rates) return;
    const unitsConfig = getRateFileUnits(rates);
    const normalized = normalizeQuantity(value, unit, service.unit_type, unitsConfig);
    actions.updateQuoteItem(project.id, item.id, { quantity: normalized });
  };

  if (!service || !result) return null;

  return (
    <Card className="shadow-sm border-2 border-transparent hover:border-primary/20 transition-all">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">{service.label}</CardTitle>
          <div className="text-[10px] uppercase font-bold text-muted-foreground">
            {service.unit_display.toUpperCase()}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => actions.removeQuoteItem(project.id, item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {service.strategy !== "flat" && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Quantity</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  className="flex-1"
                  value={displayQuantity}
                  onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0, currentDisplayUnit)}
                />
                <select
                  className="w-24 rounded-md border border-input bg-background px-2 py-2 text-sm focus-visible:outline-none"
                  value={currentDisplayUnit}
                  onChange={(e) => setDisplayUnit(e.target.value)}
                >
                  {availableUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {service.strategy === "tiered_per_unit" &&
            service.tiered_per?.parameters?.map((param) => (
              <div key={param.id} className="flex flex-col gap-2">
                <Label className="text-xs">{param.label}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={item.params[param.id] || ""}
                  onChange={(e) =>
                    actions.updateQuoteItem(project.id, item.id, {
                      params: { ...item.params, [param.id]: e.target.value },
                    })
                  }
                >
                  {param.options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

          {service.strategy === "time_based" && service.time_based && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Role / Resource</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                value={item.params.role || Object.keys(service.time_based.roles)[0]}
                onChange={(e) =>
                  actions.updateQuoteItem(project.id, item.id, {
                    params: { ...item.params, role: e.target.value },
                  })
                }
              >
                {Object.keys(service.time_based.roles).map((roleId) => (
                  <option key={roleId} value={roleId}>
                    {roleId.replace(/_/g, " ").toUpperCase()} (₱{service.time_based!.roles[roleId].toLocaleString()}/hr)
                  </option>
                ))}
              </select>
            </div>
          )}

          {service.strategy === "flat_per_unit" && service.flat_rates && (
            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-muted/20 rounded-md">
              <h5 className="col-span-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Sub-Items
              </h5>
              {Object.entries(service.flat_rates.rates).map(([id, rate]) => (
                <div key={id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`${item.id}-${id}`}
                    className="rounded border-input text-primary"
                    checked={item.params[id] === "true"}
                    onChange={(e) =>
                      actions.updateQuoteItem(project.id, item.id, {
                        params: { ...item.params, [id]: e.target.checked ? "true" : "false" },
                      })
                    }
                  />
                  <Label htmlFor={`${item.id}-${id}`} className="text-xs cursor-pointer flex-1">
                    {id.replace(/_/g, " ").toUpperCase()} (₱{rate.toLocaleString()})
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {service.modifiers && service.modifiers.length > 0 && (
          <div className="flex flex-col gap-3 p-3 bg-muted/30 rounded-md">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Adjustments</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {service.modifiers.map((mod) => (
                <div key={mod.id} className="flex flex-col gap-1.5">
                  <Label className="text-xs">{mod.label}</Label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-0 text-xs focus-visible:outline-none"
                    value={item.modifiers[mod.id] || mod.default_option_id || ""}
                    onChange={(e) =>
                      actions.updateQuoteItem(project.id, item.id, {
                        modifiers: { ...item.modifiers, [mod.id]: e.target.value },
                      })
                    }
                  >
                    {mod.options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({mod.type === "percentage_add" ? `+${opt.value * 100}%` : `x${opt.value}`})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {service.warnings && service.warnings.length > 0 && (
          <div className="flex flex-col gap-1">
            {service.warnings.map((w) => (
              <div key={w} className="flex gap-2 text-[10px] text-muted-foreground leading-tight italic">
                <span>• {w}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed">
          <span className="text-xs font-medium text-muted-foreground">Service Total</span>
          <span className="font-bold text-lg">{result.total}</span>
        </div>
      </CardContent>
    </Card>
  );
}
