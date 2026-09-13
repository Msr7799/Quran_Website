const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dztqisk5e";
const CLOUDINARY_FOLDER = "quran-website";

const localOnlyAssets = new Set([
  "images/library/quran_pdf/012.svg",
  "images/library/quran_pdf/013.svg",
]);

function encodeCloudinaryPath(value: string) {
  return value.split("/").map(encodeURIComponent).join("/");
}

/**
 * Returns the final Cloudinary CDN URL directly for assets that were migrated
 * with scripts/migrate-content.mjs. This avoids the old browser -> /api/media
 * -> MongoDB -> 307 -> Cloudinary request chain.
 *
 * Small same-origin assets such as fonts, Lottie JSON, PDF.js WASM and the
 * optimized navigation icons intentionally bypass this helper and stay local.
 */
export function cloudinaryAsset(publicPath: string) {
  const cleanPath = publicPath.split("?")[0].replace(/^\/+/, "");

  // These two files exceeded the automatic Cloudinary migration size limit.
  // Keep their existing local fallback unless/until the live Cloudinary audit
  // confirms that matching remote assets exist.
  if (localOnlyAssets.has(cleanPath)) return `/${encodeCloudinaryPath(cleanPath)}`;

  const extension = cleanPath.match(/\.([^.]+)$/)?.[1]?.toLowerCase();
  const resourceType = extension === "mp4" ? "video" : "image";
  const encodedPath = encodeCloudinaryPath(`${CLOUDINARY_FOLDER}/${cleanPath}`);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${encodedPath}`;
}
