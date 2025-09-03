import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Person from '../models/Person';
import Cultivation from '../models/Cultivation';
import Payment from '../models/Payment';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/persons
// @desc    Get all persons
// @access  Private
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const persons = await Person.find({ createdBy: (req as any).user.id })
      .sort({ name: 1 });
    res.json(persons);
  } catch (error: any) {
    console.error('Get persons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/persons/:id
// @desc    Get person by ID with all cultivations
// @access  Private
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    // Fetch all cultivations for this person
    const cultivations = await Cultivation.find({ personId: person._id })
      .sort({ cultivationDate: -1 });

    // Calculate totals for each cultivation
    const cultivationsWithPayments = await Promise.all(
      cultivations.map(async (cultivation) => {
        const payments = await Payment.find({ cultivationId: cultivation._id })
          .sort({ date: -1 });

        const totalReceived = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const amountPending = Math.max(0, cultivation.totalCost - totalReceived);
        const profit = totalReceived - cultivation.totalCost;

        return {
          ...cultivation.toObject(),
          payments,
          totalReceived,
          amountPending,
          profit
        };
      })
    );

    // Calculate person totals
    const totalInvestment = cultivations.reduce((sum, c) => sum + c.totalCost, 0);
    const totalRevenue = cultivationsWithPayments.reduce((sum, c) => sum + c.totalReceived, 0);
    const totalPending = cultivationsWithPayments.reduce((sum, c) => sum + c.amountPending, 0);
    const totalProfit = totalRevenue - totalInvestment;

    const personWithCultivations = {
      ...person.toObject(),
      cultivations: cultivationsWithPayments,
      totals: {
        investment: totalInvestment,
        revenue: totalRevenue,
        pending: totalPending,
        profit: totalProfit
      }
    };

    res.json(personWithCultivations);
  } catch (error: any) {
    console.error('Get person error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/persons
// @desc    Create a new person
// @access  Private
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address too long'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes too long')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, address, notes } = req.body;

    const person = new Person({
      name,
      phone,
      address,
      notes,
      createdBy: (req as any).user.id
    });

    await person.save();
    res.status(201).json(person);
  } catch (error: any) {
    console.error('Create person error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/persons/:id
// @desc    Update person
// @access  Private
router.put('/:id', [
  auth,
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address too long'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes too long')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, address, notes } = req.body;

    const person = await Person.findByIdAndUpdate(
      req.params.id,
      { name, phone, address, notes },
      { new: true, runValidators: true }
    );

    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    res.json(person);
  } catch (error: any) {
    console.error('Update person error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/persons/:id
// @desc    Delete person
// @access  Private
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const person = await Person.findByIdAndDelete(req.params.id);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    // Delete all cultivations and payments for this person
    const cultivations = await Cultivation.find({ personId: person._id });
    const cultivationIds = cultivations.map(c => c._id);
    
    await Payment.deleteMany({ cultivationId: { $in: cultivationIds } });
    await Cultivation.deleteMany({ personId: person._id });

    res.json({ message: 'Person and all related data deleted successfully' });
  } catch (error: any) {
    console.error('Delete person error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 