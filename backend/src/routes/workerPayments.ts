import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import WorkerPayment from '../models/WorkerPayment';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/worker-payments
// @desc    Create a new worker payment
// @access  Private
router.post('/', [
  auth,
  body('workerId').notEmpty().withMessage('Worker ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('date').notEmpty().withMessage('Date is required'),
  body('paymentMode').isIn(['cash', 'UPI']).withMessage('Payment mode must be cash or UPI')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { workerId, amount, date, paymentMode, description } = req.body;

    const payment = new WorkerPayment({
      workerId,
      amount: parseFloat(amount),
      date,
      paymentMode,
      description
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    console.error('Create worker payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/worker-payments/worker/:workerId
// @desc    Get all payments for a specific worker
// @access  Private
router.get('/worker/:workerId', auth, async (req: Request, res: Response) => {
  try {
    const payments = await WorkerPayment.find({ workerId: req.params.workerId })
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Get worker payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/worker-payments/:id
// @desc    Update a worker payment
// @access  Private
router.put('/:id', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('date').notEmpty().withMessage('Date is required'),
  body('paymentMode').isIn(['cash', 'UPI']).withMessage('Payment mode must be cash or UPI')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, date, paymentMode, description } = req.body;

    const payment = await WorkerPayment.findByIdAndUpdate(
      req.params.id,
      {
        amount: parseFloat(amount),
        date,
        paymentMode,
        description
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Update worker payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/worker-payments/:id
// @desc    Delete a worker payment
// @access  Private
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const payment = await WorkerPayment.findByIdAndDelete(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete worker payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 