import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { v2 as cloudinary } from "cloudinary";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
nextEnv.loadEnvConfig(projectRoot);

for (const key of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) {
  if (!process.env[key]) throw new Error(`${key} is not configured`);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function allResources(resourceType) {
  const resources = [];
  let nextCursor;
  do {
    const page = await cloudinary.api.resources({
      resource_type: resourceType,
      type: "upload",
      prefix: "quran-website/",
      max_results: 500,
      next_cursor: nextCursor,
    });
    resources.push(...page.resources);
    nextCursor = page.next_cursor;
  } while (nextCursor);
  return resources;
}

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walk(fullPath));
    else output.push(fullPath);
  }
  return output;
}

const [images, videos, raw] = await Promise.all([
  allResources("image"),
  allResources("video"),
  allResources("raw").catch(() => []),
]);
const remote = [...images, ...videos, ...raw];
const byPublicId = new Map(remote.map((item) => [item.public_id, item]));
const files = await walk(publicRoot);
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const rows = [];
for (const file of files) {
  const relative = path.relative(publicRoot, file).replaceAll("\\", "/");
  const ext = path.extname(relative).toLowerCase();
  if (!imageExtensions.has(ext) && ext !== ".mp4") continue;
  const publicId = `quran-website/${relative.slice(0, -ext.length)}`;
  const local = await stat(file);
  const asset = byPublicId.get(publicId);
  rows.push({
    path: relative,
    localBytes: local.size,
    inCloudinary: Boolean(asset),
    cloudinaryBytes: asset?.bytes ?? null,
    resourceType: asset?.resource_type ?? null,
    format: asset?.format ?? null,
    secureUrl: asset?.secure_url ?? null,
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  remoteResourceCount: remote.length,
  localCandidateCount: rows.length,
  confirmedDuplicates: rows.filter((row) => row.inCloudinary),
  localOnly: rows.filter((row) => !row.inCloudinary),
};

const target = path.join(projectRoot, "cloudinary-audit.json");
await writeFile(target, JSON.stringify(report, null, 2));
console.log(`Cloudinary audit written to ${target}`);
console.log(`Remote resources: ${report.remoteResourceCount}`);
console.log(`Confirmed duplicates: ${report.confirmedDuplicates.length}`);
console.log(`Local-only candidates: ${report.localOnly.length}`);
