import fs from "node:fs";

// Nextra validates theme options after removing children from the props.
// Zod 4 requires this field to be optional in that validation schema.
const schemaPath = new URL("../node_modules/nextra-theme-docs/dist/schemas.js", import.meta.url);
const source = fs.readFileSync(schemaPath, "utf8");
const before = "  children: reactNode,\n";
const after = "  children: reactNode.optional(),\n";

if (source.includes(before)) {
  fs.writeFileSync(schemaPath, source.replace(before, after));
  console.log("Patched Nextra layout schema compatibility");
} else if (!source.includes(after)) {
  throw new Error("Nextra layout schema changed; review the compatibility patch.");
}
