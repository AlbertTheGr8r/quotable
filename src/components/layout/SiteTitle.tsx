"use client";

import { useEffect } from "react";
import { type Project, useProjectStore } from "@/stores/project-store";

const DEFAULT_PROJECT_ID = "project-1";
const DEFAULT_PROJECT_NAME = "Project 1";

function isDefaultProject(project: Project | undefined, activeProjectId: string | null): boolean {
  if (!project) return false;
  if (activeProjectId !== DEFAULT_PROJECT_ID) return false;

  const isUnmodified = project.name === DEFAULT_PROJECT_NAME && project.quoteItems.length === 0;

  return isUnmodified;
}

export function SiteTitle() {
  const { projects, activeProjectId } = useProjectStore();

  const project = projects.find((p) => p.id === activeProjectId);
  const noProjectSelected = !project;
  const isDefault = isDefaultProject(project, activeProjectId);

  useEffect(() => {
    let title: string;

    if (noProjectSelected || isDefault) {
      title = "Quotable: Rates and Services Fees";
    } else {
      title = `Quotable - ${project.name}`;
    }

    document.title = title;
  }, [project, noProjectSelected, isDefault]);

  return null;
}
