"use client";

import { Check, HelpCircle, Pencil, Plus, Share2, Trash2, ChevronDown, Upload } from "lucide-react";
import { useState, useEffect, useRef, useId } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useYamlData } from "@/hooks/use-yaml-data";
import { useProjectStore, ProjectCodec } from "@/stores/project-store";
import { YamlStorage, type YamlRecord } from "@/lib/storage/idb";
import { QuoteCard } from "./QuoteCard";
import { ServiceSelector } from "./ServiceSelector";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

export function QuoteBuilder() {
  const { projects, activeProjectId, actions } = useProjectStore();
  const project = projects.find((p) => p.id === activeProjectId);
  const { data: rates } = useYamlData(project?.yamlUrl || "");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const yamlUploadId = useId();

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Rate Schedules State
  const [availableRates, setAvailableRates] = useState<{ id: string; title: string; url: string }[]>([]);
  const [customRates, setCustomRates] = useState<YamlRecord[]>([]);

  useEffect(() => {
    fetch("/rates/index.json")
      .then((res) => res.json())
      .then((data) => setAvailableRates(data))
      .catch((err) => console.error("Failed to load rates index", err));

    YamlStorage.getAllYamls().then((yamls) => setCustomRates(yamls.slice(0, 3)));
  }, []);

  const handleStartEdit = () => {
    if (project) {
      setEditedName(project.name);
      setIsEditingName(true);
    }
  };

  const handleSaveName = () => {
    if (project && editedName.trim()) {
      actions.updateProject(project.id, { name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
  };

  const handleShare = () => {
    if (project) {
      const code = ProjectCodec.encode(project);
      const url = new URL(window.location.href);
      url.searchParams.set("p", code);
      navigator.clipboard.writeText(url.toString());
      alert("Project link copied to clipboard!");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      const id = `custom-${nanoid()}`;
      const name = file.name.replace(".yaml", "").replace(".yml", "");
      await YamlStorage.saveYaml(id, name, text);
      
      const updatedCustom = await YamlStorage.getAllYamls();
      setCustomRates(updatedCustom.slice(0, 3));
      
      if (project) {
        actions.updateProject(project.id, { yamlUrl: `local://${id}` });
      }
    }
  };

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
      <header className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  onBlur={handleCancelEdit}
                  className="text-2xl font-bold h-10 px-2 min-w-[200px]"
                  autoFocus
                />
              </div>
            ) : (
              <h1 className="text-3xl font-bold tracking-tight truncate">
                <button 
                  type="button"
                  className="hover:text-primary transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  onClick={handleStartEdit}
                  aria-label="Rename project"
                >
                  {project.name}
                </button>
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              size="sm" 
              variant="outline" 
              className={cn(
                "font-bold transition-all",
                isEditingName 
                  ? "border-success text-success hover:bg-success hover:text-success-foreground" 
                  : "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
              )}
              onMouseDown={isEditingName ? (e) => e.preventDefault() : undefined}
              onClick={isEditingName ? handleSaveName : handleStartEdit}
            >
              {isEditingName ? (
                <>
                  <Check className="h-4 w-4 mr-2" /> SAVE
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" /> RENAME
                </>
              )}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              disabled={isEditingName}
              className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground font-bold transition-all"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" /> SHARE
            </Button>

            <Button 
              size="sm" 
              variant="outline" 
              disabled={isEditingName}
              className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold transition-all"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> DELETE
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm" className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground flex items-center gap-1" />
                }
              >
                <span>{rates?.meta.title || "Select rate schedule..."}</span>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {customRates.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Custom YAMLs</div>
                    {customRates.map((r) => (
                      <DropdownMenuItem 
                        key={r.id} 
                        onClick={() => actions.updateProject(project.id, { yamlUrl: `local://${r.id}` })}
                      >
                        <Check className={cn("h-4 w-4 mr-2 opacity-0", project.yamlUrl === `local://${r.id}` && "opacity-100")} />
                        <span className="truncate">{r.name}</span>
                      </DropdownMenuItem>
                    ))}
                    <div className="h-px bg-muted my-1" />
                  </>
                )}
                
                <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">System Rates</div>
                {availableRates.map((r) => (
                  <DropdownMenuItem 
                    key={r.id} 
                    onClick={() => actions.updateProject(project.id, { yamlUrl: r.url })}
                  >
                    <Check className={cn("h-4 w-4 mr-2 opacity-0", project.yamlUrl === r.url && "opacity-100")} />
                    <span className="truncate">{r.title}</span>
                  </DropdownMenuItem>
                ))}
                
                <div className="h-px bg-muted my-1" />
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Import custom YAML...</span>
                  <input 
                    ref={fileInputRef}
                    id={yamlUploadId} 
                    type="file" 
                    accept=".yaml,.yml" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                className="w-full h-32 border-dashed flex flex-col gap-2 bg-muted/5 hover:bg-muted/10 transition-all border-2 group cursor-pointer"
              />
            }
          >
            <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-muted-foreground group-hover:text-primary font-medium transition-colors">Add Service</span>
          </DialogTrigger>
          <DialogContent className="max-w-2xl p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Add a Service</DialogTitle>
            </DialogHeader>
            <ServiceSelector rates={rates} onSelect={() => setIsSelectorOpen(false)} projectId={project.id} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="h-32" /> {/* Spacer for scrollability */}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{project.name}" and all its quote items.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                actions.deleteProject(project.id);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
