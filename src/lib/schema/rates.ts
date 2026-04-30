import { z } from "zod";

export const ComputationStrategySchema = z.enum([
  "lookup_table",
  "tiered_base_plus_unit",
  "tiered_per_unit",
  "flat_per_unit",
  "flat",
  "time_based",
]);

export const ModifierTypeSchema = z.enum(["percentage_add", "multiplier", "flat_add"]);

export const FeeCategorySchema = z.enum(["equipment", "mobilization", "travel", "supplies", "misc"]);

export const FeeSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["flat", "percentage_of_base", "percentage_of_total", "time_based"]),
    category: FeeCategorySchema.default("misc"),
    value: z.number(),
    minimum: z.number().optional(),
    priority: z.number().optional(),
    conditions: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type.includes("percentage") && (data.value < 0 || data.value > 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage value must be between 0 and 1",
        path: ["value"],
      });
    }
  });

export const ConditionRuleSchema = z.object({
  id: z.string(),
  description: z.string(),
  condition: z.string(),
});

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
  selection_logic: z
    .object({
      row: z.enum(["nearest_integer", "range", "exact"]).default("range"),
      column: z.enum(["floor_to_bracket", "exact"]).default("floor_to_bracket"),
    })
    .optional(),
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

export const TimeBasedSchema = z.object({
  roles: z.record(z.string(), z.number()), // role -> hourly rate
  minimum_hours: z.number().optional(),
  overtime_rules: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        multiplier: z.number(),
      }),
    )
    .optional(),
});

export const ParameterSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["select", "number", "boolean"]),
  options: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        rate: z.number().optional(),
        rates: z.array(z.number()).optional(),
        multiplier: z.number().optional(),
      }),
    )
    .optional(),
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
  time_based: TimeBasedSchema.optional(),
  base_fee: z.number().optional(), // for 'flat' strategy

  parameters: z.array(ParameterSchema).optional(),
  modifiers: z.array(ModifierSchema).optional(),
  additional_fees: z.array(FeeSchema).optional(),
  extra_cost_rules: z.array(ConditionRuleSchema).optional(),

  composed_of: z
    .array(
      z.object({
        service_id: z.string(),
        type: z.enum(["required", "optional"]),
      }),
    )
    .optional(),

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

export const LineItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  quantity: z.number(),
  unit: z.string(),
  rate: z.number(),
  amount: z.number(),
  formattedAmount: z.string(),
});

export const ModifierResultSchema = z.object({
  id: z.string(),
  label: z.string(),
  optionLabel: z.string(),
  value: z.number(),
  amount: z.number(),
  formattedAmount: z.string(),
});

export const ServiceCostSchema = z.object({
  serviceId: z.string(),
  baseLineItems: z.array(LineItemSchema),
  subtotal: z.number(),
  modifiers: z.array(ModifierResultSchema),
  additionalCosts: z.record(z.string(), z.number()).optional(),
  total: z.number(),
  formattedSubtotal: z.string(),
  formattedTotal: z.string(),
  warnings: z.array(z.string()),
});

export const ProjectCostSchema = z.object({
  services: z.array(ServiceCostSchema),
  base_service_cost: z.number(),
  additional_costs: z
    .object({
      equipment: z.number().optional(),
      mobilization: z.number().optional(),
      travel: z.number().optional(),
      supplies: z.number().optional(),
      misc: z.number().optional(),
    })
    .optional(),
  adjustments: z
    .object({
      contingency: z.number().optional(),
      profit: z.number().optional(),
      hazard: z.number().optional(),
    })
    .optional(),
  taxes: z
    .object({
      vat: z.number(),
    })
    .optional(),
  total_project_cost: z.number(),
});

export type RateFile = z.infer<typeof RateFileSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type Modifier = z.infer<typeof ModifierSchema>;
export type FeeCategory = z.infer<typeof FeeCategorySchema>;
export type Fee = z.infer<typeof FeeSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type ModifierResult = z.infer<typeof ModifierResultSchema>;
export type ServiceCost = z.infer<typeof ServiceCostSchema>;
export type ProjectCost = z.infer<typeof ProjectCostSchema>;
export type ComputationStrategy = z.infer<typeof ComputationStrategySchema>;
