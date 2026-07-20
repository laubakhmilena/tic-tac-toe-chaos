"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const required = [
  "index.html",
  "style.css",
  "script.js",
  "assets",
  "tests/pet-and-save.test.js",
  "tests/core-game.test.js"
];

for (const item of required) {
  assert.ok(fs.existsSync(path.join(root, item)), `Missing required project item: ${item}`);
}

const sourceFiles = ["index.html", "style.css", "script.js"];
const source = sourceFiles
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

const assetPattern = /assets\/[A-Za-z0-9_.\-/]+\.(?:png|webp|jpg|jpeg|gif|svg|ico|mp3|ogg|wav)/g;
const references = [...new Set(source.match(assetPattern) || [])].sort();
const missingAssets = references.filter((asset) => !fs.existsSync(path.join(root, asset)));
assert.deepEqual(missingAssets, [], `Missing referenced assets: ${missingAssets.join(", ")}`);

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const idMatches = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = idMatches.filter((id, index) => idMatches.indexOf(id) !== index);
assert.deepEqual([...new Set(duplicates)], [], `Duplicate HTML IDs: ${duplicates.join(", ")}`);

const invalidPaths = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    const relative = path.relative(root, full);
    if (relative.includes("\\")) invalidPaths.push(relative);
    if (entry.isDirectory()) walk(full);
  }
}
walk(root);
assert.deepEqual(invalidPaths, [], `Backslashes found in repository paths: ${invalidPaths.join(", ")}`);

console.log(`PASS required project files: ${required.length}`);
console.log(`PASS referenced static assets: ${references.length}`);
console.log(`PASS unique HTML IDs: ${idMatches.length}`);
console.log("PASS normalized repository paths");
console.log("\nProject structure verification passed");
