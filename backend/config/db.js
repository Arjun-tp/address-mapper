import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...')
    const mongoURI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/address_mapper`
    await mongoose.connect(mongoURI)
    console.log('*** MongoDB Connected ***')
  } catch (error) {
    console.log('MongoDB Connection Error:', error)
    process.exit(1)
  }
}

export default connectDB