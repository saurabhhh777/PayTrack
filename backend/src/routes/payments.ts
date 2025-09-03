import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Payment from '../models/Payment';
import Cultivation from '../models/Cultivation';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/payments
// @desc    Create a new payment for a cultivation
// @access  Private
router.post('/', [
  auth,
  body('cultivationId').notEmpty().withMessage('Cultivation ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('paidTo').notEmpty().withMessage('Paid To is required'),
  body('paymentMode').isIn(['cash', 'UPI', 'bank']).withMessage('Payment mode must be cash, UPI, or bank'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      cultivationId,
      amount,
      paidTo,
      paymentMode,
      date
    } = req.body;

    // Verify cultivation exists
    const cultivation = await Cultivation.findById(cultivationId);
    if (!cultivation) {
      return res.status(404).json({ message: 'Cultivation not found' });
    }

    const payment = new Payment({
      cultivationId,
      amount,
      paidTo,
      paymentMode,
      date: date || new Date()
    });

    await payment.save();

    // Update cultivation's amountReceived and amountPending
    const totalReceived = await Payment.aggregate([
      { $match: { cultivationId: cultivationId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const newAmountReceived = totalReceived.length > 0 ? totalReceived[0].total : 0;
    const newAmountPending = Math.max(0, cultivation.totalCost - newAmountReceived);

    await Cultivation.findByIdAndUpdate(cultivationId, {
      amountReceived: newAmountReceived,
      amountPending: newAmountPending
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payments/cultivation/:cultivationId
// @desc    Get all payments for a specific cultivation
// @access  Private
router.get('/cultivation/:cultivationId', auth, async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({ cultivationId: req.params.cultivationId })
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
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/payments/:id
// @desc    Update payment
// @access  Private
router.put('/:id', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('paidTo').notEmpty().withMessage('Paid To is required'),
  body('paymentMode').isIn(['cash', 'UPI', 'bank']).withMessage('Payment mode must be cash, UPI, or bank'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      amount,
      paidTo,
      paymentMode,
      date
    } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        amount,
        paidTo,
        paymentMode,
        date: date || new Date()
      },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update cultivation's amounts
    const cultivation = await Cultivation.findById(payment.cultivationId);
    if (cultivation) {
      const totalReceived = await Payment.aggregate([
        { $match: { cultivationId: payment.cultivationId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const newAmountReceived = totalReceived.length > 0 ? totalReceived[0].total : 0;
      const newAmountPending = Math.max(0, cultivation.totalCost - newAmountReceived);

      await Cultivation.findByIdAndUpdate(payment.cultivationId, {
        amountReceived: newAmountReceived,
        amountPending: newAmountPending
      });
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

    // Update cultivation's amounts
    const cultivation = await Cultivation.findById(payment.cultivationId);
    if (cultivation) {
      const totalReceived = await Payment.aggregate([
        { $match: { cultivationId: payment.cultivationId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const newAmountReceived = totalReceived.length > 0 ? totalReceived[0].total : 0;
      const newAmountPending = Math.max(0, cultivation.totalCost - newAmountReceived);

      await Cultivation.findByIdAndUpdate(payment.cultivationId, {
        amountReceived: newAmountReceived,
        amountPending: newAmountPending
      });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 