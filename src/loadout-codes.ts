// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { DurableObject } from "cloudflare:workers";

export type BuildRecord = { weapon: string; build: Record<string, string> };

/** Sharded registry for shareable, human-entered weapon builds. */
export class LoadoutCodeRegistry extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS loadout_codes (
      code TEXT PRIMARY KEY,
      weapon TEXT NOT NULL,
      build TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )`);
    ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS request_limits (
      key TEXT PRIMARY KEY,
      window INTEGER NOT NULL,
      count INTEGER NOT NULL
    )`);
  }

  consumeRateLimit(key: string, limit: number, windowMs: number): boolean {
    const window = Math.floor(Date.now() / windowMs);
    const row = this.ctx.storage.sql.exec<{ window: number; count: number }>(
      "SELECT window, count FROM request_limits WHERE key = ?", key,
    ).toArray()[0];
    if (row?.window === window && row.count >= limit) return false;
    this.ctx.storage.sql.exec(
      `INSERT INTO request_limits (key, window, count) VALUES (?, ?, 1)
       ON CONFLICT(key) DO UPDATE SET window = excluded.window,
       count = CASE WHEN request_limits.window = excluded.window THEN request_limits.count + 1 ELSE 1 END`,
      key, window,
    );
    if (window % 10 === 0) this.ctx.storage.sql.exec("DELETE FROM request_limits WHERE window < ?", window - 10);
    return true;
  }

  createCode(code: string, weapon: string, build: Record<string, string>): boolean {
    try {
      this.ctx.storage.sql.exec(
        "INSERT INTO loadout_codes (code, weapon, build, created_at) VALUES (?, ?, ?, ?)",
        code, weapon, JSON.stringify(build), Date.now(),
      );
      return true;
    } catch {
      return false;
    }
  }

  readCode(code: string): BuildRecord | null {
    const row = this.ctx.storage.sql.exec<{ weapon: string; build: string }>(
      "SELECT weapon, build FROM loadout_codes WHERE code = ?", code,
    ).toArray()[0];
    if (!row) return null;
    try {
      const build: unknown = JSON.parse(row.build);
      if (!build || typeof build !== "object" || Array.isArray(build)) return null;
      return { weapon: row.weapon, build: build as Record<string, string> };
    } catch {
      return null;
    }
  }
}
