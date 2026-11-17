// Production entry: forces NODE_ENV before any module reads it (static imports are hoisted, so use a dynamic import).
process.env.NODE_ENV = "production";
await import("./server.js");
export {};
