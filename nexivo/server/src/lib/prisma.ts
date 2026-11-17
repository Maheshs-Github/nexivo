import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";
import { env, isProd } from "../config/env.js";

/** Turns a mysql:// URL into a mariadb pool config (TiDB needs TLS, MySQL 8 needs public-key retrieval). */
function poolConfig(url: string) {
  const u = new URL(url);
  const sslParam = u.searchParams.get("sslaccept") ?? u.searchParams.get("ssl") ?? u.searchParams.get("sslmode");
  const ssl = sslParam && sslParam !== "false" && sslParam !== "disable" ? { rejectUnauthorized: sslParam !== "accept_invalid_certs" } : undefined;
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    connectionLimit: Number(u.searchParams.get("connection_limit") ?? 10),
    allowPublicKeyRetrieval: !ssl,
    connectTimeout: 5_000,
    acquireTimeout: 8_000,
    ssl,
  };
}

const adapter = new PrismaMariaDb(poolConfig(env.DATABASE_URL));

/** Single shared client. Secrets and large blobs are omitted from every query unless explicitly re-selected. */
export const prisma = new PrismaClient({
  adapter,
  omit: {
    user: { passwordHash: true },
    media: { data: true },
    application: { resumeData: true },
  },
  log: isProd ? ["error"] : ["warn", "error"],
});
