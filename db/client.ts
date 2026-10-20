import { createClient, type Client, type InValue } from "@libsql/client";

// One libSQL client per server instance. Local development falls back to a SQLite file;
// production (Vercel) must point TURSO_DATABASE_URL at the Turso database.
const shared = globalThis as typeof globalThis & { pitchArenaClient?: Client };

export function databaseUrl() {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) return url;
  if (process.env.VERCEL) throw new Error("TURSO_DATABASE_URL is not configured.");
  return "file:local.db";
}

export class Statement {
  constructor(readonly client: Client, readonly sql: string, readonly args: InValue[] = []) {}

  bind(...args: InValue[]) {
    return new Statement(this.client, this.sql, args);
  }

  async all<T>() {
    const result = await this.client.execute({ sql: this.sql, args: this.args });
    const results = result.rows.map((row) => Object.fromEntries(result.columns.map((column, index) => [column, row[index]])));
    return { results: results as T[] };
  }

  async first<T>() {
    return (await this.all<T>()).results[0] ?? null;
  }

  async run() {
    await this.client.execute({ sql: this.sql, args: this.args });
  }
}

export type Database = {
  prepare: (sql: string) => Statement;
  batch: (statements: Statement[]) => Promise<void>;
};

export function wrapClient(client: Client): Database {
  return {
    prepare: (sql) => new Statement(client, sql),
    batch: async (statements) => {
      await client.batch(statements.map(({ sql, args }) => ({ sql, args })), "write");
    },
  };
}

export function getDb(): Database {
  const client = (shared.pitchArenaClient ??= createClient({ url: databaseUrl(), authToken: process.env.TURSO_AUTH_TOKEN }));
  return wrapClient(client);
}
