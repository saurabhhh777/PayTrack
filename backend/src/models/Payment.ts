import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  cultivationId: mongoose.Types.ObjectId;
  amount: number;
  paidTo: string;
  paymentMode: 'cash' | 'UPI' | 'bank';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  cultivationId: {
    type: Schema.Types.ObjectId,
    ref: 'Cultivation',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paidTo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'UPI', 'bank'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ cultivationId: 1, date: -1 });
paymentSchema.index({ paymentMode: 1 });

export default mongoose.model<IPayment>('Payment', paymentSchema); 