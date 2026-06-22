import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const release = resolve(root, "release");
const required = ["main.js", "manifest.json", "styles.css"];

for (const file of required) {
  if (!existsSync(resolve(dist, file))) throw new Error(`缺少 dist/${file}，请先运行 npm run build`);
}

const manifest = JSON.parse(await readFile(resolve(dist, "manifest.json"), "utf8"));
const staging = resolve(release, ".package-tmp");
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
for (const file of required) await cp(resolve(dist, file), resolve(staging, file));

await mkdir(release, { recursive: true });
const target = resolve(release, `mini-calendar-${manifest.version}.zip`);
await rm(target, { force: true });
const result = spawnSync("zip", ["-q", "-r", target, ...required], { cwd: staging });
await rm(staging, { recursive: true, force: true });
if (result.status !== 0) throw new Error("打包失败");
console.log(`Packaged ${target}`);
