import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RateFileSchema } from "../rates";

describe("Compiled GEPI Rates Validation", () => {
  it("should conform to RateFileSchema", () => {
    const compiledPath = path.resolve(__dirname, "../../../../public/rates/dist/gepi-2020-2023.json");

    // Check if file exists first
    if (!fs.existsSync(compiledPath)) {
      console.warn("Compiled GEPI rates not found at:", compiledPath);
      console.warn("Run 'npm run compile-rates' first.");
      return;
    }

    const content = fs.readFileSync(compiledPath, "utf8");
    const json = JSON.parse(content);

    const result = RateFileSchema.safeParse(json);

    if (!result.success) {
      console.error("Compiled GEPI rates validation failed:", JSON.stringify(result.error.issues, null, 2));
    }

    expect(result.success).toBe(true);
  });
});
