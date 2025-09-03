import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Cultivation from '../models/Cultivation';
import Payment from '../models/Payment';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/cultivations
// @desc    Get all cultivations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { cropName, startDate, endDate, paymentMode } = req.query;
    
    let filter: any = {};
    
    if (cropName) filter.cropName = { $regex: cropName, $options: 'i' };
    if (startDate && endDate) {
      filter.cultivationDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    if (paymentMode) filter.paymentMode = paymentMode;
    
    const cultivations = await Cultivation.find(filter)
      .populate('personId', 'name')
      .sort({ cultivationDate: -1 });
    res.json(cultivations);
  } catch (error) {
    console.error('Get cultivations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/cultivations/:id
// @desc    Get cultivation by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const cultivation = await Cultivation.findById(req.params.id);
    if (!cultivation) {
      return res.status(404).json({ message: 'Cultivation not found' });
    }

    // Fetch payments for this cultivation
    const payments = await Payment.find({ cultivationId: cultivation._id })
      .sort({ date: -1 });

    // Add payments to cultivation object
    const cultivationWithPayments = {
      ...cultivation.toObject(),
      payments
    };

    res.json(cultivationWithPayments);
  } catch (error: any) {
    console.error('Get cultivation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/cultivations
// @desc    Create a new cultivation
// @access  Private
router.post('/', [
  auth,
  body('personId').notEmpty().withMessage('Person ID is required'),
  body('cropName').notEmpty().withMessage('Crop name is required'),
  body('area').isNumeric().withMessage('Area must be a number'),
  body('ratePerBigha').isNumeric().withMessage('Rate per Bigha must be a number'),
  body('totalCost').isNumeric().withMessage('Total cost must be a number'),
  body('paymentMode').isIn(['cash', 'UPI']).withMessage('Payment mode must be cash or UPI')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      personId,
      cropName,
      area,
      ratePerBigha,
      totalCost,
      paidTo,
      amountReceived,
      amountPending,
      paymentMode,
      cultivationDate,
      harvestDate,
      notes
    } = req.body;

    const cultivation = new Cultivation({
      personId,
      cropName,
      area,
      ratePerBigha,
      totalCost,
      paidTo,
      amountReceived: amountReceived || 0,
      amountPending: amountPending || totalCost,
      paymentMode,
      cultivationDate: cultivationDate || new Date(),
      harvestDate,
      notes
    });

    await cultivation.save();
    res.status(201).json(cultivation);
  } catch (error) {
    console.error('Create cultivation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cultivations/:id
// @desc    Update cultivation
// @access  Private
router.put('/:id', [
  auth,
  body('personId').notEmpty().withMessage('Person ID is required'),
  body('cropName').notEmpty().withMessage('Crop name is required'),
  body('area').isNumeric().withMessage('Area must be a number'),
  body('ratePerBigha').isNumeric().withMessage('Rate per Bigha must be a number'),
  body('totalCost').isNumeric().withMessage('Total cost must be a number'),
  body('paymentMode').isIn(['cash', 'UPI']).withMessage('Payment mode must be cash or UPI')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      personId,
      cropName,
      area,
      ratePerBigha,
      totalCost,
      paidTo,
      amountReceived,
      amountPending,
      paymentMode,
      cultivationDate,
      harvestDate,
      notes
    } = req.body;

    const cultivation = await Cultivation.findByIdAndUpdate(
      req.params.id,
      {
        personId,
        cropName,
        area,
        ratePerBigha,
        totalCost,
        paidTo,
        amountReceived,
        amountPending,
        paymentMode,
        cultivationDate,
        harvestDate,
        notes
      },
      { new: true, runValidators: true }
    );

    if (!cultivation) {
      return res.status(404).json({ message: 'Cultivation not found' });
    }

    res.json(cultivation);
  } catch (error) {
    console.error('Update cultivation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cultivations/:id
// @desc    Delete cultivation
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const cultivation = await Cultivation.findByIdAndDelete(req.params.id);
    if (!cultivation) {
      return res.status(404).json({ message: 'Cultivation not found' });
    }
    res.json({ message: 'Cultivation deleted successfully' });
  } catch (error) {
    console.error('Delete cultivation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/cultivations/summary/crops
// @desc    Get cultivation summary by crops
// @access  Private
router.get('/summary/crops', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.cultivationDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const cultivations = await Cultivation.find(dateFilter);
    
    const cropSummary = cultivations.reduce((acc: any, cultivation) => {
      const cropName = cultivation.cropName;
      
      if (!acc[cropName]) {
        acc[cropName] = {
          totalArea: 0,
          totalCost: 0,
          totalReceived: 0,
          totalPending: 0,
          count: 0
        };
      }
      
      acc[cropName].totalArea += cultivation.area;
      acc[cropName].totalCost += cultivation.totalCost;
      acc[cropName].totalReceived += cultivation.amountReceived;
      acc[cropName].totalPending += cultivation.amountPending;
      acc[cropName].count += 1;
      
      return acc;
    }, {});
    
    // Calculate profit for each crop
    Object.keys(cropSummary).forEach(cropName => {
      const crop = cropSummary[cropName];
      crop.profit = crop.totalReceived - crop.totalCost;
    });
    
    res.json(cropSummary);
  } catch (error) {
    console.error('Get cultivation summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 