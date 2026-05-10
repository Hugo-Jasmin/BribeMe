import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { getDatabasePath } from "@/lib/config";

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    const dbPath = getDatabasePath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
  }

  return db;
}

export function closeDbForTests() {
  db?.close();
  db = null;
}

function migrate(database: Database.Database) {
  database.exec(`
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
}
