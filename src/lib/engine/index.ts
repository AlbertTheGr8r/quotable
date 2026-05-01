import { Money } from "./money";

export type { LineItem, ModifierResult } from "../schema/rates";

export { Money };

import type { Fee, LineItem, ModifierResult, ProjectCost, Service, ServiceCost } from "../schema/rates";

/**
 * Phase 1: Compute Base Amount
 */
export function computeBase(
  service: Service,
  quantity: number,
  params: Record<string, string> = {},
): { lineItems: LineItem[]; subtotal: Money } {
  let subtotal = Money.zero();
  const lineItems: LineItem[] = [];

  switch (service.strategy) {
    case "lookup_table":
      if (service.table) {
        const { table } = service;

        let processQty = quantity;
        if (table.selection_logic?.row === "nearest_integer") {
          processQty = Math.round(processQty);
        }

        // Determine column
        const cappedQty =
          table.excess_threshold && processQty > table.excess_threshold ? table.excess_threshold : processQty;

        let tens: number;
        let units: number;

        if (table.selection_logic?.column === "exact") {
          if (!table.columns.includes(processQty)) {
            throw new Error(`Exact column match required, but ${processQty} does not match any column.`);
          }
          tens = processQty;
          units = processQty; // Required to allow row_logic to still match if needed
        } else {
          const maxCol = Math.max(...table.columns);
          tens = Math.min(Math.floor(cappedQty / 10) * 10, maxCol);
          units = cappedQty - tens;

          // Handle exact multiples of 10 (e.g. 10ha -> tens=0, units=10)
          if (units === 0 && tens >= 10) {
            tens -= 10;
            units = 10;
          }
        }

        const colIndex = table.columns.indexOf(tens);

        // Find row id
        const rowLogic = table.row_logic.find((r) => units >= r.min && units <= r.max);

        if (colIndex !== -1 && rowLogic) {
          const baseAmount = table.rows[rowLogic.id][colIndex];
          const moneyAmount = Money.fromDouble(baseAmount);

          lineItems.push({
            id: "base",
            label: `${service.label} (${quantity} ${service.unit_display})`,
            quantity: 1,
            unit: "job",
            rate: baseAmount,
            amount: moneyAmount.value,
            formattedAmount: moneyAmount.format(),
          });
          subtotal = moneyAmount;

          // Handle excess
          if (table.excess_rate && table.excess_threshold && processQty > table.excess_threshold) {
            const excessQty = processQty - table.excess_threshold;
            const excessAmount = Money.fromDouble(table.excess_rate).multiply(excessQty);
            lineItems.push({
              id: "excess",
              label: `Excess Area (${excessQty} ${service.unit_display})`,
              quantity: excessQty,
              unit: service.unit,
              rate: table.excess_rate,
              amount: excessAmount.value,
              formattedAmount: excessAmount.format(),
            });
            subtotal = subtotal.add(excessAmount);
          }
        }
      }
      break;

    case "tiered_base_plus_unit":
      if (service.tiered_base) {
        const tier = service.tiered_base.tiers.find(
          (t) => quantity >= t.range[0] && (t.range[1] === null || quantity <= t.range[1]),
        );
        if (tier) {
          const baseMoney = Money.fromDouble(tier.base);
          lineItems.push({
            id: "base",
            label: `Base fee (${tier.range[0]}-${tier.range[1] || "up"} ${service.unit_display})`,
            quantity: 1,
            unit: "base",
            rate: tier.base,
            amount: baseMoney.value,
            formattedAmount: baseMoney.format(),
          });

          const excessQty = Math.max(0, quantity - tier.excess_above);
          const excessMoney = Money.fromDouble(tier.per_unit).multiply(excessQty);
          lineItems.push({
            id: "per-unit",
            label: `Per ${service.unit} in excess of ${tier.excess_above}`,
            quantity: excessQty,
            unit: service.unit,
            rate: tier.per_unit,
            amount: excessMoney.value,
            formattedAmount: excessMoney.format(),
          });
          subtotal = baseMoney.add(excessMoney);
        }
      }
      break;

    case "tiered_per_unit":
      if (service.tiered_per) {
        const { tiered_per } = service;
        let remaining = quantity;
        let prevThreshold = 0;

        // Get rates set based on params (e.g. contour interval)
        let rates: number[] = [];
        if (service.parameters?.length) {
          const param = service.parameters[0]; // assume one for now
          const selectedOption = param.options?.find((o) => o.id === params[param.id]);
          rates = selectedOption?.rates || param.options?.[0].rates || [];
        } else {
          // No parameters, expect rates defined elsewhere or not applicable
        }

        for (let i = 0; i < tiered_per.tiers.length; i++) {
          const tier = tiered_per.tiers[i];
          const rate = rates[i] || 0;
          const threshold = tier.up_to === null ? Infinity : tier.up_to;
          const tierQty = Math.min(remaining, threshold - prevThreshold);

          if (tierQty > 0) {
            const tierMoney = Money.fromDouble(rate).multiply(tierQty);
            lineItems.push({
              id: `tier-${i}`,
              label: tier.label,
              quantity: tierQty,
              unit: service.unit,
              rate: rate,
              amount: tierMoney.value,
              formattedAmount: tierMoney.format(),
            });
            subtotal = subtotal.add(tierMoney);
          }

          remaining -= tierQty;
          prevThreshold = threshold;
          if (remaining <= 0) break;
        }
      }
      break;

    case "flat_per_unit":
      if (service.flat_rates) {
        // Flat rates usually implies checkboxes for different sub-items
        // params[subItem.id] = 'true'
        for (const [id, rate] of Object.entries(service.flat_rates.rates)) {
          if (params[id] === "true") {
            const itemMoney = Money.fromDouble(rate).multiply(quantity);
            lineItems.push({
              id,
              label: id.replace(/_/g, " ").toUpperCase(),
              quantity,
              unit: service.unit,
              rate,
              amount: itemMoney.value,
              formattedAmount: itemMoney.format(),
            });
            subtotal = subtotal.add(itemMoney);
          }
        }
      }
      break;

    case "flat":
      if (service.base_fee) {
        const fee = Money.fromDouble(service.base_fee);
        lineItems.push({
          id: "base",
          label: service.label,
          quantity: 1,
          unit: "flat",
          rate: service.base_fee,
          amount: fee.value,
          formattedAmount: fee.format(),
        });
        subtotal = fee;
      }
      break;
  }

  return { lineItems, subtotal };
}

