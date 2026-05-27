import mongoose from 'mongoose'

function getMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    process.env.DATABASE_URL ||
    ''
  )
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  const MONGODB_URI = getMongoUri()

  if (!MONGODB_URI) {
    throw new Error('MongoDB connection string is not set (use MONGODB_URI)')
  }

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000
      })
      .then((mongooseInstance) => mongooseInstance)
      .catch((error) => {
        // Reset promise cache on failure so next request can retry.
        cached.promise = null
        throw error
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}

