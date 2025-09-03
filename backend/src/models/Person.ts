import mongoose, { Document, Schema } from 'mongoose';

export interface IPerson extends Document {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const personSchema = new Schema<IPerson>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 15
  },
  address: {
    type: String,
    trim: true,
    maxlength: 500
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
personSchema.index({ name: 1 });
personSchema.index({ createdBy: 1 });

export default mongoose.model<IPerson>('Person', personSchema); 