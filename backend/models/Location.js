import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  source: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  destination: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  distanceInKMs: { type: String, required: true },
  userMeta: {
    ip: { type: String },
    userAgent: { type: String },
    location: {
      city: { type: String },
      region: { type: String },
      country: { type: String },
    },
  },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Location', locationSchema)
