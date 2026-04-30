import { z } from "zod";

export const ComputationStrategySchema = z.enum([
  "lookup_table",
  "tiered_base_plus_unit",
  "tiered_per_unit",
  "flat_per_unit",
  "flat",
]);

export const ModifierTypeSchema = z.enum(["percentage_add", "multiplier", "flat_add"]);

export const ModifierSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: ModifierTypeSchema,
  options: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      value: z.number(), // Percentage as 0.5 for 50%, Multiplier as 1.5, Flat as absolute cents
    }),
  ),
  default_option_id: z.string().optional(),
});

export const LookupTableSchema = z.object({
  columns: z.array(z.number()), // e.g., tens: [0, 10, 20, 30, 40, 50, 60]
  rows: z.record(z.string(), z.array(z.number())), // row identifier (e.g., "6") -> values for each column
  row_logic: z.array(
    z.object({
      id: z.string(),
      min: z.number(),
      max: z.number(),
    }),
  ), // Maps row ids to numeric ranges
  excess_rate: z.number().optional(), // rate per unit beyond threshold
  excess_threshold: z.number().optional(),
});

export const TieredBasePlusUnitSchema = z.object({
  tiers: z.array(
    z.object({
      range: z.tuple([z.number(), z.number().nullable()]), // [min, max]
      base: z.number(),
      per_unit: z.number(),
      excess_above: z.number(),
    }),
  ),
});

export const TieredPerUnitSchema = z.object({
  parameters: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.literal("select"),
        options: z.array(
          z.object({
            id: z.string(),
            label: z.string(),
            rates: z.array(z.number()), // Rates corresponding to tiers
          }),
        ),
      }),
    )
    .optional(),
  tiers: z.array(
    z.object({
      label: z.string(),
      up_to: z.number().nullable(),
    }),
  ),
});

export const FlatPerUnitSchema = z.object({
  rates: z.record(z.string(), z.number()), // sub-id -> rate per unit
});

export const ServiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  unit_type: z.enum(["area", "length", "count", "time"]),
  unit: z.string(),
  unit_display: z.string(),
  unit_conversions: z.array(z.string()).optional(),
  strategy: ComputationStrategySchema,

  // Strategy specific data (one of these should be populated)
  table: LookupTableSchema.optional(),
  tiered_base: TieredBasePlusUnitSchema.optional(),
  tiered_per: TieredPerUnitSchema.optional(),
  flat_rates: FlatPerUnitSchema.optional(),
  base_fee: z.number().optional(), // for 'flat' strategy

  modifiers: z.array(ModifierSchema).optional(),
  warnings: z.array(z.string()).optional(),
  cross_references: z
    .array(
      z.object({
        service_id: z.string(),
        label: z.string(),
        type: z.enum(["suggested", "required", "exclusive"]),
      }),
    )
    .optional(),
});

export const CategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  services: z.array(ServiceSchema),
});

export const RateFileSchema = z.object({
  meta: z.object({
    title: z.string(),
    version: z.string(),
    currency: z.string().default("PHP"),
    vat_rate: z.number().default(0.12),
    source_url: z.string().optional(),
  }),
  units: z.object({
    conversions: z.array(
      z.object({
        from: z.string(),
        to: z.string(),
        factor: z.number(),
      }),
    ),
  }),
  categories: z.array(CategorySchema),
  uncategorized: z.array(ServiceSchema).optional(),
});

export type RateFile = z.infer<typeof RateFileSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type Modifier = z.infer<typeof ModifierSchema>;
export type ComputationStrategy = z.infer<typeof ComputationStrategySchema>;
