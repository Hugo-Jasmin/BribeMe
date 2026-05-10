import path from "node:path";

export function getDataDir() {
  return process.env.BRIBEME_DATA_DIR ?? path.join(process.cwd(), "data");
}

export function getDatabasePath() {
  return process.env.BRIBEME_DATABASE_PATH ?? path.join(getDataDir(), "bribeme.sqlite");
}

export function getUploadsDir() {
  return process.env.BRIBEME_UPLOADS_DIR ?? path.join(getDataDir(), "uploads");
}

export function getOpenRouterConfig() {
  return {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL ?? "google/gemini-3-flash-preview",
    siteUrl: process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
    appName: process.env.OPENROUTER_APP_NAME ?? "BribeMe local demo",
  };
}
