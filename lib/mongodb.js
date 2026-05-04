import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let isConnected = false

export async function connectDB() {
  if (isConnected) {
    return
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
      minPoolSize: 1,
    })
    
    isConnected = db.connections[0].readyState === 1
    console.log('MongoDB connected:', isConnected)
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    throw error
  }
}