/**
 * Resolve public API base for axios (used at build time in vite.config.js only).
 * Supports Vercel env names people often use by mistake (without VITE_ prefix).
 *
 * Resolution: for each key below, `process.env` wins over values from `loadEnv` (`.env*` files).
 */

/** @type {readonly string[]} Order matters — first hit wins within each tier. */
const API_BASE_ENV_KEYS = [
  "VITE_API_BASE_URL",
  "VITE_BACKEND_URL",
  "BACKEND_URL",
  "BACKEND_PUBLIC_URL",
  // Common mis-names / hosting presets
  "VITE_API_URL",
  "API_URL",
];

function normalizePublicApiBase(input) {
  const t = String(input || "").trim();
  if (!t) return "";
  if (t.startsWith("/")) return t;
  if (!/^https?:\/\//i.test(t)) return t;
  try {
    const u = new URL(t);
    const path = (u.pathname || "/").replace(/\/+$/, "") || "/";
    if (path === "/" || path === "") {
      return `${u.origin}/api`;
    }
    return t.replace(/\/+$/, "");
  } catch {
    return t.replace(/\/+$/, "");
  }
}

/**
 * @param {Record<string, string>} env from loadEnv
 */
function resolvePublicApiBase(env) {
  for (const key of API_BASE_ENV_KEYS) {
    const v = process.env[key];
    if (typeof v === "string" && v.trim()) {
      return normalizePublicApiBase(v);
    }
  }
  for (const key of API_BASE_ENV_KEYS) {
    const v = env[key];
    if (typeof v === "string" && v.trim()) {
      return normalizePublicApiBase(v);
    }
  }
  return "";
}

module.exports = { resolvePublicApiBase };
