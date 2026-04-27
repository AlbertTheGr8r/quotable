"use client";

import { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { useYamlData } from '@/hooks/use-yaml-data';
import { Button } from '@/components/ui/button';
import { Plus, HelpCircle } from 'lucide-react';
import { QuoteCard } from './QuoteCard';
import { ServiceSelector } from './ServiceSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function QuoteBuilder() {
  const { projects, activeProjectId } = useProjectStore();
  const project = projects.find(p => p.id === activeProjectId);
  const { data: rates, loading } = useYamlData(project?.yamlUrl || '');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-muted/5">
        <HelpCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h3 className="text-xl font-semibold mb-2">No project selected</h3>
        <p className="text-muted-foreground max-w-xs">
          Select a project from the sidebar to start building your quote.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{rates?.meta.title || 'Loading rate schedule...'}</span>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {project.quoteItems.map((item) => (
          <QuoteCard key={item.id} project={project} item={item} rates={rates} />
        ))}

        <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
          <DialogTrigger 
            render={
              <Button
                variant="outline"
                className="w-full h-32 border-dashed flex flex-col gap-2 bg-muted/5 hover:bg-muted/10 transition-all border-2"
              >
                <Plus className="h-8 w-8 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Add Service</span>
              </Button>
            }
          />
          <DialogContent className="max-w-2xl p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Add a Service</DialogTitle>
            </DialogHeader>
            <ServiceSelector 
              rates={rates} 
              onSelect={() => setIsSelectorOpen(false)} 
              projectId={project.id}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="h-32" /> {/* Spacer for scrollability */}
    </div>
  );
}
