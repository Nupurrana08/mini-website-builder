import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local')
}

console.log('🔌 MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//****@'))

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection')
    return cached.conn
  }

  if (!cached.promise) {
    console.log('⏳ Creating new MongoDB connection...')
    
    const options = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((m) => {
        console.log('✅ MongoDB connected successfully')
        return m
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message)
        throw err
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}