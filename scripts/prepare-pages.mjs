/**
 * Assemble a static site for GitHub Pages (project site: /{repo}/ base path).
 * Run after: npm run build
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "swagger-ui-generic-conditional-visibility-plugin";
const owner = process.env.GITHUB_REPOSITORY?.split("/")[0] || "Dr0na";
const pagesBase = process.env.PAGES_BASE_PATH || `/${repo}`;
const pagesUrl =
  process.env.PAGES_URL || `https://${owner.toLowerCase()}.github.io${pagesBase}/`;
const repoUrl = process.env.REPO_URL || `https://github.com/${owner}/${repo}`;

function patchScenarioPage(html) {
  return html
    .replaceAll('href="/demo/"', 'href="../"')
    .replaceAll('href="/docs/DEMOS.md"', `href="${repoUrl}/blob/main/docs/DEMOS.md"`)
    .replaceAll("../../dist/", "../dist/");
}

function patchHubPage(html) {
  return html
    .replaceAll("http://localhost:9080/demo/", pagesUrl)
    .replaceAll('href="/README.md"', `href="${repoUrl}"`)
    .replaceAll('href="/docs/DEMOS.md"', `href="${repoUrl}/blob/main/docs/DEMOS.md"`)
    .replaceAll(
      'href="/docs/EXTENSION-CONTRACT.md"',
      `href="${repoUrl}/blob/main/docs/EXTENSION-CONTRACT.md"`
    );
}

rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });

cpSync(join(root, "dist"), join(site, "dist"), { recursive: true });
cpSync(join(root, "demo", "shared"), join(site, "shared"), { recursive: true });
cpSync(join(root, "demo", "catalog"), join(site, "catalog"), { recursive: true });
cpSync(join(root, "demo", "deployments"), join(site, "deployments"), { recursive: true });

writeFileSync(join(site, "index.html"), patchHubPage(readFileSync(join(root, "demo", "index.html"), "utf8")));

for (const scenario of ["catalog", "deployments"]) {
  const file = join(site, scenario, "index.html");
  writeFileSync(file, patchScenarioPage(readFileSync(file, "utf8")));
}

writeFileSync(join(site, ".nojekyll"), "");
console.log(`Prepared ${site} for GitHub Pages at ${pagesUrl}`);
