"use client";

import { MoreVertical, Pencil, Plus, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/stores/project-store";
import { CompanyProfileDialog } from "./CompanyProfileDialog";

export function ProjectSidebar() {
  const { projects, activeProjectId, actions } = useProjectStore();

  const handleCreateProject = () => {
    const name = `Project ${projects.length + 1}`;
    actions.createProject(name, "/rates/gepi-2020-2023.yaml");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">Projects</h2>
        <Button size="icon" variant="ghost" onClick={handleCreateProject}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {projects.length === 0 && (
            <div className="text-center p-8 text-muted-foreground text-sm">No projects yet. Click the + to start.</div>
          )}

          {projects.map((project) => (
            // biome-ignore lint: nested buttons require div with role='button'
            <div
              key={project.id}
              role="button"
              tabIndex={0}
              className={cn(
                "group flex w-full items-center gap-2 p-2 px-3 rounded-md cursor-pointer transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-primary",
                activeProjectId === project.id ? "bg-primary/10 text-primary" : "hover:bg-muted",
              )}
              onClick={() => actions.setActiveProject(project.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  actions.setActiveProject(project.id);
                }
              }}
            >
              <div className="flex-1 truncate font-medium text-sm">{project.name}</div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      const newName = prompt("Enter new project name", project.name);
                      if (newName) actions.updateProject(project.id, { name: newName });
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Copy code logic
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.deleteProject(project.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/20">
        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Settings</div>
        <CompanyProfileDialog />
      </div>
    </div>
  );
}
