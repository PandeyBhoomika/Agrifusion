import mongoose from 'mongoose';

// Notice the capital 'O' in OtpSchema here:
const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Notice the capital 'O' matches exactly here:
export default mongoose.model('Otp', OtpSchema);