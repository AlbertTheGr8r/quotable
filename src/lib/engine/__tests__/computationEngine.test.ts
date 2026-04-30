import { describe, expect, test } from "vitest";
import type { Service } from "../../schema/rates";
import { ComputationEngine } from "../index";

const lookupService: Service = {
  id: "relocation",
  label: "Relocation",
  unit_type: "area",
  unit: "ha",
  unit_display: "ha",
  strategy: "lookup_table",
  table: {
    columns: [0, 10, 20, 30, 40, 50, 60],
    row_logic: [
      { id: "lt0.5", min: 0, max: 0.499 },
      { id: "0.5-1", min: 0.5, max: 1 },
      { id: "2", min: 2, max: 2 },
      { id: "3", min: 3, max: 3 },
      { id: "4", min: 4, max: 4 },
      { id: "5", min: 5, max: 5 },
      { id: "6", min: 6, max: 6 },
      { id: "7", min: 7, max: 7 },
      { id: "8", min: 8, max: 8 },
      { id: "9", min: 9, max: 9 },
      { id: "10", min: 10, max: 10 },
    ],
    rows: {
      "lt0.5": [25000, 0, 0, 0, 0, 0, 0],
      "0.5-1": [30000, 128500, 212000, 282000, 344500, 403000, 466500],
      "2": [40000, 137000, 219000, 289000, 351000, 409500, 471500],
      "3": [50000, 145500, 226000, 296000, 357500, 416000, 476500],
      "4": [60000, 154000, 233000, 303000, 364000, 422500, 481500],
      "5": [70000, 162500, 240000, 303000, 364000, 429000, 486500],
      "6": [80000, 171000, 247000, 310000, 370500, 435500, 491500],
      "7": [90000, 179500, 254000, 317000, 377000, 442000, 496500],
      "8": [100000, 188000, 261000, 324000, 383500, 448500, 501500],
      "9": [110000, 196500, 268000, 331000, 390000, 455000, 506500],
      "10": [120000, 205000, 275000, 338000, 396500, 461500, 511500],
    },
    excess_rate: 5000,
    excess_threshold: 70,
  },
  modifiers: [
    {
      id: "land-use",
      label: "Land Use",
      type: "percentage_add",
      options: [
        { id: "agricultural", label: "Agri", value: 0 },
        { id: "commercial", label: "Comm", value: 1.5 },
      ],
      default_option_id: "agricultural",
    },
  ],
};

const tieredBaseService: Service = {
  id: "subdivision",
  label: "Subdivision",
  unit_type: "count",
  unit: "lot",
  unit_display: "lots",
  strategy: "tiered_base_plus_unit",
  tiered_base: {
    tiers: [
      { range: [2, 4], base: 38000, per_unit: 12000, excess_above: 2 },
      { range: [5, 9], base: 62000, per_unit: 11500, excess_above: 5 },
      { range: [10, 19], base: 108000, per_unit: 11000, excess_above: 10 },
      { range: [20, 49], base: 218000, per_unit: 11000, excess_above: 20 },
    ],
  },
};

const tieredPerUnitService: Service = {
  id: "topo",
  label: "Topo",
  unit_type: "area",
  unit: "ha",
  unit_display: "ha",
  strategy: "tiered_per_unit",
  tiered_per: {
    parameters: [
      {
        id: "contour",
        label: "Contour",
        type: "select",
        options: [
          { id: "0.5m", label: "0.5m", rates: [50000, 30000, 20000, 15000] },
          { id: "1.0m", label: "1.0m", rates: [45000, 25000, 15000, 10000] },
        ],
      },
    ],
    tiers: [
      { label: "First 1", up_to: 1 },
      { label: "Next 9", up_to: 10 },
      { label: "Next 10", up_to: 20 },
      { label: "Excess", up_to: null },
    ],
  },
};

const flatPerUnitService: Service = {
  id: "route",
  label: "Route",
  unit_type: "length",
  unit: "km",
  unit_display: "km",
  strategy: "flat_per_unit",
  flat_rates: {
    rates: {
      road_centerline: 40000,
      parcellary: 180000,
    },
  },
};

describe("Computation Engine - Exact Match Tests", () => {
  test("lookup_table — 10 ha (bug fix)", () => {
    const { subtotal } = ComputationEngine.computeBase(lookupService, 10, {});
    expect(subtotal.cents).toBe(12000000); // ₱120,000
  });

  test("lookup_table — 26 ha, agricultural", () => {
    const { subtotal } = ComputationEngine.computeBase(lookupService, 26, {});
    expect(subtotal.cents).toBe(24700000); // ₱247,000
  });

  test("lookup_table — 0.5 ha", () => {
    const { subtotal } = ComputationEngine.computeBase(lookupService, 0.5, {});
    expect(subtotal.cents).toBe(3000000); // ₱30,000
  });

  test("lookup_table — 70 ha (last column)", () => {
    const { subtotal } = ComputationEngine.computeBase(lookupService, 70, {});
    expect(subtotal.cents).toBe(51150000); // ₱511,500
  });

  test("lookup_table — 71 ha (excess)", () => {
    const { subtotal } = ComputationEngine.computeBase(lookupService, 71, {});
    expect(subtotal.cents).toBe(51650000); // ₱511,500 + ₱5,000
  });

  test("lookup_table — land use commercial (+150%)", () => {
    const { subtotal } = ComputationEngine.computeBase(lookupService, 10, {});
    const { total } = ComputationEngine.applyModifiers(subtotal, lookupService, { "land-use": "commercial" });
    expect(total.cents).toBe(30000000); // ₱120,000 + ₱180,000
  });

  test("tiered_base_plus_unit — 45 lots", () => {
    const { subtotal } = ComputationEngine.computeBase(tieredBaseService, 45, {});
    // range 20-49: base 218000, per_unit 11000, excess_above 20
    // 218000 + (45 - 20) * 11000 = 218000 + 275000 = 493000
    expect(subtotal.cents).toBe(49300000); // ₱493,000
  });

  test("tiered_per_unit — 26 ha @1.0m contour", () => {
    const { subtotal } = ComputationEngine.computeBase(tieredPerUnitService, 26, { contour: "1.0m" });
    // 1*45000 + 9*25000 + 10*15000 + 6*10000 = 45000 + 225000 + 150000 + 60000 = 480000
    expect(subtotal.cents).toBe(48000000); // ₱480,000
  });

  test("tiered_per_unit — 1 ha (minimum fee)", () => {
    const { subtotal } = ComputationEngine.computeBase(tieredPerUnitService, 1, { contour: "0.5m" });
    // 1*50000
    expect(subtotal.cents).toBe(5000000); // ₱50,000
  });

  test("flat_per_unit — road_centerline x 5 km", () => {
    const { subtotal } = ComputationEngine.computeBase(flatPerUnitService, 5, { road_centerline: "true" });
    // 5 * 40000
    expect(subtotal.cents).toBe(20000000); // ₱200,000
  });
});
