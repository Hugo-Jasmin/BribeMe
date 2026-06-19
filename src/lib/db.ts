import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { getDatabaseConfig } from "@/lib/config";

let db: Promise<Client> | null = null;

export async function getDb() {
  if (!db) {
    db = initializeDb();
  }

  return db;
}

export async function closeDbForTests() {
  const client = await db?.catch(() => null);
  client?.close();
  db = null;
}

async function initializeDb() {
  const config = getDatabaseConfig();
  if (config.url.startsWith("file:")) {
    fs.mkdirSync(path.dirname(config.url.slice("file:".length)), { recursive: true });
  }

  const client = createClient({
    url: config.url,
    authToken: config.authToken,
    intMode: "number",
  });

  await client.execute("PRAGMA foreign_keys = ON");
  await migrate(client);
  return client;
}

async function migrate(database: Client) {
  await database.executeMultiple(`
    CREATE TABLE IF NOT EXISTS venues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      challenge_prompt TEXT NOT NULL,
      reward_label TEXT NOT NULL,
      budget_cents INTEGER,
      max_redemptions INTEGER,
      validation_threshold INTEGER NOT NULL DEFAULT 70,
      starts_at TEXT,
      ends_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
      patron_name TEXT,
      media_path TEXT NOT NULL,
      media_mime TEXT NOT NULL,
      media_type TEXT NOT NULL,
      original_filename TEXT,
      status TEXT NOT NULL DEFAULT 'uploaded',
      quality_score INTEGER,
      task_match_score INTEGER,
      safety_score INTEGER,
      decision_reason TEXT,
      validation_json TEXT,
      reward_code TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
      campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
      code TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'issued',
      expires_at TEXT,
      redeemed_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS social_posts (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
      campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
      description TEXT NOT NULL DEFAULT '',
      caption TEXT NOT NULL,
      channels_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      owner_note TEXT,
      approved_at TEXT,
      posted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_campaigns_venue_id ON campaigns(venue_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_campaign_id ON submissions(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_venue_id ON submissions(venue_id);
    CREATE INDEX IF NOT EXISTS idx_rewards_code ON rewards(code);
    CREATE INDEX IF NOT EXISTS idx_social_posts_venue_id ON social_posts(venue_id);
  `);

  const columns = await database.execute("PRAGMA table_info(social_posts)");
  const hasDescription = columns.rows.some((row) => row.name === "description");
  if (!hasDescription) {
    await database.execute(
      "ALTER TABLE social_posts ADD COLUMN description TEXT NOT NULL DEFAULT ''",
    );
  }
}
