import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ProjectCodec, useProjectStore } from "@/stores/project-store";

export function useUrlSync() {
  const { projects, activeProjectId, actions } = useProjectStore();
  const project = projects.find((p) => p.id === activeProjectId);
  const isInitialMount = useRef(true);

  // 1. Initial Load: Read URL and reconcile with LocalStorage
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const urlParams = new URLSearchParams(window.location.search);
    const pParam = urlParams.get("p");

    if (pParam) {
      const urlProject = ProjectCodec.decode(pParam);
      if (urlProject) {
        // Find existing project in local storage
        const localProject = useProjectStore.getState().projects.find((p) => p.id === urlProject.id);

        if (!localProject) {
          useProjectStore.setState((state) => ({
            projects: [...state.projects, urlProject],
            activeProjectId: urlProject.id,
          }));
        } else {
          const urlDate = new Date(urlProject.updatedAt).getTime();
          const localDate = new Date(localProject.updatedAt).getTime();

          if (urlDate > localDate) {
            useProjectStore.setState((state) => ({
              projects: state.projects.map((p) =>
                p.id === localProject.id ? { ...p, ...urlProject } : p
              ),
              activeProjectId: localProject.id,
            }));
          } else if (localDate > urlDate) {
            // Local is newer, ask user
            toast("A newer version of this project exists locally.", {
              action: {
                label: "Load Newest",
                onClick: () => {
                  actions.setActiveProject(localProject.id);
                  // Update URL immediately
                  const newPayload = ProjectCodec.encode(localProject);
                  window.history.replaceState(null, "", `?p=${newPayload}`);
                },
              },
              duration: Infinity,
            });
          } else {
            // They are equal, just set active
            actions.setActiveProject(localProject.id);
          }
        }
      } else {
        toast.error("Failed to parse project from URL.");
      }
    }
  }, [actions]);

  // 2. Autosave: Update URL when active project changes
  useEffect(() => {
    if (isInitialMount.current) return;

    if (project) {
      const currentUrlParams = new URLSearchParams(window.location.search);
      const currentP = currentUrlParams.get("p");
      const newP = ProjectCodec.encode(project);

      if (currentP !== newP) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("p", newP);

        // We use pushState only if the URL didn't have a 'p' param yet,
        // which means it's a new project selection context.
        if (!currentP) {
          window.history.pushState(null, "", newUrl.toString());
        } else {
          window.history.replaceState(null, "", newUrl.toString());
        }
      }
    }
  }, [project]); // Dependency on the active project object so any change triggers this
}