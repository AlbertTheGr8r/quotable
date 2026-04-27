"use client";

import React, { useState, useMemo } from 'react';
import { useProjectStore } from '@/stores/project-store';
import type { RateFile, Service } from '@/lib/schema/rates';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronRight, Tag } from 'lucide-react';
import Fuse from 'fuse.js';

interface ServiceSelectorProps {
  rates: RateFile | null;
  projectId: string;
  onSelect: () => void;
}

export function ServiceSelector({ rates, projectId, onSelect }: ServiceSelectorProps) {
  const [search, setSearch] = useState('');
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
        flat.push({ ...service, categoryLabel: 'Other' });
      }
    }
    
    return flat;
  }, [rates]);

  const fuse = useMemo(() => 
    new Fuse(allServices, {
      keys: ['label', 'description', 'categoryLabel'],
      threshold: 0.3,
    }),
  [allServices]);

  const results = useMemo(() => {
    if (!search) return allServices;
    return fuse.search(search).map(r => r.item);
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
        <div className="p-2">
          {results.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No services found matching "{search}"
            </div>
          )}
          
          {results.map((service, idx) => (
            <div
              key={`${service.id}-${idx}`}
              className="group flex flex-col p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border mb-1"
              onClick={() => handleSelect(service)}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{service.label}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground uppercase font-bold tracking-wider">
                      {(service as any).categoryLabel}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {service.description || `Based on ${service.unit_display}`}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
