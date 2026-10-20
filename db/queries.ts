import { randomUUID } from "node:crypto";
import { rankEntries, totalScore, type ScoreInput } from "@/lib/scoring";
import { getDb } from "./client";
import { ensureSchema } from "./schema";

// Everything the pages need from the database, in plain SQL.
// Photos are big (a data URL each), so list queries only report whether one exists;
// the image itself is served by app/photo/[id]/route.ts.

export type Profile = {
  id: string;
  name: string;
  tagline: string | null;
  photoStyle: string | null;
  hasPhoto: boolean;
  hidden: boolean;
  createdAt: string;
};

export type ProfileSummary = Profile & { pitchId: string | null; scored: boolean };

export type Pitch = {
  id: string;
  profileId: string;
  title: string;
  problem: string;
  audience: string;
  solution: string;
  createdAt: string;
  updatedAt: string;
};

export type Score = ScoreInput & { note: string | null; scoredAt: string };

export type PitchEntry = {
  pitch: Pitch;
  profile: Profile;
  score: Score | null;
  total: number | null;
  scoredAt: string | null;
};

export type RankedEntry = PitchEntry & { rank: number | null };

async function db() {
  const database = getDb();
  await ensureSchema(database);
  return database;
}

export function newId() {
  return randomUUID().replace(/-/g, "").slice(0, 10);
}

function now() {
  return new Date().toISOString();
}

// ---- Profiles ----

type ProfileRow = {
  id: string;
  name: string;
  tagline: string | null;
  photoStyle: string | null;
  hasPhoto: number;
  hidden: number;
  createdAt: string;
  pitchId?: string | null;
  scored?: number | null;
};

const PROFILE_COLUMNS =
  "p.id, p.name, p.tagline, p.photo_style AS photoStyle, (p.photo IS NOT NULL) AS hasPhoto, p.hidden, p.created_at AS createdAt";

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    photoStyle: row.photoStyle,
    hasPhoto: Boolean(row.hasPhoto),
    hidden: Boolean(row.hidden),
    createdAt: row.createdAt,
  };
}

export async function createProfile(input: { name: string; tagline: string | null; photo: string; photoStyle: string }) {
  const id = newId();
  await (await db())
    .prepare("INSERT INTO profiles (id, name, tagline, photo, photo_style, hidden, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)")
    .bind(id, input.name, input.tagline, input.photo, input.photoStyle, now())
    .run();
  return id;
}

export async function getProfile(id: string) {
  const row = await (await db()).prepare(`SELECT ${PROFILE_COLUMNS} FROM profiles p WHERE p.id = ?`).bind(id).first<ProfileRow>();
  return row ? toProfile(row) : null;
}

export async function getProfilePhoto(id: string) {
  const row = await (await db()).prepare("SELECT photo, hidden FROM profiles WHERE id = ?").bind(id).first<{ photo: string | null; hidden: number }>();
  return row ? { photo: row.photo, hidden: Boolean(row.hidden) } : null;
}

export async function listProfiles(options: { includeHidden?: boolean } = {}): Promise<ProfileSummary[]> {
  const where = options.includeHidden ? "" : "WHERE p.hidden = 0";
  const { results } = await (await db())
    .prepare(
      `SELECT ${PROFILE_COLUMNS}, t.id AS pitchId, (s.pitch_id IS NOT NULL) AS scored
       FROM profiles p
       LEFT JOIN pitches t ON t.profile_id = p.id
       LEFT JOIN scores s ON s.pitch_id = t.id
       ${where}
       ORDER BY p.created_at DESC`,
    )
    .all<ProfileRow>();
  return results.map((row) => ({ ...toProfile(row), pitchId: row.pitchId ?? null, scored: Boolean(row.scored) }));
}

export async function setProfileHidden(id: string, hidden: boolean) {
  await (await db()).prepare("UPDATE profiles SET hidden = ? WHERE id = ?").bind(hidden ? 1 : 0, id).run();
}

/** Removes the student, their pitch and its score for good. Explicit deletes, so it works even without FK enforcement. */
export async function deleteProfile(id: string) {
  const database = await db();
  await database.batch([
    database.prepare("DELETE FROM scores WHERE pitch_id IN (SELECT id FROM pitches WHERE profile_id = ?)").bind(id),
    database.prepare("DELETE FROM pitches WHERE profile_id = ?").bind(id),
    database.prepare("DELETE FROM profiles WHERE id = ?").bind(id),
  ]);
}

// ---- Pitches (joined with their profile and score) ----

type EntryRow = {
  id: string;
  profileId: string;
  title: string;
  problem: string;
  audience: string;
  solution: string;
  createdAt: string;
  updatedAt: string;
  pName: string;
  pTagline: string | null;
  pPhotoStyle: string | null;
  pHasPhoto: number;
  pHidden: number;
  pCreatedAt: string;
  sProblem: number | null;
  sSolution: number | null;
  sAiUse: number | null;
  sClarity: number | null;
  sNote: string | null;
  scoredAt: string | null;
};

