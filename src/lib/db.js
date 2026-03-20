import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/arcitucture-visual";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => mongooseInstance);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
