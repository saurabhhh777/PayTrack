import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  mobileNumber: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>({
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster lookups
otpSchema.index({ mobileNumber: 1, createdAt: -1 });

export default mongoose.model<IOTP>('OTP', otpSchema); 