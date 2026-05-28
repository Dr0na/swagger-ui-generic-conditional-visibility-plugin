import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src", "plugin.js");
const outDir = join(root, "dist");
const outFile = join(outDir, "generic-conditional-visibility-plugin.js");

mkdirSync(outDir, { recursive: true });

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const body = readFileSync(src, "utf8");
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * Generic Swagger UI plugin for OpenAPI x-conditional / x-visibility extensions.
 */`;

const bundle = `${banner}
(function (global, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    global.SwaggerUIGenericConditionalVisibilityPlugin = factory();
  }
})(typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : this, function () {
${body}
  return GenericConditionalVisibilityPlugin;
});
`;

writeFileSync(outFile, bundle, "utf8");
console.log(`Wrote ${outFile}`);
