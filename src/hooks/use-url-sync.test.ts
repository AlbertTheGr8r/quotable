import { renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type Project, ProjectCodec, type ProjectState } from "@/stores/project-store";
import { useUrlSync } from "./use-url-sync";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
  }),
}));

let storeState = { projects: [] as Project[], activeProjectId: null as string | null };
const mockActions = {
  createProject: vi.fn(),
  deleteProject: vi.fn(),
  updateProject: vi.fn(),
  setActiveProject: vi.fn(),
  addQuoteItem: vi.fn(),
  removeQuoteItem: vi.fn(),
  updateQuoteItem: vi.fn(),
};

// Fixed mock to handle selectors and spread properly
vi.mock("@/stores/project-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/stores/project-store")>();
  return {
    ...actual,
    useProjectStore: Object.assign(
      (selector?: (state: ProjectState) => unknown) => {
        const state = { ...storeState, actions: mockActions };
        return selector ? selector(state) : state;
      },
      {
        getState: () => ({ ...storeState, actions: mockActions }),
        setState: vi.fn((fn) => {
          storeState = { ...storeState, ...fn(storeState) };
        }),
      },
    ),
  };
});

describe("useUrlSync", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Using vi.stubGlobal is the cleanest way to mock location in Vitest
    vi.stubGlobal("location", {
      ...originalLocation,
      search: "",
      href: "http://localhost/",
      assign: vi.fn(),
      replace: vi.fn(),
    });

    // Mock history methods
    vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});

    // Reset store state
    storeState = { projects: [], activeProjectId: null };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const createDummyProject = (id: string, name: string, dateStr: string): Project => ({
    id,
    name,
    yamlUrl: "/rates/test.yaml",
    createdAt: dateStr,
    updatedAt: dateStr,
    quoteItems: [],
  });

  it("should update URL with pushState on active project change", () => {
    const project = createDummyProject("test-1", "Local Project", "2026-04-30T00:00:00Z");
    storeState = {
      projects: [project],
      activeProjectId: "test-1",
    };

    renderHook(() => useUrlSync());

    const expectedPayload = ProjectCodec.encode(project);
    expect(window.history.pushState).toHaveBeenCalledWith(
      null,
      "",
      `http://localhost/?p=${encodeURIComponent(expectedPayload)}`,
    );
  });

  it("should load newer project from URL on mount", () => {
    const localProject = createDummyProject("test-1", "Local Project", "2026-04-20T00:00:00Z");
    storeState = {
      projects: [localProject],
      activeProjectId: null,
    };

    const urlProject = createDummyProject("test-1", "URL Project", "2026-04-30T00:00:00Z");
    const payload = ProjectCodec.encode(urlProject);

    // Update the stubbed location search
    window.location.search = `?p=${payload}`;

    renderHook(() => useUrlSync());

    // Should NOT use actions.updateProject (which would overwrite updatedAt)
    // Instead uses setState directly, so check storeState was updated
    expect(storeState.projects[0].name).toBe("URL Project");
    expect(storeState.activeProjectId).toBe("test-1");
    expect(toast).not.toHaveBeenCalled();
  });

  it("should prompt user when local project is newer than URL", () => {
    // Local project is NEWER
    const localProject = createDummyProject("test-1", "Local Project", "2026-04-30T00:00:00Z");
    storeState = {
      projects: [localProject],
      activeProjectId: null,
    };

    // URL project is OLDER
    const urlProject = createDummyProject("test-1", "URL Project", "2026-04-20T00:00:00Z");
    const payload = ProjectCodec.encode(urlProject);
    window.location.search = `?p=${payload}`;

    renderHook(() => useUrlSync());

    // Should ask the user via toast
    expect(toast).toHaveBeenCalledWith("A newer version of this project exists locally.", expect.any(Object));

    // Store should not be overwritten yet
    expect(mockActions.updateProject).not.toHaveBeenCalled();
  });

  it("should fail gracefully when the URL payload is corrupt", () => {
    window.location.search = "?p=!!!NotBase64!!!";

    renderHook(() => useUrlSync());

    expect(mockActions.updateProject).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Failed to parse project from URL.");
  });

  it("should do nothing if no project parameter is present", () => {
    window.location.search = "";

    renderHook(() => useUrlSync());

    expect(mockActions.updateProject).not.toHaveBeenCalled();
    expect(mockActions.setActiveProject).not.toHaveBeenCalled();
  });

  it("should simply set active if timestamps are identical", () => {
    const project = createDummyProject("test-1", "Local Project", "2026-04-30T00:00:00Z");
    storeState = {
      projects: [project],
      activeProjectId: null,
    };

    const payload = ProjectCodec.encode(project);
    window.location.search = `?p=${payload}`;

    renderHook(() => useUrlSync());

    expect(mockActions.updateProject).not.toHaveBeenCalled();
    expect(mockActions.setActiveProject).toHaveBeenCalledWith("test-1");
  });

  it("should import a completely new project from the URL", () => {
    storeState = {
      projects: [],
      activeProjectId: null,
    };

    const newProject = createDummyProject("test-999", "Shared Project", "2026-04-30T00:00:00Z");
    const payload = ProjectCodec.encode(newProject);
    window.location.search = `?p=${payload}`;

    renderHook(() => useUrlSync());

    // Should call the custom setState logic we mocked
    expect(storeState.projects).toContainEqual(newProject);
    expect(storeState.activeProjectId).toBe("test-999");
  });
});
