import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
  workerId: Types.ObjectId;
  amount: number;
  date: Date;
  paymentMode: 'cash' | 'UPI';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  workerId: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'UPI'],
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ workerId: 1, date: -1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ paymentMode: 1 });

export default mongoose.model<IPayment>('Payment', paymentSchema); 