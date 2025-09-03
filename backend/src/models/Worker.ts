import mongoose, { Document, Schema } from 'mongoose';

export interface IWorker extends Document {
  name: string;
  phone: string;
  address: string;
  joiningDate: Date;
  salary: number;
  isActive: boolean;
  notes?: string;
  totalWorkingDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const workerSchema = new Schema<IWorker>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  },
  totalWorkingDays: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
workerSchema.index({ name: 1 });
workerSchema.index({ isActive: 1 });

export default mongoose.model<IWorker>('Worker', workerSchema); 