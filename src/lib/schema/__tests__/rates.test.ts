import yaml from "js-yaml";

import { describe, expect, it } from "vitest";

import { ModifierSchema, RateFileSchema } from "../rates";

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
  conversions:
    - { from: "sqm", to: "ha", factor: 0.0001 }

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
    expect(result.success).toBe(true);
  });
});
