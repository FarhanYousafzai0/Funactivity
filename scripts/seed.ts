// Demo data for rehearsing the activity: three profiles, two pitches, one scored.
// Local: writes to file:local.db. Production: set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.
// Safe to re-run: demo rows are replaced by id. Real student rows are never touched.
import { createClient } from "@libsql/client";
import { SCHEMA_SQL } from "../db/schema.ts";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
const now = Date.now();
const at = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

const profiles = [
  { id: "de0000000a", name: "Ayesha Khan", tagline: "FSc student, Nowshera", createdAt: at(42) },
  { id: "de0000000b", name: "Bilal Ahmed", tagline: "Runs his father's general store", createdAt: at(37) },
  { id: "de0000000c", name: "Sana Yousaf", tagline: "BS Computer Science, 3rd semester", createdAt: at(30) },
];

const pitches = [
  {
    id: "de00000p0a",
    profileId: "de0000000a",
    title: "ClinicBot",
    problem: "Small clinics miss half their phone calls during busy hours, so patients wait outside or go to another clinic.",
    audience: "Family clinics in Nowshera with one receptionist",
    solution: "A WhatsApp agent that answers in Urdu, books the next free slot, sends a reminder, and hands over to the receptionist for anything unusual.",
    createdAt: at(25),
  },
  {
    id: "de00000p0b",
    profileId: "de0000000b",
    title: "Udhaar Diary",
    problem: "Shopkeepers keep customer credit (udhaar) in paper notebooks and lose track of who owes what.",
    audience: "Small general-store owners",
    solution: "Photograph the notebook page, AI reads the entries into a ledger, and sends polite WhatsApp reminders on due dates.",
    createdAt: at(18),
  },
];

const scores = [{ pitchId: "de00000p0a", problem: 5, solution: 4, ai_use: 4, clarity: 5, note: "Clear problem, great use of WhatsApp. Say how the clinic pays for it.", scoredAt: at(10) }];

for (const sql of SCHEMA_SQL) await client.execute(sql);

await client.batch(
  [
    ...profiles.map((p) => ({
      sql: "INSERT OR REPLACE INTO profiles (id, name, tagline, photo, photo_style, hidden, created_at) VALUES (?, ?, ?, NULL, NULL, 0, ?)",
      args: [p.id, p.name, p.tagline, p.createdAt],
    })),
    ...pitches.map((t) => ({
      sql: "INSERT OR REPLACE INTO pitches (id, profile_id, title, problem, audience, solution, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [t.id, t.profileId, t.title, t.problem, t.audience, t.solution, t.createdAt, t.createdAt],
    })),
    ...scores.map((s) => ({
      sql: "INSERT OR REPLACE INTO scores (pitch_id, problem, solution, ai_use, clarity, note, scored_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [s.pitchId, s.problem, s.solution, s.ai_use, s.clarity, s.note, s.scoredAt],
    })),
  ],
  "write",
);

console.log(`Seeded ${profiles.length} demo profiles, ${pitches.length} pitches and ${scores.length} score into ${url}.`);
