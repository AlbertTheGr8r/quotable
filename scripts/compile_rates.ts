import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { type Category, IndexSchema, type RateFile, RateFileSchema, type Service } from "../src/lib/schema/rates";

const PUBLIC_RATES_DIR = "public/rates";
const DIST_DIR = path.join(PUBLIC_RATES_DIR, "dist");

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function loadYaml(filePath: string): unknown {
  const content = fs.readFileSync(filePath, "utf8");
  return yaml.load(content);
}

function compileModular(id: string, modularDir: string): RateFile {
  const indexPath = path.join(modularDir, "index.yaml");
  console.log(`Compiling modular set [${id}] from ${indexPath}...`);

  const indexData = loadYaml(indexPath);
  const index = IndexSchema.parse(indexData);

  const metaUnitsData = loadYaml(path.join(modularDir, index.meta)) as {
    meta: RateFile["meta"];
    units: RateFile["units"];
  };

  const categories: Category[] = [];
  for (const [catId, relPath] of Object.entries(index.categories)) {
    console.log(`  Loading category ${catId} from ${relPath}...`);
    const catData = loadYaml(path.join(modularDir, relPath)) as Category;
    categories.push(catData);
  }

  let uncategorized: Service[] = [];
  if (index.hourly) {
    console.log(`  Loading hourly rates from ${index.hourly}...`);
    const hourlyData = loadYaml(path.join(modularDir, index.hourly));
    if (Array.isArray(hourlyData)) {
      uncategorized = hourlyData as Service[];
    }
  }

  const rateFile = {
    ...metaUnitsData,
    categories,
    uncategorized: uncategorized.length > 0 ? uncategorized : undefined,
  };

  const result = RateFileSchema.parse(rateFile);
  return result;
}

const manifest: { id: string; title: string; jsonUrl: string }[] = [];

// 1. Compile GEPI 2020-2023
try {
  const gepiId = "gepi-2020-2023";
  const gepiDir = path.join(PUBLIC_RATES_DIR, gepiId);
  const compiledGepi = compileModular(gepiId, gepiDir);

  const outputPath = path.join(DIST_DIR, `${gepiId}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(compiledGepi, null, 2));

  manifest.push({
    id: gepiId,
    title: compiledGepi.meta.title,
    jsonUrl: `/rates/dist/${gepiId}.json`,
  });

  console.log(`Successfully compiled ${gepiId} to ${outputPath}`);
} catch (err) {
  console.error("Failed to compile GEPI 2020-2023:", err);
  process.exit(1);
}

// Write manifest
const manifestPath = path.join(PUBLIC_RATES_DIR, "manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Generated manifest at ${manifestPath}`);
