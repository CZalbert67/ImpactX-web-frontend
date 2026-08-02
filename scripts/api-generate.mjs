import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const ALLOWED_HOST = "impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net";
const OPENAPI_PATHNAME = "/openapi/v1.json";
const PRODUCTION_OPENAPI_URL = `https://${ALLOWED_HOST}${OPENAPI_PATHNAME}`;
const OUTPUT_RELATIVE = ["src", "api", "generated", "schema.d.ts"];

function validateOpenApiUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`IMPACTX_OPENAPI_URL no es una URL válida: ${raw}`);
  }

  const allowed =
    url.protocol === "https:" &&
    url.hostname === ALLOWED_HOST &&
    url.pathname === OPENAPI_PATHNAME &&
    url.username === "" &&
    url.password === "" &&
    url.search === "" &&
    url.hash === "";

  if (!allowed) {
    throw new Error(`URL de OpenAPI no permitida: ${raw}`);
  }

  return url.toString();
}

function resolveOutputPath() {
  const outFile = resolve(root, ...OUTPUT_RELATIVE);
  const fromRoot = relative(root, outFile);
  if (
    isAbsolute(fromRoot) ||
    fromRoot === ".." ||
    fromRoot.startsWith(`..${sep}`)
  ) {
    throw new Error("La ruta de salida queda fuera del repositorio.");
  }
  return outFile;
}

function run(cmd, args, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
    child.on("error", rejectPromise);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`openapi-typescript finalizó con código ${code}`));
    });
  });
}

async function main() {
  const rawUrl = process.env.IMPACTX_OPENAPI_URL || PRODUCTION_OPENAPI_URL;
  const sourceUrl = validateOpenApiUrl(rawUrl);
  const outFile = resolveOutputPath();
  const cli = resolve(root, "node_modules", "openapi-typescript", "bin", "cli.js");

  mkdirSync(dirname(outFile), { recursive: true });

  console.log(`Generando tipos desde ${sourceUrl}`);
  await run(process.execPath, [cli, sourceUrl, "--output", outFile, "--pretty"], root);
  console.log(`Tipos generados en ${outFile}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});