/**
 * Phase 2: Apply Modifiers & VAT
 */
export function applyModifiers(
  subtotal: Money,
  service: Service,
  selectedOptions: Record<string, string>, // modifierId -> optionId
): { modifiers: ModifierResult[]; total: Money } {
  let currentTotal = subtotal;
  const modifierResults: ModifierResult[] = [];

  if (service.modifiers) {
    for (const modifier of service.modifiers) {
      const selectedId = selectedOptions[modifier.id] || modifier.default_option_id;
      const option = modifier.options.find((o) => o.id === selectedId);

      if (option && option.value !== 0) {
        let modAmount = Money.zero();

        switch (modifier.type) {
          case "percentage_add":
            modAmount = subtotal.multiply(option.value);
            break;
          case "multiplier":
            // Multiplier applied to "current" total or original subtotal?
            // User said "multiplier (x1.5)". Usually applied to base.
            modAmount = subtotal.multiply(option.value - 1);
            break;
          case "flat_add":
            modAmount = new Money(option.value); // option.value should be in cents
            break;
        }

        currentTotal = currentTotal.add(modAmount);
        modifierResults.push({
          id: modifier.id,
          label: modifier.label,
          optionLabel: option.label,
          value: option.value,
          amount: modAmount.value,
          formattedAmount: modAmount.format(),
        });
      }
    }
  }

  return { modifiers: modifierResults, total: currentTotal };
}

/**
 * Phase 3: Service-Level Cost Aggregation
 * Calculates the total cost for a single service, including base, modifiers, and service-level fees.
 */
