import { describe, expect, it } from "vitest";
import type { Fee } from "../../schema/rates";
import { computeProjectCost, computeServiceCost } from "../index";
import { relocationService, subdivisionService } from "./fixtures";

describe("Multi-Service Integration & Modifier Stacking", () => {
  it("computes a multi-service project correctly", () => {
    const relocationCost = computeServiceCost(relocationService, 10); // Base = 10000
    const subdivisionCost = computeServiceCost(subdivisionService, 4); // Base = 10000

    const projectFees: Fee[] = [
      {
        id: "mobilization",
        label: "Mobilization",
        type: "flat",
        value: 5000,
        category: "mobilization",
      },
      {
        id: "tax",
        label: "Local Tax",
        type: "percentage_of_total",
        value: 0.1, // 10%
        category: "misc",
      },
    ];

    const projectCost = computeProjectCost([relocationCost, subdivisionCost], projectFees);

    expect(projectCost.base_service_cost).toBe(20000); // 10k + 10k
    expect(projectCost.additional_costs?.mobilization).toBe(5000);
    // 20000 + 5000 = 25000. 10% tax = 2500.
    expect(projectCost.additional_costs?.misc).toBe(2500);
    expect(projectCost.total_project_cost).toBe(27500);
  });

  it("locks non-compounding modifier stacking behavior", () => {
    // If we apply multiple modifiers, they should apply to the *original* subtotal independently.
    // Let's create a temporary service with multiple percentage modifiers
    const tempService = {
      ...relocationService,
      modifiers: [
        {
          id: "mod1",
          label: "Mod 1",
          type: "percentage_add" as const,
          options: [{ id: "opt1", label: "Opt1", value: 0.5 }], // 50%
        },
        {
          id: "mod2",
          label: "Mod 2",
          type: "percentage_add" as const,
          options: [{ id: "opt2", label: "Opt2", value: 0.5 }], // 50%
        },
      ],
    };

    const cost = computeServiceCost(tempService, 10, {
      modifiers: { mod1: "opt1", mod2: "opt2" },
    });

    // Subtotal is 10000.
    // mod1 adds 5000 (10000 * 0.5).
    // mod2 adds 5000 (10000 * 0.5).
    // Total should be 20000, NOT 22500 (which would be if they compounded: 10000 * 1.5 * 1.5).
    expect(cost.subtotal).toBe(10000);
    expect(cost.total).toBe(20000);
    expect(cost.modifiers.length).toBe(2);
    expect(cost.modifiers[0].amount).toBe(5000);
    expect(cost.modifiers[1].amount).toBe(5000);
  });

  it("computes minimum + compounding interaction correctly", () => {
    const dummyServiceCost = {
      serviceId: "dummy",
      baseLineItems: [],
      subtotal: 5000,
      modifiers: [],
      total: 5000,
      formattedSubtotal: "5,000.00",
      formattedTotal: "5,000.00",
      warnings: [],
    };

    const projectFees: Fee[] = [
      {
        id: "fee_a",
        label: "Fee A",
        type: "percentage_of_total" as const,
        value: 0.1, // 10%
        minimum: 1000, // min 1000
        category: "misc" as const,
        priority: 1, // runs first
      },
      {
        id: "fee_b",
        label: "Fee B",
        type: "percentage_of_total" as const,
        value: 0.1, // 10%
        category: "misc" as const,
        priority: 2, // runs second
      },
    ];

    const result = computeProjectCost([dummyServiceCost], projectFees);

    expect(result.base_service_cost).toBe(5000);
    // fee A adds 1000 (because 10% of 5k is 500 < 1000)
    // total is now 6000
    // fee B adds 600 (10% of 6000)
    expect(result.additional_costs?.misc).toBe(1600);
    expect(result.total_project_cost).toBe(6600);
  });
});
