import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const PRODUCTION_BASE_URL =
  "https://impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net";

const baseUrl = (
  process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || PRODUCTION_BASE_URL
).replace(/\/+$/, "");

const sourceUrl = `${baseUrl}/openapi/v1.json`;
const tmpFile = resolve("/tmp", "impactx-openapi.json");
const outFile = resolve(root, "src", "api", "generated", "schema.d.ts");

function run(cmd, args, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
    child.on("error", rejectPromise);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

async function main() {
  console.log(`Fetching OpenAPI from ${sourceUrl} ...`);
  const response = await fetch(sourceUrl, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`No se pudo descargar el OpenAPI: HTTP ${response.status}`);
  }
  const body = Buffer.from(await response.arrayBuffer());

  await rm(tmpFile, { force: true });
  await writeFile(tmpFile, body);

  await mkdir(dirname(outFile), { recursive: true });

  await run(
    "npx",
    ["openapi-typescript", tmpFile, "--output", outFile, "--pretty"],
    root,
  );

  await rm(tmpFile, { force: true });
  console.log(`Tipos generados en ${outFile}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});