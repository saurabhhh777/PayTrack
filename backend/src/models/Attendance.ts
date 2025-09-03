import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAttendance extends Document {
  workerId: Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'half-day' | 'leave';
  checkInTime?: Date;
  checkOutTime?: Date;
  workingHours?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>({
  workerId: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'leave'],
    required: true,
    default: 'present'
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  workingHours: {
    type: Number,
    min: 0,
    max: 24
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per worker per day
attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

// Index for better query performance
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });

export default mongoose.model<IAttendance>('Attendance', attendanceSchema); 