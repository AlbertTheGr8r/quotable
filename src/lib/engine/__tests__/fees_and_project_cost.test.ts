import { describe, expect, it } from "vitest";
import { computeProjectCost, computeServiceCost } from "../index";
import { establishmentFeeService } from "./fixtures";

describe("Fees and Project Cost Wrapper", () => {
  it("computes fixed flat base cost", () => {
    const serviceCost = computeServiceCost(establishmentFeeService, 1);
    expect(serviceCost.subtotal).toBe(0);

    // In our new architecture, the establishment fee might have service-level fees,
    // but the test here simulates a 1,000 minimum fee at the project level.
    const projectFees = [
      {
        id: "court_appearance",
        label: "Court Appearance",
        type: "percentage_of_total" as const,
        value: 0.01,
        minimum: 1000,
        category: "misc" as const,
      },
    ];

    const result = computeProjectCost([serviceCost], projectFees);
    expect(result.base_service_cost).toBe(0);
    expect(result.additional_costs?.misc).toBe(1000); // 1000 minimum fee applied
    expect(result.total_project_cost).toBe(1000);
  });

  it("applies percentage when it exceeds minimum", () => {
    const highBaseService = { ...establishmentFeeService, base_fee: 200000 };
    const serviceCost = computeServiceCost(highBaseService, 1);

    const projectFees = [
      {
        id: "court_appearance",
        label: "Court Appearance",
        type: "percentage_of_total" as const,
        value: 0.01,
        minimum: 1000,
        category: "misc" as const,
      },
    ];

    const result = computeProjectCost([serviceCost], projectFees);
    expect(result.base_service_cost).toBe(200000);
    expect(result.additional_costs?.misc).toBe(2000); // 1% of 200,000
    expect(result.total_project_cost).toBe(202000);
  });
});
