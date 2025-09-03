import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Worker from '../models/Worker';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/workers
// @desc    Get all workers
// @access  Private
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json(workers);
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/workers/:id
// @desc    Get worker by ID with attendance and payment summaries
// @access  Private
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Import models for attendance and payments
    const Attendance = require('../models/Attendance');
    const WorkerPayment = require('../models/WorkerPayment');

    // Fetch attendance records for this worker
    const attendance = await Attendance.find({ workerId: worker._id })
      .sort({ date: -1 });

    // Fetch payment records for this worker
    const payments = await WorkerPayment.find({ workerId: worker._id })
      .sort({ date: -1 });

    // Calculate attendance summary
    const attendanceSummary = {
      totalDays: attendance.length,
      present: attendance.filter((a: any) => a.status === 'Present').length,
      absent: attendance.filter((a: any) => a.status === 'Absent').length,
      halfDay: attendance.filter((a: any) => a.status === 'HalfDay').length
    };

    // Calculate payment summary
    const totalPaid = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    const paymentSummary = {
      totalSalary: worker.salary * 12, // Annual salary
      paid: totalPaid,
      pending: Math.max(0, (worker.salary * 12) - totalPaid)
    };

    // Combine worker data with summaries
    const workerWithDetails = {
      ...worker.toObject(),
      attendance,
      payments,
      attendanceSummary,
      paymentSummary
    };

    res.json(workerWithDetails);
  } catch (error) {
    console.error('Get worker error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/workers
// @desc    Create a new worker
// @access  Private
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('salary').isNumeric().withMessage('Salary must be a number')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, address, joiningDate, salary, notes } = req.body;

    const worker = new Worker({
      name,
      phone,
      address,
      joiningDate: joiningDate || new Date(),
      salary,
      notes
    });

    await worker.save();
    res.status(201).json(worker);
  } catch (error) {
    console.error('Create worker error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/workers/:id
// @desc    Update worker
// @access  Private
router.put('/:id', [
  auth,
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('salary').isNumeric().withMessage('Salary must be a number')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, address, joiningDate, salary, isActive, notes } = req.body;

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      {
        name,
        phone,
        address,
        joiningDate,
        salary,
        isActive,
        notes
      },
      { new: true, runValidators: true }
    );

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    console.error('Update worker error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/workers/:id
// @desc    Delete worker
// @access  Private
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Delete worker error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 