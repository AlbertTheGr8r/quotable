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
import { ThemeToggle } from "./ThemeToggle";

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
            <div
              key={project.id}
              className={cn(
                "group flex w-full items-center gap-1 p-1 rounded-md transition-colors",
                activeProjectId === project.id ? "bg-primary/10" : "hover:bg-muted/50",
              )}
            >
              <Button
                variant="ghost"
                className={cn(
                  "flex-1 justify-start h-9 px-2 font-medium text-sm truncate transition-all hover:bg-transparent",
                  activeProjectId === project.id ? "text-primary" : "text-foreground/80 hover:text-foreground",
                )}
                onClick={() => actions.setActiveProject(project.id)}
              >
                <span className="truncate">{project.name}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        activeProjectId === project.id && "opacity-100 text-primary",
                      )}
                    />
                  }
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => {
                      const newName = prompt("Enter new project name", project.name);
                      if (newName) actions.updateProject(project.id, { name: newName });
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      // TODO: Copy code logic
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
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

      <div className="p-4 border-t bg-muted/20 space-y-4">
        <div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Theme</div>
          <ThemeToggle />
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Settings</div>
          <CompanyProfileDialog />
        </div>
      </div>
    </div>
  );
}
