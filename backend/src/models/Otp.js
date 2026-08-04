import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // one active OTP per email; upsert relies on this
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // MongoDB auto-deletes this document 600s (10 min) after createdAt
  },
});

export default mongoose.model('Otp', OtpSchema);