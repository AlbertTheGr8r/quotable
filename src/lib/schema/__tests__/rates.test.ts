import yaml from "js-yaml";

import { describe, expect, it } from "vitest";

import { IndexSchema, ModifierSchema, RateFileSchema } from "../rates";

describe("ModifierSchema", () => {
  it("should accept percentage_add with value <= 1", () => {
    const result = ModifierSchema.safeParse({
      id: "test",
      label: "Test Modifier",
      type: "percentage_add",
      options: [{ id: "opt1", label: "Option 1", value: 0.5 }],
    });
    expect(result.success).toBe(true);
  });

  it("should accept percentage_add with value > 1 (e.g., 150%)", () => {
    const result = ModifierSchema.safeParse({
      id: "test",
      label: "Test Modifier",
      type: "percentage_add",
      options: [{ id: "opt1", label: "Commercial", value: 1.5 }],
    });
    expect(result.success).toBe(true);
  });

  it("should accept multiplier with value > 1", () => {
    const result = ModifierSchema.safeParse({
      id: "test",
      label: "Test Modifier",
      type: "multiplier",
      options: [{ id: "opt1", label: "Option 1", value: 1.5 }],
    });
    expect(result.success).toBe(true);
  });
});

describe("RateFileSchema validation with real YAML", () => {
  it("should validate the GEPI 2020-2023 rates file", () => {
    const yamlContent = `
meta:
  title: "Test Rates"
  version: "2020-2023"
  currency: "PHP"
  vat_rate: 0.12

units:
  area:
    canonical: ha
    units:
      ha:
        factor: 1
      sqm:
        factor: 0.0001

categories:
  - id: test-category
    label: "Test Category"
    services:
      - id: test-service
        label: "Test Service"
        unit_type: area
        unit: ha
        unit_display: "hectares"
        strategy: flat
        base_fee: 1000
        modifiers:
          - id: land-use
            label: "Land Use Factor"
            type: percentage_add
            options:
              - { id: residential, label: "Residential", value: 0.5 }
              - { id: commercial, label: "Commercial", value: 1.5 }
              - { id: industrial, label: "Industrial", value: 1.2 }
`;

    const parsed = yaml.load(yamlContent);
    const result = RateFileSchema.safeParse(parsed);
    if (!result.success) {
      console.log("Validation errors:", JSON.stringify(result.error.issues, null, 2));
    }
    expect(result.success).toBe(true);
  });
});

describe("IndexSchema", () => {
  it("should validate a correct manifest index", () => {
    const manifest = {
      version: "1.0",
      meta: "meta_units.yaml",
      categories: {
        isolated_land: "./cat_isolated_land.yaml",
        subdivision: "./cat_subdivision.yaml",
      },
      hourly: "./hourly_rates.yaml",
    };
    const result = IndexSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("should fail if meta is missing", () => {
    const manifest = {
      version: "1.0",
      categories: {
        isolated_land: "./cat_isolated_land.yaml",
      },
    };
    const result = IndexSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });
});
