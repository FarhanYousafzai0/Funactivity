import type { Metadata } from "next";
import Link from "next/link";
import { Boundary } from "@/components/Boundary";
import { CopyButton } from "@/components/CopyButton";

export const metadata: Metadata = { title: "How it works" };

const pages = [
  { route: "/", server: "Reads your cookie, counts profiles, loads the wall", client: "Nothing. Plain links." },
  { route: "/profile/new", server: "Checks the name and photo again, saves the row, sets your cookie", client: "Typing, copying the prompt, shrinking the photo to 512×512" },
  { route: "/pitch/new", server: "Checks the cookie, saves the pitch, redirects", client: "Character counters, enabling the button" },
  { route: "/photo/[id]", server: "A route handler: turns the stored photo into JPEG bytes", client: "The <img> tag simply asks for the URL" },
  { route: "/board", server: "Ranks every scored pitch", client: "A 10-second timer that asks for a fresh page" },
  { route: "/admin", server: "Checks the admin cookie, saves scores", client: "The 1–5 score buttons" },
];

const flow = [
  "You type your name and choose a picture. Your browser shrinks the picture to 512×512 (client).",
  "You press Create. The browser sends the form to a Server Action over HTTPS (network).",
  "The server checks the name length and the photo size again. It never trusts the browser (server).",
  "The server inserts a row into the database and signs a cookie with your profile id (server).",
  "The server answers with a redirect to /profile/<id>. The browser follows it (network).",
  "The profile page runs on the server, reads the row from the database and sends finished HTML (server).",
  "Your browser shows the HTML. The photo is a separate request to /photo/<id> (client → server).",
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Boundary kind="server" label="this page is static text rendered on the server">
        <header>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-deep">For students</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Server side vs client side</h1>
          <p className="mt-3 text-lg leading-8 text-muted">
            Every website is two computers talking. The <strong className="text-ink">server</strong> is our computer: it keeps the database, checks the rules and
            builds pages. The <strong className="text-ink">client</strong> is your phone or laptop: it shows the page and reacts to your taps.
          </p>
        </header>
      </Boundary>

      <section className="grid gap-4 sm:grid-cols-2">
        <Boundary kind="server" label="example of a server part">
          <div className="h-full rounded-3xl border border-line bg-white/85 p-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand-deep">Server</p>
            <h2 className="mt-1 text-xl font-black">Trusted, has the data</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
              <li>Talks to the database (profiles, pitches, scores).</li>
              <li>Checks every rule again, even if the form already did.</li>
              <li>Knows secrets: the admin password, the cookie key.</li>
              <li>Sends HTML, so the page works before any JavaScript.</li>
            </ul>
          </div>
        </Boundary>
        <Boundary kind="client" label="example of a client part">
          <div className="h-full rounded-3xl border border-line bg-white/85 p-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-client">Client</p>
            <h2 className="mt-1 text-xl font-black">Fast, interactive, not trusted</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
              <li>Reacts instantly: counters, previews, copy buttons.</li>
              <li>Can use the camera, clipboard and canvas.</li>
              <li>Anyone can change it in DevTools, so it decides nothing.</li>
              <li>In this app, files that start with <code className="rounded bg-mint px-1 font-mono text-xs">&quot;use client&quot;</code>.</li>
            </ul>
          </div>
        </Boundary>
      </section>

      <Boundary kind="server" label="table of this app's pages">
        <section>
          <h2 className="text-2xl font-black">Where each part of Pitch Arena runs</h2>
          <div className="mt-3 overflow-x-auto rounded-3xl border border-line bg-white/85">
            <table className="w-full text-left text-sm">
              <thead className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-4 py-3">Page</th>
                  <th className="px-4 py-3 text-brand-deep">Server does</th>
                  <th className="px-4 py-3 text-client">Browser does</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pages.map((row) => (
                  <tr key={row.route}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold">{row.route}</td>
                    <td className="px-4 py-3 leading-6">{row.server}</td>
                    <td className="px-4 py-3 leading-6">{row.client}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Boundary>

      <Boundary kind="server" label="the create-profile request, step by step">
        <section>
          <h2 className="text-2xl font-black">What happens when you create a profile</h2>
          <ol className="mt-3 space-y-2">
            {flow.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-2xl border border-line bg-white/85 px-4 py-3 text-sm leading-6">
                <span className="font-mono font-black text-brand-deep">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </Boundary>

      <Boundary kind="client" label="a client component you can press">
        <section className="rounded-3xl border border-line bg-ink p-6 text-white">
          <h2 className="text-2xl font-black">Try it</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Turn on <strong className="text-brand">Teach mode</strong> in the header. Every page gets green outlines for server parts and orange outlines for client parts.
            Then open any page and look for the labels. The button below is a client component: it uses your clipboard, which only exists in the browser.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <CopyButton text="Server = trusted computer with the data. Client = my browser, fast but not trusted." label="Copy the one-line summary" className="bg-brand text-ink hover:bg-white" />
            <Link href="/" className="inline-flex h-11 items-center rounded-full border border-white/30 px-5 text-sm font-bold hover:bg-white/10">
              Back to the arena
            </Link>
          </div>
        </section>
      </Boundary>
    </div>
  );
}
