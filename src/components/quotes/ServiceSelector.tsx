"use client";

import Fuse from "fuse.js";
import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RateFile, Service } from "@/lib/schema/rates";
import { useProjectStore } from "@/stores/project-store";

interface ServiceSelectorProps {
  rates: RateFile | null;
  projectId: string;
  onSelect: () => void;
}

export function ServiceSelector({ rates, projectId, onSelect }: ServiceSelectorProps) {
  const [search, setSearch] = useState("");
  const { actions } = useProjectStore();

  const allServices = useMemo(() => {
    if (!rates) return [];
    const flat: (Service & { categoryLabel: string })[] = [];

    for (const cat of rates.categories) {
      for (const service of cat.services) {
        flat.push({ ...service, categoryLabel: cat.label });
      }
    }

    if (rates.uncategorized) {
      for (const service of rates.uncategorized) {
        flat.push({ ...service, categoryLabel: "Other" });
      }
    }

    return flat;
  }, [rates]);

  const fuse = useMemo(
    () =>
      new Fuse(allServices, {
        keys: ["label", "description", "categoryLabel"],
        threshold: 0.3,
      }),
    [allServices],
  );

  const results = useMemo(() => {
    if (!search) return allServices;
    return fuse.search(search).map((r) => r.item);
  }, [search, fuse, allServices]);

  const handleSelect = (service: Service) => {
    actions.addQuoteItem(projectId, {
      serviceId: service.id,
      quantity: 1, // default
      unit: service.unit,
      params: {},
      modifiers: {},
    });
    onSelect();
  };

  return (
    <div className="flex flex-col max-h-[60vh]">
      <div className="p-6 pt-2 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a service (e.g. subdivision, relocation)"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 flex flex-col gap-1">
          {search ? (
            // Search mode: flat list sorted by relevance
            <>
              {results.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No services found matching &quot;{search}&quot;
                </div>
              )}
              {results.map((service) => (
                <Button
                  key={`${service.id}`}
                  variant="ghost"
                  className="group flex h-auto w-full flex-col items-start justify-start gap-1 p-3 text-left font-normal"
                  onClick={() => handleSelect(service)}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{service.label}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider px-1.5 py-0">
                        {service.categoryLabel}
                      </Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1 shrink-0" />
                  </div>
                  {service.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1 w-[90%]">{service.description}</span>
                  )}
                </Button>
              ))}
            </>
          ) : (
            // Default mode: Grouped by category
            <>
              {rates?.categories.map((cat) => (
                <div key={cat.id} className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {cat.label}
                  </div>
                  {cat.services.map((service) => (
                    <Button
                      key={service.id}
                      variant="ghost"
                      className="group flex h-auto w-full flex-col items-start justify-start gap-1 p-3 text-left font-normal"
                      onClick={() => handleSelect(service)}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-semibold text-sm">{service.label}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1 shrink-0" />
                      </div>
                      {service.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1 w-[90%]">
                          {service.description}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              ))}
              {rates?.uncategorized && rates.uncategorized.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Other
                  </div>
                  {rates.uncategorized.map((service) => (
                    <Button
                      key={service.id}
                      variant="ghost"
                      className="group flex h-auto w-full flex-col items-start justify-start gap-1 p-3 text-left font-normal"
                      onClick={() => handleSelect(service)}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-semibold text-sm">{service.label}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1 shrink-0" />
                      </div>
                      {service.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1 w-[90%]">
                          {service.description}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
