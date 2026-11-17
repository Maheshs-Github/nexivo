import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`[nexivo] API ready on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

prisma.$queryRaw`SELECT 1`
  .then(() => console.log("[nexivo] Database connected"))
  .catch((err: Error) => console.error(`[nexivo] Database not reachable yet: ${err.message}`));

async function shutdown(signal: string) {
  console.log(`[nexivo] ${signal} received, shutting down`);
  server.close();
  await prisma.$disconnect().catch(() => undefined);
  process.exit(0);
}
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
