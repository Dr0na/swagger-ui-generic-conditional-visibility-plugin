/**
 * Verify demo static assets respond with HTTP 2xx.
 * Usage: npm run build && node scripts/verify-demos.mjs
 * Optional: DEMO_BASE_URL=http://127.0.0.1:9080 (server must be running)
 */
const base = (process.env.DEMO_BASE_URL || "http://127.0.0.1:9080").replace(/\/$/, "");

const paths = [
  "/",
  "/index.html",
  "/demo/",
  "/demo/index.html",
  "/demo/catalog/",
  "/demo/catalog/openapi.yaml",
  "/demo/deployments/",
  "/demo/deployments/openapi.yaml",
  "/demo/shared/demo.css",
  "/demo/shared/swagger-init.js",
  "/dist/generic-conditional-visibility-plugin.js",
  "/docs/DEMOS.md",
  "/docs/EXTENSION-CONTRACT.md",
  "/README.md",
];

let failed = 0;
for (const path of paths) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      console.error(`FAIL ${res.status} ${path}`);
      failed++;
    } else {
      console.log(`OK   ${res.status} ${path}`);
    }
  } catch (err) {
    console.error(`FAIL ${path} — ${err.message}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} URL(s) failed. Start a server: npm run demo`);
  process.exit(1);
}
console.log("\nAll demo URLs OK.");
