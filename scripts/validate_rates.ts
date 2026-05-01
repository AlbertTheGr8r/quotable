import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { type Category, IndexSchema, type RateFile, RateFileSchema, type Service } from "../src/lib/schema/rates";

const BASE_DIR = "public/rates/gepi-2020-2023";
const INDEX_FILE = path.join(BASE_DIR, "index.yaml");
const OUTPUT_FILE = path.join(BASE_DIR, "compiled.json");

function loadYaml(filePath: string): unknown {
  const content = fs.readFileSync(filePath, "utf8");
  return yaml.load(content);
}

async function validateAndCompile() {
  console.log(`Loading index from ${INDEX_FILE}...`);
  const indexData = loadYaml(INDEX_FILE);
  const index = IndexSchema.parse(indexData);

  console.log(`Loading meta and units from ${index.meta}...`);
  const metaUnitsData = loadYaml(path.join(BASE_DIR, index.meta)) as {
    meta: RateFile["meta"];
    units: RateFile["units"];
  };

  const categories: Category[] = [];
  for (const [id, relPath] of Object.entries(index.categories)) {
    console.log(`Loading category ${id} from ${relPath}...`);
    const catData = loadYaml(path.join(BASE_DIR, relPath)) as Category;
    categories.push(catData);
  }

  let uncategorized: Service[] = [];
  if (index.hourly) {
    console.log(`Loading hourly rates from ${index.hourly}...`);
    const hourlyData = loadYaml(path.join(BASE_DIR, index.hourly));
    if (Array.isArray(hourlyData)) {
      uncategorized = hourlyData as Service[];
    }
  }

  const rateFile = {
    ...metaUnitsData,
    categories,
    uncategorized: uncategorized.length > 0 ? uncategorized : undefined,
  };

  console.log("Validating compiled rate file...");
  const result = RateFileSchema.safeParse(rateFile);

  if (!result.success) {
    console.error("Validation failed!");
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  console.log("Validation successful! Writing to", OUTPUT_FILE);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(rateFile, null, 2));
  console.log("Done.");
}

validateAndCompile().catch((err) => {
  console.error(err);
  process.exit(1);
});
