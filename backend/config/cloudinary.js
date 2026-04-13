/* =============================================================================
 * Cloudinary Configuration (v1 SDK)
 * =============================================================================
 * Purpose:
 *   Initialize the Cloudinary SDK for image/file uploads.
 *
 * Behavior:
 *   - Reads `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
 *     from environment variables.
 *   - Calls `cloudinary.config()` to enable signed, secure uploads.
 *   - If credentials are missing, prints a warning and exports the SDK anyway
 *     (upload routes rely on credentials at runtime).
 *
 * Env Vars:
 *   - CLOUDINARY_CLOUD_NAME
 *   - CLOUDINARY_API_KEY
 *   - CLOUDINARY_API_SECRET
 * ============================================================================= */

// Uses cloudinary SDK v1.x (as listed in package.json: "cloudinary": "^1.41.0")
const cloudinary = require("cloudinary").v2;

/* -------------------------------------------------------------------------- */
/*                          ☁️  CLOUDINARY CONFIGURATION                       */
/* -------------------------------------------------------------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true, // always return https:// URLs
});

/* -------------------------------------------------------------------------- */
/*                   🔍 VERIFY CONFIG ON STARTUP (non-fatal)                   */
/* -------------------------------------------------------------------------- */
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY    ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn(
    "⚠️  Cloudinary credentials missing — file uploads will be disabled.\n" +
      "    Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env"
  );
} else {
  console.log(
    `✅ Cloudinary configured — cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`
  );
}

module.exports = cloudinary;
