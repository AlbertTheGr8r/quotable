import { describe, expect, it } from "vitest";
import { computeServiceCost } from "../index";
import { topoService } from "./fixtures";

describe("Tiered Per Unit Strategy (Topographic Survey)", () => {
  it("computes first tier only with specific parameter", () => {
    const result = computeServiceCost(topoService, 3, { parameters: { contour: "0.5m" } });
    expect(result.subtotal).toBe(15000);
  });

  it("computes spanning multiple tiers", () => {
    const result = computeServiceCost(topoService, 12, { parameters: { contour: "1.0m" } });
    expect(result.subtotal).toBe(41000);
  });

  it("applies modifiers properly", () => {
    const result = computeServiceCost(topoService, 12, {
      parameters: { contour: "1.0m" },
      modifiers: { slope: "steep" },
    });
    expect(result.subtotal).toBe(41000);
    expect(result.total).toBe(61500);
  });
});
