import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  workerId: mongoose.Types.ObjectId;
  date: Date;
  status: 'Present' | 'Absent' | 'HalfDay';
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
    enum: ['Present', 'Absent', 'HalfDay'],
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per worker per date
attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

// Index for better query performance
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ workerId: 1, date: -1 });

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-IN');
});

// Virtual for status emoji
attendanceSchema.virtual('statusEmoji').get(function() {
  switch (this.status) {
    case 'Present': return '✅';
    case 'Absent': return '❌';
    case 'HalfDay': return '⏰';
    default: return '❓';
  }
});

export default mongoose.model<IAttendance>('Attendance', attendanceSchema); 