import { describe, expect, test } from "vitest";
import type { Service } from "../../schema/rates";
import { computeServiceCost } from "../index";

const staffService: Service = {
  id: "staff-rates",
  label: "Staff Rates",
  unit_type: "time",
  unit: "hour",
  unit_display: "hours",
  strategy: "time_based",
  time_based: {
    roles: {
      director: 1000,
      manager: 500,
      staff: 200,
    },
    minimum_hours: 4,
  },
};

describe("Computation Engine - Time Based Strategy", () => {
  test("calculates correctly with default role (first role)", () => {
    const result = computeServiceCost(staffService, 10);
    // 10 hours * 1000 (director) = 10000
    expect(result.total).toBe(10000);
    expect(result.baseLineItems[0].id).toBe("director");
  });

  test("calculates correctly with specific role", () => {
    const result = computeServiceCost(staffService, 10, { parameters: { role: "manager" } });
    // 10 hours * 500 = 5000
    expect(result.total).toBe(5000);
    expect(result.baseLineItems[0].id).toBe("manager");
  });

  test("respects minimum hours", () => {
    const result = computeServiceCost(staffService, 2, { parameters: { role: "staff" } });
    // 2 hours < 4 minimum hours, so 4 * 200 = 800
    expect(result.total).toBe(800);
    expect(result.baseLineItems[0].quantity).toBe(4);
  });
});
