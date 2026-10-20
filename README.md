# Pitch Arena — the bootcamp fun activity

Next.js (App Router) app for the **NextGen AI Bootcamp** "Pitch us a business idea" activity. Students create a
profile with an AI-generated photo, optionally pitch a business idea (Shark-Tank style), and the judges score every
pitch on a four-point rubric. A dark **live board** shows the ranking on the projector. The app also teaches
**server side vs client side**: a header toggle outlines every server part green and every client part orange.

Data lives in **Turso** (hosted libSQL/SQLite) in production and in the file `local.db` locally. Deploys to **Vercel**.

## Pages

| Route | Who | What |
|---|---|---|
| `/` | Everyone | Steps, your status if this device has a profile, the wall of everyone in the arena |
| `/profile/new` | Students | Name, photo style, the prompt to copy into ChatGPT / Gemini, upload the generated picture |
| `/profile/[id]` | Everyone | Profile card; the owner gets "Pitch now / Maybe later" |
| `/pitch/new` | Profile owners | Idea name, the problem, who has it, how AI solves it. Editable until scored |
| `/pitch/[id]` | Everyone | The pitch, plus the judges' score once given |
| `/board` | Everyone | Projector ranking, refreshes itself every 10 s |
| `/learn` | Students | Plain-language server vs client explainer using this app's own pages |
| `/admin` | Judges (password) | Score pitches, see the ranking, hide a profile |
| `/photo/[id]` | — | Route handler that serves a profile photo as JPEG |

## How the activity runs in the room

1. Put the app URL (or a QR code to it) on the screen. Students open `/` on their phones.
2. **Profile**: they type their name, pick a style, press **Copy prompt**, open ChatGPT or Gemini, attach a selfie,
   paste the prompt, download the picture, and upload it. The browser shrinks it to 512×512 before upload.
3. **Pitch** (optional): the same device is remembered by a signed cookie, so they can pitch now or later from `/`.
4. **Judges** sign in at `/admin` with `ADMIN_PASSWORD`, score each pitch 1–5 on four criteria (max 20) and can leave a
   note the student sees. Hiding a profile removes it from every public page without deleting anything.
5. Keep `/board` open on the projector. It re-renders on the server every 10 seconds.
6. Turn on **Teach mode** in the header to show which parts run where. `/learn` has the explanation.

## Local development

Requires Node 22.18+.

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD and APP_SECRET
npm run dev                  # http://localhost:3002
npm run db:seed              # optional: three demo profiles, two pitches, one score
```

Without `TURSO_DATABASE_URL` the app uses `local.db`. Tables are created automatically on first use
(`db/schema.ts`). `npm test` runs the unit tests for scoring, validation and cookie tokens; `npm run lint` and
`npm run build` should both be clean before deploying.

## Deploy: Turso + Vercel

1. Create the database (Turso CLI, after `turso auth login`):
   ```bash
   turso db create pitch-arena
   turso db show pitch-arena --url
   turso db tokens create pitch-arena
   ```
2. On Vercel, set the environment variables from `.env.example`: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
   `ADMIN_PASSWORD`, and a long random `APP_SECRET`. The app refuses to start on Vercel without the last two.
3. Import the GitHub repo `FarhanYousafzai0/Funactivity` as the Vercel project (the app is at the repo root). Tables are created on the first request.

## How it is built

- `db/client.ts` — libSQL client (same pattern as the ai-skool repo's `apps/ai-skool-leaderboard`); `db/queries.ts` — all SQL.
- `app/actions/*.ts` — Server Actions. Every rule is checked here; the forms only give early feedback.
- `lib/auth.ts` — the two cookies: `pa_profile` (signed profile id) and `pa_admin` (HMAC of the password).
- `components/Boundary.tsx` — the teach-mode wrapper. CSS in `app/globals.css` draws the outlines only while
  `<html data-teach="on">`.
- Two root layouts: `app/(site)` has the header and footer; `app/(board)` is the bare dark projector layout.
