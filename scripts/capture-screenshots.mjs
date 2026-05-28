/**
 * Capture demo screenshots (Playwright).
 *
 * Usage:
 *   npm run build
 *   npm run screenshots          # starts a temporary static server
 *   DEMO_BASE_URL=http://127.0.0.1:9080 npm run screenshots  # existing server
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs", "images");
const port = Number(process.env.DEMO_PORT || 9081);
const base = (process.env.DEMO_BASE_URL || `http://127.0.0.1:${port}`).replace(/\/$/, "");

mkdirSync(outDir, { recursive: true });

async function expandPostOperation(page) {
  await page.waitForSelector("#swagger-ui .swagger-ui", { timeout: 20000 });
  await page.waitForTimeout(800);
  const summary = page.locator("#swagger-ui .opblock-post .opblock-summary").first();
  const expanded = await summary.getAttribute("aria-expanded");
  if (expanded !== "true") {
    await summary.click();
    await page.waitForTimeout(700);
  }
}

async function selectParam(page, name, value) {
  const select = page.locator(`tr[data-param-name="${name}"] select.gcv-native-select`);
  await select.waitFor({ state: "visible", timeout: 10000 });
  await select.selectOption(value);
  await page.waitForTimeout(500);
}

const shots = [
  {
    file: "catalog-no-selection.png",
    title: "Catalog — no selectors chosen (body gated)",
    url: `${base}/demo/catalog/`,
    setup: expandPostOperation,
  },
  {
    file: "catalog-single-selection.png",
    title: "Catalog — one selector (region only; tier + body still gated)",
    url: `${base}/demo/catalog/`,
    setup: async (page) => {
      await expandPostOperation(page);
      await selectParam(page, "region", "us-east");
    },
  },
  {
    file: "catalog-complete-example.png",
    title: "Catalog — both selectors (resolved Example Value)",
    url: `${base}/demo/catalog/`,
    setup: async (page) => {
      await expandPostOperation(page);
      await selectParam(page, "region", "us-east");
      await selectParam(page, "tier", "gold");
      await page.waitForTimeout(600);
    },
  },
  {
    file: "catalog-complete-schema.png",
    title: "Catalog — both selectors (resolved Schema tab)",
    url: `${base}/demo/catalog/`,
    setup: async (page) => {
      await expandPostOperation(page);
      await selectParam(page, "region", "us-east");
      await selectParam(page, "tier", "gold");
      const schemaTab = page.locator(
        '#swagger-ui button.tablinks[data-name="model"], #swagger-ui .tab-item[data-name="model"]'
      );
      if ((await schemaTab.count()) > 0) {
        await schemaTab.first().click();
        await page.waitForTimeout(500);
      }
    },
  },
  {
    file: "deployments-single-selection.png",
    title: "Deployments — region only (2 selectors + body still gated)",
    url: `${base}/demo/deployments/`,
    setup: async (page) => {
      await expandPostOperation(page);
      await selectParam(page, "region", "us-east");
    },
  },
  {
    file: "deployments-partial-selection.png",
    title: "Deployments — region + tier (header channel still required)",
    url: `${base}/demo/deployments/`,
    setup: async (page) => {
      await expandPostOperation(page);
      await selectParam(page, "region", "us-east");
      await selectParam(page, "tier", "gold");
    },
  },
  {
    file: "deployments-complete.png",
    title: "Deployments — all three selectors (path + path + header)",
    url: `${base}/demo/deployments/`,
    setup: async (page) => {
      await expandPostOperation(page);
      await selectParam(page, "region", "us-east");
      await selectParam(page, "tier", "gold");
      await selectParam(page, "X-Channel", "web");
      await page.waitForTimeout(600);
    },
  },
];

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "npx",
      ["--yes", "http-server", ".", "-p", String(port), "-c-1"],
      { cwd: root, stdio: ["ignore", "pipe", "pipe"] }
    );
    let ready = false;
    const onData = (chunk) => {
      const text = chunk.toString();
      if (!ready && /http-server|Available|accepting/i.test(text)) {
        ready = true;
        resolve(proc);
      }
    };
    proc.stdout.on("data", onData);
    proc.stderr.on("data", onData);
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (!ready) reject(new Error(`http-server exited with ${code}`));
    });
    setTimeout(() => {
      if (!ready) {
        ready = true;
        resolve(proc);
      }
    }, 3000);
  });
}

async function waitForServer(url) {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${url}/demo/catalog/`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server not reachable at ${url}`);
}

async function main() {
  let serverProc = null;
  const useExternal = Boolean(process.env.DEMO_BASE_URL);

  if (!useExternal) {
    console.log(`Starting static server on ${base} ...`);
    serverProc = await startStaticServer();
    await waitForServer(base);
  }

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });

  let failed = 0;
  for (const shot of shots) {
    const page = await context.newPage();
    console.log("Capturing", shot.file, "←", shot.url);
    try {
      await page.goto(shot.url, { waitUntil: "networkidle", timeout: 45000 });
      await shot.setup(page);
      await page.screenshot({
        path: join(outDir, shot.file),
        fullPage: false,
      });
      console.log("  wrote", join(outDir, shot.file));
    } catch (err) {
      console.error("  failed:", err.message);
      failed++;
    }
    await page.close();
  }

  await browser.close();
  if (serverProc) serverProc.kill("SIGTERM");

  if (failed > 0) {
    console.error(`\n${failed} screenshot(s) failed.`);
    process.exit(1);
  }
  console.log("\nDone. Images in docs/images/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
