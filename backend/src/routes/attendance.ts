import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Attendance from '../models/Attendance';
import Worker from '../models/Worker';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get all attendance records
// @access  Private
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const { workerId, startDate, endDate, status } = req.query;
    
    let filter: any = {};
    
    if (workerId) filter.workerId = workerId;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    if (status) filter.status = status;
    
    const attendance = await Attendance.find(filter)
      .populate('workerId', 'name phone')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/:id
// @desc    Get attendance by ID
// @access  Private
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate('workerId', 'name phone');
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance
// @desc    Create a new attendance record
// @access  Private
router.post('/', [
  auth,
  body('workerId').notEmpty().withMessage('Worker ID is required'),
  body('date').isISO8601().withMessage('Date must be a valid date'),
  body('status').isIn(['present', 'absent', 'half-day', 'leave']).withMessage('Invalid status')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { workerId, date, status, checkInTime, checkOutTime, workingHours, notes } = req.body;

    // Check if worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Check if attendance already exists for this worker on this date
    const existingAttendance = await Attendance.findOne({ workerId, date: new Date(date) });
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance record already exists for this date' });
    }

    const attendance = new Attendance({
      workerId,
      date: new Date(date),
      status,
      checkInTime: checkInTime ? new Date(checkInTime) : undefined,
      checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
      workingHours,
      notes
    });

    await attendance.save();
    
    // Update worker's total working days if present
    if (status === 'present') {
      await Worker.findByIdAndUpdate(workerId, { $inc: { totalWorkingDays: 1 } });
    }
    
    // Populate worker details before sending response
    await attendance.populate('workerId', 'name phone');
    
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance
// @access  Private
router.put('/:id', [
  auth,
  body('status').isIn(['present', 'absent', 'half-day', 'leave']).withMessage('Invalid status')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, checkInTime, checkOutTime, workingHours, notes } = req.body;

    // Get the old attendance record to check status change
    const oldAttendance = await Attendance.findById(req.params.id);
    if (!oldAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        status,
        checkInTime: checkInTime ? new Date(checkInTime) : undefined,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
        workingHours,
        notes
      },
      { new: true, runValidators: true }
    ).populate('workerId', 'name phone');

    // Update worker's total working days based on status change
    if (oldAttendance.status !== status) {
      if (oldAttendance.status === 'present' && status !== 'present') {
        // Decrease working days
        await Worker.findByIdAndUpdate(oldAttendance.workerId, { $inc: { totalWorkingDays: -1 } });
      } else if (oldAttendance.status !== 'present' && status === 'present') {
        // Increase working days
        await Worker.findByIdAndUpdate(oldAttendance.workerId, { $inc: { totalWorkingDays: 1 } });
      }
    }

    res.json(attendance);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance
// @access  Private
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Update worker's total working days if deleting a present record
    if (attendance.status === 'present') {
      await Worker.findByIdAndUpdate(attendance.workerId, { $inc: { totalWorkingDays: -1 } });
    }

    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/summary/worker/:workerId
// @desc    Get attendance summary for a specific worker
// @access  Private
router.get('/summary/worker/:workerId', auth, async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;
    const { startDate, endDate } = req.query;
    
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const attendance = await Attendance.find({ workerId, ...dateFilter });
    
    const summary = {
      totalDays: attendance.length,
      presentDays: attendance.filter(a => a.status === 'present').length,
      absentDays: attendance.filter(a => a.status === 'absent').length,
      halfDays: attendance.filter(a => a.status === 'half-day').length,
      leaveDays: attendance.filter(a => a.status === 'leave').length,
      totalWorkingHours: attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0)
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/bulk
// @desc    Create multiple attendance records for multiple workers
// @access  Private
router.post('/bulk', [
  auth,
  body('date').isISO8601().withMessage('Date must be a valid date'),
  body('attendanceData').isArray().withMessage('Attendance data must be an array')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, attendanceData } = req.body;
    const attendanceDate = new Date(date);
    const results = [];

    for (const record of attendanceData) {
      try {
        const { workerId, status, checkInTime, checkOutTime, workingHours, notes } = record;

        // Check if worker exists
        const worker = await Worker.findById(workerId);
        if (!worker) {
          results.push({ workerId, success: false, message: 'Worker not found' });
          continue;
        }

        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({ workerId, date: attendanceDate });
        if (existingAttendance) {
          results.push({ workerId, success: false, message: 'Attendance already exists for this date' });
          continue;
        }

        const attendance = new Attendance({
          workerId,
          date: attendanceDate,
          status,
          checkInTime: checkInTime ? new Date(checkInTime) : undefined,
          checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
          workingHours,
          notes
        });

        await attendance.save();
        
        // Update worker's total working days if present
        if (status === 'present') {
          await Worker.findByIdAndUpdate(workerId, { $inc: { totalWorkingDays: 1 } });
        }
        
        results.push({ workerId, success: true, attendanceId: attendance._id });
      } catch (error) {
        results.push({ workerId: record.workerId, success: false, message: 'Error creating record' });
      }
    }

    res.status(201).json({ results });
  } catch (error) {
    console.error('Bulk attendance creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 