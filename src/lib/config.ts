import path from "node:path";

export function getDataDir() {
  return process.env.BRIBE_DATA_DIR ?? path.join(process.cwd(), "data");
}

export function getDatabasePath() {
  return process.env.BRIBE_DATABASE_PATH ?? path.join(getDataDir(), "bribe.sqlite");
}

export function getDatabaseConfig() {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  if (url) {
    return {
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };
  }

  if (process.env.NODE_ENV === "test") {
    return {
      url: `file:${getDatabasePath()}`,
      authToken: undefined,
    };
  }

  throw new Error("TURSO_DATABASE_URL is required to connect to the Bribe database.");
}

export function getUploadsDir() {
  return process.env.BRIBE_UPLOADS_DIR ?? path.join(getDataDir(), "uploads");
}

export function getOpenRouterConfig() {
  return {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL ?? "google/gemini-3-flash-preview",
    siteUrl: process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
    appName: process.env.OPENROUTER_APP_NAME ?? "Bribe local demo",
  };
}