const ENTRY_SELECT = `
  SELECT t.id, t.profile_id AS profileId, t.title, t.problem, t.audience, t.solution,
         t.created_at AS createdAt, t.updated_at AS updatedAt,
         p.name AS pName, p.tagline AS pTagline, p.photo_style AS pPhotoStyle,
         (p.photo IS NOT NULL) AS pHasPhoto, p.hidden AS pHidden, p.created_at AS pCreatedAt,
         s.problem AS sProblem, s.solution AS sSolution, s.ai_use AS sAiUse, s.clarity AS sClarity,
         s.note AS sNote, s.scored_at AS scoredAt
  FROM pitches t
  JOIN profiles p ON p.id = t.profile_id
  LEFT JOIN scores s ON s.pitch_id = t.id`;

function toEntry(row: EntryRow): PitchEntry {
  const score: Score | null =
    row.scoredAt && row.sProblem !== null && row.sSolution !== null && row.sAiUse !== null && row.sClarity !== null
      ? { problem: row.sProblem, solution: row.sSolution, ai_use: row.sAiUse, clarity: row.sClarity, note: row.sNote, scoredAt: row.scoredAt }
      : null;
  return {
    pitch: {
      id: row.id,
      profileId: row.profileId,
      title: row.title,
      problem: row.problem,
      audience: row.audience,
      solution: row.solution,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
    profile: {
      id: row.profileId,
      name: row.pName,
      tagline: row.pTagline,
      photoStyle: row.pPhotoStyle,
      hasPhoto: Boolean(row.pHasPhoto),
      hidden: Boolean(row.pHidden),
      createdAt: row.pCreatedAt,
    },
    score,
    total: score ? totalScore(score) : null,
    scoredAt: score ? score.scoredAt : null,
  };
}

export async function getPitch(id: string) {
  const row = await (await db()).prepare(`${ENTRY_SELECT} WHERE t.id = ?`).bind(id).first<EntryRow>();
  return row ? toEntry(row) : null;
}

export async function getPitchForProfile(profileId: string) {
  const row = await (await db()).prepare(`${ENTRY_SELECT} WHERE t.profile_id = ?`).bind(profileId).first<EntryRow>();
  return row ? toEntry(row) : null;
}

/** One pitch per profile: inserts the first time, updates afterwards. Returns the pitch id. */
export async function savePitch(input: { profileId: string; title: string; problem: string; audience: string; solution: string }) {
  const database = await db();
  const existing = await database.prepare("SELECT id FROM pitches WHERE profile_id = ?").bind(input.profileId).first<{ id: string }>();
  const stamp = now();
  if (existing) {
    await database
      .prepare("UPDATE pitches SET title = ?, problem = ?, audience = ?, solution = ?, updated_at = ? WHERE id = ?")
      .bind(input.title, input.problem, input.audience, input.solution, stamp, existing.id)
      .run();
    return existing.id;
  }
  const id = newId();
  await database
    .prepare("INSERT INTO pitches (id, profile_id, title, problem, audience, solution, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, input.profileId, input.title, input.problem, input.audience, input.solution, stamp, stamp)
    .run();
  return id;
}

export async function saveScore(pitchId: string, score: ScoreInput, note: string | null) {
  await (await db())
    .prepare(
      `INSERT INTO scores (pitch_id, problem, solution, ai_use, clarity, note, scored_at) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(pitch_id) DO UPDATE SET problem = excluded.problem, solution = excluded.solution, ai_use = excluded.ai_use,
         clarity = excluded.clarity, note = excluded.note, scored_at = excluded.scored_at`,
    )
    .bind(pitchId, score.problem, score.solution, score.ai_use, score.clarity, note, now())
    .run();
}

export async function listPitches(options: { includeHidden?: boolean } = {}) {
  const where = options.includeHidden ? "" : "WHERE p.hidden = 0";
  const { results } = await (await db()).prepare(`${ENTRY_SELECT} ${where} ORDER BY t.created_at ASC`).all<EntryRow>();
  return results.map(toEntry);
}

export async function leaderboard(options: { includeHidden?: boolean } = {}): Promise<RankedEntry[]> {
  return rankEntries(await listPitches(options));
}

export async function stats() {
  const row = await (await db())
    .prepare(
      `SELECT (SELECT COUNT(*) FROM profiles WHERE hidden = 0) AS profiles,
              (SELECT COUNT(*) FROM pitches t JOIN profiles p ON p.id = t.profile_id WHERE p.hidden = 0) AS pitches,
              (SELECT COUNT(*) FROM scores s JOIN pitches t ON t.id = s.pitch_id JOIN profiles p ON p.id = t.profile_id WHERE p.hidden = 0) AS scored`,
    )
    .first<{ profiles: number; pitches: number; scored: number }>();
  return row ?? { profiles: 0, pitches: 0, scored: 0 };
}