export function computeServiceCost(
  service: Service,
  quantity: number,
  options: {
    parameters?: Record<string, string>;
    modifiers?: Record<string, string>;
  } = {},
): ServiceCost {
  const { parameters = {}, modifiers = {} } = options;

  // 1. Base Cost
  const { lineItems, subtotal } = computeBase(service, quantity, parameters);

  // 2. Modifiers (Apply strictly to base subtotal)
  const { modifiers: modifierResults, total: modifiedTotal } = applyModifiers(subtotal, service, modifiers);

  // 3. Service-Level Additional Fees
  const additionalCosts: Record<string, number> = {};
  let totalWithFees = modifiedTotal;

  if (service.additional_fees) {
    for (const fee of service.additional_fees) {
      let feeAmount = Money.zero();

      switch (fee.type) {
        case "flat":
          feeAmount = Money.fromDouble(fee.value);
          break;
        case "percentage_of_base":
          feeAmount = subtotal.multiply(fee.value);
          break;
        case "percentage_of_total":
          feeAmount = modifiedTotal.multiply(fee.value);
          break;
        case "time_based":
          break;
      }

      if (fee.minimum) {
        const minMoney = Money.fromDouble(fee.minimum);
        if (feeAmount.cents < minMoney.cents) {
          feeAmount = minMoney;
        }
      }

      const cat = fee.category || "misc";
      additionalCosts[cat] = (additionalCosts[cat] || 0) + feeAmount.value;
      totalWithFees = totalWithFees.add(feeAmount);
    }
  }

  return {
    serviceId: service.id,
    baseLineItems: lineItems,
    subtotal: subtotal.value,
    modifiers: modifierResults,
    additionalCosts: Object.keys(additionalCosts).length > 0 ? additionalCosts : undefined,
    total: totalWithFees.value,
    formattedSubtotal: subtotal.format(),
    formattedTotal: totalWithFees.format(),
    warnings: [], // Can implement warnings aggregation later
  };
}

/**
 * Phase 4: Project Cost Aggregation
 * Aggregates multiple services and applies global project-level fees and taxes.
 */
export function computeProjectCost(
  services: ServiceCost[],
  projectFees: Fee[] = [],
  projectTaxes: { vatRate?: number } = {},
): ProjectCost {
  let baseProjectCost = Money.zero();
  let modifiedProjectCost = Money.zero();

  // Sum up all service costs
  for (const service of services) {
    baseProjectCost = baseProjectCost.add(Money.fromDouble(service.subtotal));
    modifiedProjectCost = modifiedProjectCost.add(Money.fromDouble(service.total));
  }

  // Merge service-level categorical breakdown (this is a descriptive merge, not a computational step)
  const additionalCosts: Record<string, number> = {};
  for (const service of services) {
    if (service.additionalCosts) {
      for (const [cat, value] of Object.entries(service.additionalCosts)) {
        additionalCosts[cat] = (additionalCosts[cat] || 0) + value;
      }
    }
  }

  let totalProjectCost = modifiedProjectCost;

  // Apply project-level fees in sorted order
  const sortedFees = [...projectFees].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  for (const fee of sortedFees) {
    let feeAmount = Money.zero();

    switch (fee.type) {
      case "flat":
        feeAmount = Money.fromDouble(fee.value);
        break;
      case "percentage_of_base":
        feeAmount = baseProjectCost.multiply(fee.value);
        break;
      case "percentage_of_total":
        // At project level, base and total reference the aggregated service costs
        feeAmount = totalProjectCost.multiply(fee.value);
        break;
      case "time_based":
        break;
    }

    if (fee.minimum) {
      const minMoney = Money.fromDouble(fee.minimum);
      if (feeAmount.cents < minMoney.cents) {
        feeAmount = minMoney;
      }
    }

    const cat = fee.category || "misc";
    additionalCosts[cat] = (additionalCosts[cat] || 0) + feeAmount.value;
    totalProjectCost = totalProjectCost.add(feeAmount);
  }

  // 3. Apply Taxes
  let vatAmount: number | undefined;
  if (projectTaxes.vatRate) {
    const vatMoney = totalProjectCost.multiply(projectTaxes.vatRate);
    vatAmount = vatMoney.value;
    totalProjectCost = totalProjectCost.add(vatMoney);
  }

  return {
    services,
    base_service_cost: baseProjectCost.value,
    additional_costs: Object.keys(additionalCosts).length > 0 ? additionalCosts : undefined,
    taxes: vatAmount !== undefined ? { vat: vatAmount } : undefined,
    total_project_cost: totalProjectCost.value,
  };
}
