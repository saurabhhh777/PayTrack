import mongoose, { Document, Schema } from 'mongoose';

export interface IPartner {
  name: string;
  mobile: string;
  contribution: number;
}

export interface IMeel extends Document {
  cropName: string;
  transactionType: 'Buy' | 'Sell';
  transactionMode: 'Individual' | 'With Partner';
  partners?: IPartner[];
  totalCost: number;
  tag: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const partnerSchema = new Schema<IPartner>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    maxlength: 15
  },
  contribution: {
    type: Number,
    required: true,
    min: 0
  }
});

const meelSchema = new Schema<IMeel>({
  cropName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  transactionType: {
    type: String,
    enum: ['Buy', 'Sell'],
    required: true
  },
  transactionMode: {
    type: String,
    enum: ['Individual', 'With Partner'],
    required: true
  },
  partners: {
    type: [partnerSchema],
    validate: {
      validator: function(partners: IPartner[]) {
        // Partners are required if mode is With Partner
        if (this.transactionMode === 'With Partner') {
          return partners && partners.length > 0;
        }
        return true;
      },
      message: 'Partners are required when transaction mode is With Partner'
    }
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  tag: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
meelSchema.index({ cropName: 1 });
meelSchema.index({ transactionType: 1 });
meelSchema.index({ transactionMode: 1 });
meelSchema.index({ tag: 1 });
meelSchema.index({ createdBy: 1 });
meelSchema.index({ createdAt: -1 });

// Virtual for formatted date
meelSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-IN');
});

// Virtual for transaction type emoji
meelSchema.virtual('typeEmoji').get(function() {
  return this.transactionType === 'Buy' ? '🛒' : '💰';
});

// Virtual for transaction mode emoji
meelSchema.virtual('modeEmoji').get(function() {
  return this.transactionMode === 'Individual' ? '👤' : '👥';
});

// Virtual for total partners
meelSchema.virtual('totalPartners').get(function() {
  return this.partners ? this.partners.length : 0;
});

// Virtual for total contribution by partners
meelSchema.virtual('totalContribution').get(function() {
  if (!this.partners) return 0;
  return this.partners.reduce((sum, partner) => sum + partner.contribution, 0);
});

  // Virtual for pending amount (for Buy transactions)
  meelSchema.virtual('pendingAmount').get(function() {
    if (this.transactionType === 'Buy') {
      const totalContribution = this.partners ? this.partners.reduce((sum: number, partner: IPartner) => sum + partner.contribution, 0) : 0;
      return this.totalCost - totalContribution;
    }
    return 0;
  });

export default mongoose.model<IMeel>('Meel', meelSchema); 