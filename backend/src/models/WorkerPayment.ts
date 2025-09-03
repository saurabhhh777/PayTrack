import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkerPayment extends Document {
  workerId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  paymentMode: 'cash' | 'UPI';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workerPaymentSchema = new Schema<IWorkerPayment>({
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
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for better query performance
workerPaymentSchema.index({ workerId: 1, date: -1 });
workerPaymentSchema.index({ paymentMode: 1 });
workerPaymentSchema.index({ date: -1 });

export default mongoose.model<IWorkerPayment>('WorkerPayment', workerPaymentSchema); 