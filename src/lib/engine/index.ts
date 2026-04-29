import { Money } from './money';
export { Money };
import type { Service } from '../schema/rates';

export interface LineItem {
  id: string;
  label: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number; // raw value
  formattedAmount: string;
}

export interface ModifierResult {
  id: string;
  label: string;
  optionLabel: string;
  value: number; // percentage or multiplier
  amount: number;
  formattedAmount: string;
}

export interface ComputationResult {
  serviceId: string;
  baseLineItems: LineItem[];
  subtotal: number;
  modifiers: ModifierResult[];
  total: number;
  formattedSubtotal: string;
  formattedTotal: string;
  warnings: string[];
}

export class ComputationEngine {
  /**
   * Phase 1: Compute Base Amount
   */
  static computeBase(
    service: Service,
    quantity: number,
    params: Record<string, string> = {}
  ): { lineItems: LineItem[]; subtotal: Money } {
    let subtotal = Money.zero();
    const lineItems: LineItem[] = [];

    switch (service.strategy) {
      case 'lookup_table':
        if (service.table) {
          const { table } = service;
          // Determine column
          const lookupQty = (table.excess_threshold && quantity > table.excess_threshold) 
            ? table.excess_threshold 
            : quantity;

          const maxCol = Math.max(...table.columns);
          let tens = Math.min(Math.floor(lookupQty / 10) * 10, maxCol);
          let units = lookupQty - tens;

          // Handle exact multiples of 10 (e.g. 10ha -> tens=0, units=10)
          if (units === 0 && tens >= 10) {
            tens -= 10;
            units = 10;
          }

          const colIndex = table.columns.indexOf(tens);

          // Find row id
          const rowLogic = table.row_logic.find(
            (r) => units >= r.min && units <= r.max
          );
          
          if (colIndex !== -1 && rowLogic) {
            const baseAmount = table.rows[rowLogic.id][colIndex];
            const moneyAmount = Money.fromDouble(baseAmount);
            
            lineItems.push({
              id: 'base',
              label: `${service.label} (${quantity} ${service.unit_display})`,
              quantity: 1,
              unit: 'job',
              rate: baseAmount,
              amount: moneyAmount.value,
              formattedAmount: moneyAmount.format(),
            });
            subtotal = moneyAmount;

            // Handle excess
            if (table.excess_rate && table.excess_threshold && quantity > table.excess_threshold) {
              const excessQty = quantity - table.excess_threshold;
              const excessAmount = Money.fromDouble(table.excess_rate).multiply(excessQty);
              lineItems.push({
                id: 'excess',
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

      case 'tiered_base_plus_unit':
        if (service.tiered_base) {
          const tier = service.tiered_base.tiers.find(
            (t) => quantity >= t.range[0] && (t.range[1] === null || quantity <= t.range[1])
          );
          if (tier) {
            const baseMoney = Money.fromDouble(tier.base);
            lineItems.push({
              id: 'base',
              label: `Base fee (${tier.range[0]}-${tier.range[1] || 'up'} ${service.unit_display})`,
              quantity: 1,
              unit: 'base',
              rate: tier.base,
              amount: baseMoney.value,
              formattedAmount: baseMoney.format(),
            });
            
            const excessQty = Math.max(0, quantity - tier.excess_above);
            const excessMoney = Money.fromDouble(tier.per_unit).multiply(excessQty);
            lineItems.push({
              id: 'per-unit',
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

      case 'tiered_per_unit':
        if (service.tiered_per) {
          const { tiered_per } = service;
          let remaining = quantity;
          let prevThreshold = 0;
          
          // Get rates set based on params (e.g. contour interval)
          let rates: number[] = [];
          if (tiered_per.parameters?.length) {
            const param = tiered_per.parameters[0]; // assume one for now
            const selectedOption = param.options.find(o => o.id === params[param.id]);
            rates = selectedOption?.rates || param.options[0].rates;
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

      case 'flat_per_unit':
        if (service.flat_rates) {
          // Flat rates usually implies checkboxes for different sub-items
          // params[subItem.id] = 'true'
          for (const [id, rate] of Object.entries(service.flat_rates.rates)) {
            if (params[id] === 'true') {
              const itemMoney = Money.fromDouble(rate).multiply(quantity);
              lineItems.push({
                id,
                label: id.replace(/_/g, ' ').toUpperCase(),
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

      case 'flat':
        if (service.base_fee) {
          const fee = Money.fromDouble(service.base_fee);
          lineItems.push({
            id: 'base',
            label: service.label,
            quantity: 1,
            unit: 'flat',
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
  static applyModifiers(
    subtotal: Money,
    service: Service,
    selectedOptions: Record<string, string> // modifierId -> optionId
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
            case 'percentage_add':
              modAmount = subtotal.multiply(option.value);
              break;
            case 'multiplier':
              // Multiplier applied to "current" total or original subtotal?
              // User said "multiplier (x1.5)". Usually applied to base.
              modAmount = subtotal.multiply(option.value - 1);
              break;
            case 'flat_add':
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
}
