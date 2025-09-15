import express, { Request, Response } from 'express';
import { body, validationResult, param } from 'express-validator';
import Attendance from '../models/Attendance';
import Worker from '../models/Worker';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Add/Update attendance
router.post('/', 
  auth,
  [
    body('workerId')
      .isMongoId()
      .withMessage('Valid worker ID is required'),
    body('date')
      .isISO8601()
      .withMessage('Valid date is required'),
    body('status')
      .isIn(['Present', 'Absent', 'HalfDay'])
      .withMessage('Status must be Present, Absent, or HalfDay'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { workerId, date, status, notes } = req.body;

      // Check if worker exists
      const worker = await Worker.findById(workerId);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      // Check for existing attendance on the same date
      const existingAttendance = await Attendance.findOne({ workerId, date });
      
      if (existingAttendance) {
        // Update existing attendance
        existingAttendance.status = status;
        existingAttendance.notes = notes;
        await existingAttendance.save();

        res.json({
          message: 'Attendance updated successfully',
          attendance: existingAttendance,
          isUpdate: true
        });
      } else {
        // Create new attendance
        const newAttendance = new Attendance({
          workerId,
          date,
          status,
          notes
        });

        await newAttendance.save();

        res.json({
          message: 'Attendance added successfully',
          attendance: newAttendance,
          isUpdate: false
        });
      }
    } catch (error) {
      console.error('Error managing attendance:', error);
      res.status(500).json({ message: 'Failed to manage attendance' });
    }
  }
);

// ADD: Bulk attendance create/update
router.post('/bulk',
  auth,
  [
    body('date')
      .isISO8601()
      .withMessage('Valid date is required'),
    body('attendanceData')
      .isArray({ min: 1 })
      .withMessage('attendanceData must be a non-empty array'),
    body('attendanceData.*.workerId')
      .isMongoId()
      .withMessage('Valid worker ID is required for each record'),
    body('attendanceData.*.status')
      .isIn(['Present', 'Absent', 'HalfDay'])
      .withMessage('Status must be Present, Absent, or HalfDay')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { date, attendanceData } = req.body as { date: string; attendanceData: Array<{ workerId: string; status: 'Present' | 'Absent' | 'HalfDay'; notes?: string }>; };

      const results: Array<{ workerId: string; isUpdate: boolean }> = [];

      for (const item of attendanceData) {
        // Ensure worker exists
        const worker = await Worker.findById(item.workerId);
        if (!worker) {
          results.push({ workerId: item.workerId, isUpdate: false });
          continue;
        }

        const existing = await Attendance.findOne({ workerId: item.workerId, date });
        if (existing) {
          existing.status = item.status;
          existing.notes = item.notes;
          await existing.save();
          results.push({ workerId: item.workerId, isUpdate: true });
        } else {
          const created = new Attendance({
            workerId: item.workerId,
            date,
            status: item.status,
            notes: item.notes
          });
          await created.save();
          results.push({ workerId: item.workerId, isUpdate: false });
        }
      }

      res.json({
        message: 'Bulk attendance processed successfully',
        counts: {
          total: results.length,
          updated: results.filter(r => r.isUpdate).length,
          created: results.filter(r => !r.isUpdate).length
        }
      });
    } catch (error) {
      console.error('Error saving bulk attendance:', error);
      res.status(500).json({ message: 'Failed to save bulk attendance' });
    }
  }
);

// Get attendance history for a specific worker
router.get('/:workerId',
  auth,
  [
    param('workerId')
      .isMongoId()
      .withMessage('Valid worker ID is required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { workerId } = req.params;
      const { limit = 30, startDate, endDate } = req.query;

      // Check if worker exists
      const worker = await Worker.findById(workerId);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      // Build query
      const query: any = { workerId };
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      const attendance = await Attendance.find(query)
        .sort({ date: -1 })
        .limit(Number(limit))
        .populate('workerId', 'name phone');

      res.json({
        worker: {
          id: worker._id,
          name: worker.name,
          phone: worker.phone
        },
        attendance,
        total: attendance.length
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ message: 'Failed to fetch attendance' });
    }
  }
);

// Get attendance summary for all workers
router.get('/summary/overview',
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter.date = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      // Get all workers
      const workers = await Worker.find({ isActive: true });
      
      const summary = await Promise.all(
        workers.map(async (worker) => {
          const attendance = await Attendance.find({
            workerId: worker._id,
            ...dateFilter
          });

          const present = attendance.filter(a => a.status === 'Present').length;
          const absent = attendance.filter(a => a.status === 'Absent').length;
          const halfDay = attendance.filter(a => a.status === 'HalfDay').length;
          const total = attendance.length;

          return {
            workerId: worker._id,
            workerName: worker.name,
            present,
            absent,
            halfDay,
            total,
            attendanceRate: total > 0 ? ((present + halfDay * 0.5) / total * 100).toFixed(1) : '0'
          };
        })
      );

      // Calculate overall statistics
      const overallStats = summary.reduce((acc, worker) => {
        acc.totalPresent += worker.present;
        acc.totalAbsent += worker.absent;
        acc.totalHalfDay += worker.halfDay;
        acc.totalDays += worker.total;
        return acc;
      }, { totalPresent: 0, totalAbsent: 0, totalHalfDay: 0, totalDays: 0 });

      res.json({
        summary,
        overallStats,
        totalWorkers: workers.length
      });
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      res.status(500).json({ message: 'Failed to fetch attendance summary' });
    }
  }
);

// Get attendance summary for a specific worker
router.get('/summary/:workerId',
  auth,
  [
    param('workerId')
      .isMongoId()
      .withMessage('Valid worker ID is required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { workerId } = req.params;
      const { startDate, endDate } = req.query;

      // Check if worker exists
      const worker = await Worker.findById(workerId);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      // Build date filter
      const dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter.date = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      const attendance = await Attendance.find({
        workerId,
        ...dateFilter
      });

      const present = attendance.filter(a => a.status === 'Present').length;
      const absent = attendance.filter(a => a.status === 'Absent').length;
      const halfDay = attendance.filter(a => a.status === 'HalfDay').length;
      const total = attendance.length;

      // Monthly breakdown
      const monthlyBreakdown = await Attendance.aggregate([
        { $match: { workerId: worker._id, ...dateFilter } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
            },
            halfDay: {
              $sum: { $cond: [{ $eq: ['$status', 'HalfDay'] }, 1, 0] }
            }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
      ]);

      res.json({
        worker: {
          id: worker._id,
          name: worker.name,
          phone: worker.phone
        },
        summary: {
          present,
          absent,
          halfDay,
          total,
          attendanceRate: total > 0 ? ((present + halfDay * 0.5) / total * 100).toFixed(1) : '0'
        },
        monthlyBreakdown
      });
    } catch (error) {
      console.error('Error fetching worker attendance summary:', error);
      res.status(500).json({ message: 'Failed to fetch worker attendance summary' });
    }
  }
);

export default router; 