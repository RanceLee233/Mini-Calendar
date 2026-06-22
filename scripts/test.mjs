import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import * as esbuild from "esbuild";

const root = resolve(import.meta.dirname, "..");
const temp = await mkdtemp(join(tmpdir(), "mini-calendar-test-"));
const outfile = join(temp, "calendar-utils.test.cjs");

try {
  await esbuild.build({
    entryPoints: [resolve(root, "tests/calendar-utils.test.ts")],
    outfile,
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20",
    logLevel: "silent"
  });
  const result = spawnSync(process.execPath, [outfile], { stdio: "inherit" });
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  await rm(temp, { recursive: true, force: true });
}
