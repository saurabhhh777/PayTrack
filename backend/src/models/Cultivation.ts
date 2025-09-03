import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICultivation extends Document {
  personId: mongoose.Types.ObjectId;
  cropName: string;
  area: number; // in Bigha
  ratePerBigha: number;
  totalCost: number;
  paidTo?: string;
  amountReceived: number;
  amountPending: number;
  paymentMode: 'cash' | 'UPI';
  cultivationDate: Date;
  harvestDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cultivationSchema = new Schema<ICultivation>({
  personId: {
    type: Schema.Types.ObjectId,
    ref: 'Person',
    required: true
  },
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  ratePerBigha: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  paidTo: {
    type: String,
    trim: true
  },
  amountReceived: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  amountPending: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'UPI'],
    required: true
  },
  cultivationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  harvestDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for profit calculation
cultivationSchema.virtual('profit').get(function() {
  return this.amountReceived - this.totalCost;
});

// Index for better query performance
cultivationSchema.index({ personId: 1 });
cultivationSchema.index({ cropName: 1 });
cultivationSchema.index({ cultivationDate: -1 });
cultivationSchema.index({ paymentMode: 1 });

export default mongoose.model<ICultivation>('Cultivation', cultivationSchema); 