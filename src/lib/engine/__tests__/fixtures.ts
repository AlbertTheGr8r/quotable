import type { Service } from "../../schema/rates";

export const relocationService: Service = {
  id: "relocation",
  label: "Relocation Survey",
  unit_type: "area",
  unit: "ha",
  unit_display: "Hectares",
  strategy: "lookup_table",
  table: {
    selection_logic: {
      row: "nearest_integer",
      column: "floor_to_bracket",
    },
    columns: [0, 10, 20],
    row_logic: [
      { id: "1", min: 0, max: 10 }, // 1 to 10
      { id: "2", min: 11, max: 20 },
    ],
    rows: {
      "1": [10000, 15000, 20000],
      "2": [12000, 18000, 24000],
    },
    excess_rate: 500, // per ha over threshold
    excess_threshold: 20,
  },
  modifiers: [
    {
      id: "land_use",
      label: "Land Use",
      type: "percentage_add",
      options: [
        { id: "residential", label: "Residential", value: 0 },
        { id: "commercial", label: "Commercial", value: 0.5 }, // +50%
      ],
      default_option_id: "residential",
    },
  ],
};

export const subdivisionService: Service = {
  id: "subdivision",
  label: "Residential Subdivision",
  unit_type: "count",
  unit: "lot",
  unit_display: "Lots",
  strategy: "tiered_base_plus_unit",
  tiered_base: {
    tiers: [
      { range: [1, 4], base: 10000, per_unit: 0, excess_above: 4 },
      { range: [5, 9], base: 10000, per_unit: 500, excess_above: 4 },
      { range: [10, 19], base: 12500, per_unit: 400, excess_above: 9 },
    ],
  },
};

export const topoService: Service = {
  id: "topographic",
  label: "Topographic Survey",
  unit_type: "area",
  unit: "ha",
  unit_display: "Hectares",
  strategy: "tiered_per_unit",
  parameters: [
    {
      id: "contour",
      label: "Contour Interval",
      type: "select",
      options: [
        { id: "0.5m", label: "0.5m", rates: [5000, 4000, 3000] },
        { id: "1.0m", label: "1.0m", rates: [4000, 3000, 2000] },
      ],
    },
  ],
  tiered_per: {
    tiers: [
      { label: "First 5 ha", up_to: 5 },
      { label: "Next 10 ha", up_to: 15 },
      { label: "Excess", up_to: null },
    ],
  },
  modifiers: [
    {
      id: "slope",
      label: "Slope",
      type: "percentage_add",
      options: [
        { id: "flat", label: "Flat", value: 0 },
        { id: "steep", label: "Steep (>18%)", value: 0.5 },
      ],
    },
  ],
};

export const establishmentFeeService: Service = {
  id: "establishment_fee",
  label: "Establishment Fee",
  unit_type: "count",
  unit: "job",
  unit_display: "Job",
  strategy: "flat",
  base_fee: 0,
};
