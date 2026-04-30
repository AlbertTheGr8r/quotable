import { describe, expect, it } from "vitest";
import { computeServiceCost } from "../index";
import { subdivisionService } from "./fixtures";

describe("Tiered Base + Unit Strategy (Residential Subdivision)", () => {
  it("computes base tier only", () => {
    const result = computeServiceCost(subdivisionService, 3);
    expect(result.subtotal).toBe(10000);
  });

  it("computes excess above threshold in higher tier", () => {
    const result = computeServiceCost(subdivisionService, 7);
    expect(result.subtotal).toBe(11500);
  });

  it("handles boundary transitions", () => {
    let result = computeServiceCost(subdivisionService, 4);
    expect(result.subtotal).toBe(10000);

    result = computeServiceCost(subdivisionService, 5);
    expect(result.subtotal).toBe(10500);
  });
});
