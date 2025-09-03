import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  propertyType: 'buy' | 'sell';
  area: number; // in Bigha/Gaj
  areaUnit: 'Bigha' | 'Gaj';
  partnerName: string;
  sellerName?: string;
  buyerName?: string;
  ratePerUnit: number;
  totalCost: number;
  amountPaid: number;
  amountPending: number;
  transactionDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>({
  propertyType: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  areaUnit: {
    type: String,
    enum: ['Bigha', 'Gaj'],
    required: true
  },
  partnerName: {
    type: String,
    required: true,
    trim: true
  },
  sellerName: {
    type: String,
    trim: true
  },
  buyerName: {
    type: String,
    trim: true
  },
  ratePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
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
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for profit calculation
propertySchema.virtual('profit').get(function() {
  if (this.propertyType === 'sell') {
    return this.amountPaid - this.totalCost;
  }
  return 0; // For buy transactions, profit is 0
});

// Index for better query performance
propertySchema.index({ propertyType: 1 });
propertySchema.index({ transactionDate: -1 });
propertySchema.index({ partnerName: 1 });

export default mongoose.model<IProperty>('Property', propertySchema); 