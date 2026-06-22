import { readFile } from "node:fs/promises";

const readJson = async path => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const [manifest, packageJson, versions] = await Promise.all([
  readJson("manifest.json"),
  readJson("package.json"),
  readJson("versions.json")
]);

if (manifest.version !== packageJson.version) {
  throw new Error(`版本不一致：manifest=${manifest.version}, package=${packageJson.version}`);
}

if (versions[manifest.version] !== manifest.minAppVersion) {
  throw new Error(`versions.json 缺少 ${manifest.version} → ${manifest.minAppVersion}`);
}

if (/\bObsidian\b/iu.test(manifest.description)) {
  throw new Error("插件描述不得包含 Obsidian");
}

console.log(`Release metadata valid: ${manifest.version} (Obsidian ${manifest.minAppVersion}+)`);
