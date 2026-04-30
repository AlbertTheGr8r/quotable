import { describe, expect, it } from "vitest";
import { computeProjectCost, computeServiceCost } from "../index";
import { relocationService } from "./fixtures";

describe("Lookup Table Strategy (Relocation Survey)", () => {
  it("computes exact match row/col lookup correctly", () => {
    const serviceCost = computeServiceCost(relocationService, 10);
    const result = computeProjectCost([serviceCost]);
    expect(result.base_service_cost).toBe(10000);
    expect(result.total_project_cost).toBe(10000);
  });

  it("handles rounding behavior and modifiers", () => {
    const serviceCost = computeServiceCost(relocationService, 25.4, { modifiers: { land_use: "commercial" } });
    const result = computeProjectCost([serviceCost]);
    expect(result.base_service_cost).toBe(17500);
    expect(result.total_project_cost).toBe(26250);
  });
});
