import type { RateFile } from "../schema/rates";

export interface UnitCategoryConfig {
  canonical: string;
  units: Record<string, UnitDefinition>;
}

export interface UnitDefinition {
  factor: number;
  aliases?: string[];
}

export type UnitsConfig = Record<string, UnitCategoryConfig>;

function findUnitInCategory(unitOrAlias: string, category: UnitCategoryConfig): string | null {
  const normalized = unitOrAlias.toLowerCase();

  if (category.units[unitOrAlias]) {
    return unitOrAlias;
  }

  for (const [unit, def] of Object.entries(category.units)) {
    if (unit.toLowerCase() === normalized) {
      return unit;
    }
    if (def.aliases) {
      for (const alias of def.aliases) {
        if (alias.toLowerCase() === normalized) {
          return unit;
        }
      }
    }
  }

  return null;
}

export function getUnitCategory(unit: string, unitsConfig: UnitsConfig): string | null {
  for (const [categoryName, category] of Object.entries(unitsConfig)) {
    if (findUnitInCategory(unit, category)) {
      return categoryName;
    }
  }
  return null;
}

export function getCanonicalUnit(category: string, unitsConfig: UnitsConfig): string | null {
  const cat = unitsConfig[category];
  return cat?.canonical || null;
}

export function getUnitsForCategory(category: string, unitsConfig: UnitsConfig): string[] {
  const cat = unitsConfig[category];
  if (!cat) return [];
  return Object.keys(cat.units);
}

export function convert(value: number, fromUnit: string, toUnit: string, unitsConfig: UnitsConfig): number {
  const fromCategory = getUnitCategory(fromUnit, unitsConfig);
  const toCategory = getUnitCategory(toUnit, unitsConfig);

  if (!fromCategory || fromCategory !== toCategory) {
    throw new Error(
      `Cannot convert between ${fromUnit} (${fromCategory}) and ${toUnit} (${toCategory}): incompatible units`,
    );
  }

  const cat = unitsConfig[fromCategory];
  const fromKey = findUnitInCategory(fromUnit, cat);
  const toKey = findUnitInCategory(toUnit, cat);

  if (!fromKey || !toKey) {
    throw new Error(`Unit not found: ${!fromKey ? fromUnit : toUnit}`);
  }

  const fromFactor = cat.units[fromKey].factor;
  const toFactor = cat.units[toKey].factor;

  return (value * fromFactor) / toFactor;
}

export function normalizeQuantity(value: number, unit: string, category: string, unitsConfig: UnitsConfig): number {
  const canonical = getCanonicalUnit(category, unitsConfig);
  if (!canonical) {
    throw new Error(`No canonical unit defined for category: ${category}`);
  }

  return convert(value, unit, canonical, unitsConfig);
}

export function formatQuantity(value: number, unit: string, unitsConfig: UnitsConfig): string {
  const category = getUnitCategory(unit, unitsConfig);
  if (!category) {
    return `${value} ${unit}`;
  }

  const canonical = getCanonicalUnit(category, unitsConfig);
  if (!canonical || canonical === unit) {
    return `${value} ${unit}`;
  }

  const normalized = convert(value, unit, canonical, unitsConfig);
  return `${normalized} ${canonical}`;
}

export function getRateFileUnits(rateFile: RateFile): UnitsConfig {
  return rateFile.units as UnitsConfig;
}

export function getServiceCanonicalUnit(
  service: { unit_type: string; unit: string },
  unitsConfig: UnitsConfig,
): string {
  const category = service.unit_type;
  const canonical = getCanonicalUnit(category, unitsConfig);
  return canonical || service.unit;
}

export function getServiceAvailableUnits(
  service: { unit_type: string; unit: string },
  unitsConfig: UnitsConfig,
): string[] {
  const category = service.unit_type;
  const units = getUnitsForCategory(category, unitsConfig);
  return units.length > 0 ? units : [service.unit];
}
