import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Payment from '../models/Payment';
import Worker from '../models/Worker';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { workerId, startDate, endDate, paymentMode } = req.query;
    
    let filter: any = {};
    
    if (workerId) filter.workerId = workerId;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    if (paymentMode) filter.paymentMode = paymentMode;
    
    const payments = await Payment.find(filter)
      .populate('workerId', 'name phone')
      .sort({ date: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('workerId', 'name phone');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments
// @desc    Create a new payment
// @access  Private
router.post('/', [
  auth,
  body('workerId').notEmpty().withMessage('Worker ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('date').isISO8601().withMessage('Date must be a valid date'),
  body('paymentMode').isIn(['cash', 'UPI']).withMessage('Payment mode must be cash or UPI')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { workerId, amount, date, paymentMode, description } = req.body;

    // Check if worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const payment = new Payment({
      workerId,
      amount,
      date: date || new Date(),
      paymentMode,
      description
    });

    await payment.save();
    
    // Populate worker details before sending response
    await payment.populate('workerId', 'name phone');
    
    res.status(201).json(payment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/payments/:id
// @desc    Update payment
// @access  Private
router.put('/:id', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('date').isISO8601().withMessage('Date must be a valid date'),
  body('paymentMode').isIn(['cash', 'UPI']).withMessage('Payment mode must be cash or UPI')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, date, paymentMode, description } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        amount,
        date,
        paymentMode,
        description
      },
      { new: true, runValidators: true }
    ).populate('workerId', 'name phone');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/payments/:id
// @desc    Delete payment
// @access  Private
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payments/summary/worker/:workerId
// @desc    Get payment summary for a specific worker
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
    
    const payments = await Payment.find({ workerId, ...dateFilter });
    
    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      cashPayments: payments.filter(p => p.paymentMode === 'cash').length,
      upiPayments: payments.filter(p => p.paymentMode === 'UPI').length,
      cashAmount: payments.filter(p => p.paymentMode === 'cash').reduce((sum, p) => sum + p.amount, 0),
      upiAmount: payments.filter(p => p.paymentMode === 'UPI').reduce((sum, p) => sum + p.amount, 0)
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Get payment summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 