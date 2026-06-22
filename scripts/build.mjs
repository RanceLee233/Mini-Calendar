import { cpSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outdir = resolve(root, "dist");
const pluginDir = process.env.OBSIDIAN_PLUGIN_DEV_DIR;

mkdirSync(outdir, { recursive: true });

await esbuild.build({
  entryPoints: [resolve(root, "src/main.ts")],
  outfile: resolve(outdir, "main.js"),
  bundle: true,
  external: ["obsidian", "electron"],
  format: "cjs",
  platform: "browser",
  target: "es2022",
  sourcemap: false,
  logLevel: "info"
});

for (const file of ["manifest.json", "styles.css", "versions.json"]) {
  cpSync(resolve(root, file), resolve(outdir, file));
}

if (pluginDir) {
  mkdirSync(pluginDir, { recursive: true });
  for (const file of ["main.js", "manifest.json", "styles.css", "versions.json"]) {
    cpSync(resolve(outdir, file), resolve(pluginDir, file));
  }
  console.log(`Synced plugin to ${pluginDir}`);
}
