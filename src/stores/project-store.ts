import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface QuoteItem {
  id: string;
  serviceId: string;
  quantity: number;
  unit: string;
  params: Record<string, string>;
  modifiers: Record<string, string>;
}

export interface Project {
  id: string;
  name: string;
  authorName?: string;
  yamlUrl: string;
  yamlHash?: string;
  createdAt: string;
  updatedAt: string;
  quoteItems: QuoteItem[];
}

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  actions: {
    createProject: (name: string, yamlUrl: string) => void;
    deleteProject: (id: string) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    setActiveProject: (id: string | null) => void;
    addQuoteItem: (projectId: string, item: Omit<QuoteItem, "id">) => void;
    removeQuoteItem: (projectId: string, itemId: string) => void;
    updateQuoteItem: (projectId: string, itemId: string, updates: Partial<QuoteItem>) => void;
  };
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [
        {
          id: "project-1",
          name: "Project 1",
          yamlUrl: "/rates/gepi-2020-2023.yaml",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          quoteItems: [],
        },
      ],
      activeProjectId: "project-1",
      actions: {
        createProject: (name, yamlUrl) => {
          const newProject: Project = {
            id: nanoid(),
            name,
            yamlUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            quoteItems: [],
          };
          set((state) => ({
            projects: [...state.projects, newProject],
            activeProjectId: newProject.id,
          }));
        },
        deleteProject: (id) => {
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
          }));
        },
        updateProject: (id, updates) => {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
            ),
          }));
        },
        setActiveProject: (id) => set({ activeProjectId: id }),
        addQuoteItem: (projectId, item) => {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    quoteItems: [...p.quoteItems, { ...item, id: nanoid() }],
                    updatedAt: new Date().toISOString(),
                  }
                : p,
            ),
          }));
        },
        removeQuoteItem: (projectId, itemId) => {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    quoteItems: p.quoteItems.filter((i) => i.id !== itemId),
                    updatedAt: new Date().toISOString(),
                  }
                : p,
            ),
          }));
        },
        updateQuoteItem: (projectId, itemId, updates) => {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    quoteItems: p.quoteItems.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
                    updatedAt: new Date().toISOString(),
                  }
                : p,
            ),
          }));
        },
      },
    }),
    {
      name: "quotable-projects",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    },
  ),
);

/**
 * Base64 Codec for Project Portability
 */
export const ProjectCodec = {
  encode: (project: Project): string => {
    try {
      const json = JSON.stringify(project);
      return btoa(unescape(encodeURIComponent(json)));
    } catch (e) {
      console.error("Failed to encode project", e);
      return "";
    }
  },
  decode: (blob: string): Project | null => {
    try {
      const json = decodeURIComponent(escape(atob(blob)));
      return JSON.parse(json);
    } catch (e) {
      console.error("Failed to decode project", e);
      return null;
    }
  },
};
