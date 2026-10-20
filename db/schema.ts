import type { Database } from "./client.ts";

// Three tables: who is in the room, what they pitched, and what the judges gave it.
// Every statement is idempotent, so this runs once per server instance and again on every seed.
export const SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    photo TEXT,
    photo_style TEXT,
    studies TEXT,
    interests TEXT,
    hidden INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS pitches (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    problem TEXT NOT NULL,
    audience TEXT NOT NULL,
    solution TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS scores (
    pitch_id TEXT PRIMARY KEY REFERENCES pitches(id) ON DELETE CASCADE,
    problem INTEGER NOT NULL,
    solution INTEGER NOT NULL,
    ai_use INTEGER NOT NULL,
    clarity INTEGER NOT NULL,
    note TEXT,
    scored_at TEXT NOT NULL
  )`,
];

// Columns added after the first release. Databases created earlier get them via ALTER TABLE.
export const PROFILE_COLUMNS_ADDED: { name: string; sql: string }[] = [
  { name: "studies", sql: "ALTER TABLE profiles ADD COLUMN studies TEXT" },
  { name: "interests", sql: "ALTER TABLE profiles ADD COLUMN interests TEXT" },
];

export async function applySchema(db: Database) {
  for (const sql of SCHEMA_SQL) await db.prepare(sql).run();
  const { results } = await db.prepare("PRAGMA table_info(profiles)").all<{ name: string }>();
  const existing = new Set(results.map((column) => column.name));
  for (const column of PROFILE_COLUMNS_ADDED) {
    if (!existing.has(column.name)) await db.prepare(column.sql).run();
  }
}

const shared = globalThis as typeof globalThis & { pitchArenaSchema?: Promise<void> };

export function ensureSchema(db: Database) {
  shared.pitchArenaSchema ??= applySchema(db).catch((error) => {
    shared.pitchArenaSchema = undefined;
    throw error;
  });
  return shared.pitchArenaSchema;
}
