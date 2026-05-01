import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRateData } from "../use-rate-data";

// Mock RateStorage
vi.mock("@/lib/storage/idb", () => ({
  RateStorage: {
    getRate: vi.fn(),
  },
}));

describe("useRateData hook", () => {
  it("migrates legacy .yaml URL to .json dist asset", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ meta: { title: "Test" }, categories: [] }),
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useRateData("/rates/gepi-2020-2023.yaml"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith("/rates/dist/gepi-2020-2023.json");
    expect(result.current.data?.meta.title).toBe("Test");
  });

  it("throws error for non-JSON response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "text/yaml" }),
      text: () => Promise.resolve("meta: title: test"),
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useRateData("/some/yaml/file.yaml"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toContain("Server returned non-JSON response");
  });

  it("handles fetch errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    });

    const { result } = renderHook(() => useRateData("/not-found.json"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toContain("Failed to fetch rates: Not Found");
  });
});
