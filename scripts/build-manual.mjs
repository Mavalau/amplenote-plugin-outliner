#!/usr/bin/env node
import fs from "fs";
import path from "path";

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath) {
  console.error("Usage: node scripts/build-manual.js <inputFile> [outputFile]");
  process.exit(1);
}

const content = fs.readFileSync(inputPath, "utf8");

// Detect if it's an IIFE
const isIIFE =
  content.split("\n")[0].includes("(() => {") && /}\)\(\);\s*$/.test(content);

if (!isIIFE) {
  throw new Error("Error: The input file is not an IIFE. Aborting.");
}

// Perform transformation as in https://github.com/jordangarrison/amplenote-plugin-builder/blob/main/lib/plugin-import-inliner.js#L9
const transformed = content.replace(/}\)\(\);\s*$/, "  return plugin;\n})()");

// Write output
if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, transformed, "utf8");
  console.log(`Transformed and written to ${outputPath}`);
} else {
  process.stdout.write(transformed);
}
