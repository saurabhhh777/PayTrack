import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Property from '../models/Property';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/properties
// @desc    Get all properties
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { propertyType, partnerName, startDate, endDate } = req.query;
    
    let filter: any = {};
    
    if (propertyType) filter.propertyType = propertyType;
    if (partnerName) filter.partnerName = { $regex: partnerName, $options: 'i' };
    if (startDate && endDate) {
      filter.transactionDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const properties = await Property.find(filter).sort({ transactionDate: -1 });
    res.json(properties);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/properties
// @desc    Create a new property
// @access  Private
router.post('/', [
  auth,
  body('propertyType').isIn(['buy', 'sell']).withMessage('Property type must be buy or sell'),
  body('area').isNumeric().withMessage('Area must be a number'),
  body('areaUnit').isIn(['Bigha', 'Gaj']).withMessage('Area unit must be Bigha or Gaj'),
  body('partnerName').notEmpty().withMessage('Partner name is required'),
  body('ratePerUnit').isNumeric().withMessage('Rate per unit must be a number'),
  body('totalCost').isNumeric().withMessage('Total cost must be a number')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      propertyType,
      area,
      areaUnit,
      partnerName,
      sellerName,
      buyerName,
      ratePerUnit,
      totalCost,
      amountPaid,
      amountPending,
      transactionDate,
      notes
    } = req.body;

    const property = new Property({
      propertyType,
      area,
      areaUnit,
      partnerName,
      sellerName,
      buyerName,
      ratePerUnit,
      totalCost,
      amountPaid: amountPaid || 0,
      amountPending: amountPending || totalCost,
      transactionDate: transactionDate || new Date(),
      notes
    });

    await property.save();
    res.status(201).json(property);
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private
router.put('/:id', [
  auth,
  body('propertyType').isIn(['buy', 'sell']).withMessage('Property type must be buy or sell'),
  body('area').isNumeric().withMessage('Area must be a number'),
  body('areaUnit').isIn(['Bigha', 'Gaj']).withMessage('Area unit must be Bigha or Gaj'),
  body('partnerName').notEmpty().withMessage('Partner name is required'),
  body('ratePerUnit').isNumeric().withMessage('Rate per unit must be a number'),
  body('totalCost').isNumeric().withMessage('Total cost must be a number')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      propertyType,
      area,
      areaUnit,
      partnerName,
      sellerName,
      buyerName,
      ratePerUnit,
      totalCost,
      amountPaid,
      amountPending,
      transactionDate,
      notes
    } = req.body;

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        propertyType,
        area,
        areaUnit,
        partnerName,
        sellerName,
        buyerName,
        ratePerUnit,
        totalCost,
        amountPaid,
        amountPending,
        transactionDate,
        notes
      },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/properties/summary/overview
// @desc    Get property summary overview
// @access  Private
router.get('/summary/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.transactionDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const properties = await Property.find(dateFilter);
    
    const summary = {
      totalProperties: properties.length,
      buyProperties: properties.filter(p => p.propertyType === 'buy').length,
      sellProperties: properties.filter(p => p.propertyType === 'sell').length,
      totalInvestment: properties.filter(p => p.propertyType === 'buy').reduce((sum, p) => sum + p.totalCost, 0),
      totalRevenue: properties.filter(p => p.propertyType === 'sell').reduce((sum, p) => sum + p.amountPaid, 0),
      totalPending: properties.reduce((sum, p) => sum + p.amountPending, 0),
      totalArea: properties.reduce((sum, p) => sum + p.area, 0),
      totalProfit: 0
    };
    
    summary.totalProfit = summary.totalRevenue - summary.totalInvestment;
    
    res.json(summary);
  } catch (error) {
    console.error('Get property summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 