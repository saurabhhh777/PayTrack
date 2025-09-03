import express, { Request, Response } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import Meel from '../models/Meel';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Create new meel record
router.post('/', 
  auth,
  [
    body('cropName')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Crop name is required and must be between 1 and 100 characters'),
    body('transactionType')
      .isIn(['Buy', 'Sell'])
      .withMessage('Transaction type must be either Buy or Sell'),
    body('transactionMode')
      .isIn(['Individual', 'With Partner'])
      .withMessage('Transaction mode must be either Individual or With Partner'),
    body('totalCost')
      .isFloat({ min: 0 })
      .withMessage('Total cost must be a positive number'),
    body('tag')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Tag is required and must be between 1 and 50 characters'),
    body('partners')
      .optional()
      .isArray()
      .withMessage('Partners must be an array'),
    body('partners.*.name')
      .if(body('transactionMode').equals('With Partner'))
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Partner name is required and must be between 1 and 100 characters'),
    body('partners.*.mobile')
      .if(body('transactionMode').equals('With Partner'))
      .trim()
      .isLength({ min: 10, max: 15 })
      .withMessage('Partner mobile is required and must be between 10 and 15 characters'),
    body('partners.*.contribution')
      .if(body('transactionMode').equals('With Partner'))
      .isFloat({ min: 0 })
      .withMessage('Partner contribution must be a positive number')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { cropName, transactionType, transactionMode, partners, totalCost, tag } = req.body;
      const userId = req.user?.id;

      // Validate partners for With Partner mode
      if (transactionMode === 'With Partner' && (!partners || partners.length === 0)) {
        return res.status(400).json({ message: 'Partners are required when transaction mode is With Partner' });
      }

      // Validate total contribution by partners
      if (transactionMode === 'With Partner' && partners) {
        const totalContribution = partners.reduce((sum: number, partner: any) => sum + partner.contribution, 0);
        if (transactionType === 'Buy' && totalContribution > totalCost) {
          return res.status(400).json({ message: 'Total contribution by partners cannot exceed total cost' });
        }
      }

      const newMeel = new Meel({
        cropName,
        transactionType,
        transactionMode,
        partners: transactionMode === 'With Partner' ? partners : undefined,
        totalCost,
        tag,
        createdBy: userId
      });

      await newMeel.save();
      await newMeel.populate('createdBy', 'username');

      res.status(201).json({
        message: 'Meel record created successfully',
        meel: newMeel
      });
    } catch (error) {
      console.error('Error creating meel record:', error);
      res.status(500).json({ message: 'Failed to create meel record' });
    }
  }
);

// Get all meel records with filters
router.get('/', 
  auth,
  [
    query('transactionType')
      .optional()
      .isIn(['Buy', 'Sell'])
      .withMessage('Transaction type must be either Buy or Sell'),
    query('transactionMode')
      .optional()
      .isIn(['Individual', 'With Partner'])
      .withMessage('Transaction mode must be either Individual or With Partner'),
    query('tag')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Tag must be between 1 and 50 characters'),
    query('cropName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Crop name must be between 1 and 100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { transactionType, transactionMode, tag, cropName, page = 1, limit = 20 } = req.query;
      const userId = req.user?.id;

      // Build filter
      const filter: any = { createdBy: userId };
      if (transactionType) filter.transactionType = transactionType;
      if (transactionMode) filter.transactionMode = transactionMode;
      if (tag) filter.tag = { $regex: new RegExp(tag as string, 'i') };
      if (cropName) filter.cropName = { $regex: new RegExp(cropName as string, 'i') };

      // Pagination
      const skip = (Number(page) - 1) * Number(limit);

      const [meelRecords, total] = await Promise.all([
        Meel.find(filter)
          .populate('createdBy', 'username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Meel.countDocuments(filter)
      ]);

      res.json({
        meelRecords,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching meel records:', error);
      res.status(500).json({ message: 'Failed to fetch meel records' });
    }
  }
);

// Get single meel record by ID
router.get('/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('Valid meel record ID is required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user?.id;

      const meelRecord = await Meel.findOne({ _id: id, createdBy: userId })
        .populate('createdBy', 'username');

      if (!meelRecord) {
        return res.status(404).json({ message: 'Meel record not found' });
      }

      res.json(meelRecord);
    } catch (error) {
      console.error('Error fetching meel record:', error);
      res.status(500).json({ message: 'Failed to fetch meel record' });
    }
  }
);

// Update meel record
router.put('/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('Valid meel record ID is required'),
    body('cropName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Crop name must be between 1 and 100 characters'),
    body('transactionType')
      .optional()
      .isIn(['Buy', 'Sell'])
      .withMessage('Transaction type must be either Buy or Sell'),
    body('transactionMode')
      .optional()
      .isIn(['Individual', 'With Partner'])
      .withMessage('Transaction mode must be either Individual or With Partner'),
    body('totalCost')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total cost must be a positive number'),
    body('tag')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Tag must be between 1 and 50 characters'),
    body('partners')
      .optional()
      .isArray()
      .withMessage('Partners must be an array'),
    body('partners.*.name')
      .if(body('transactionMode').equals('With Partner'))
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Partner name is required and must be between 1 and 100 characters'),
    body('partners.*.mobile')
      .if(body('transactionMode').equals('With Partner'))
      .trim()
      .isLength({ min: 10, max: 15 })
      .withMessage('Partner mobile is required and must be between 10 and 15 characters'),
    body('partners.*.contribution')
      .if(body('transactionMode').equals('With Partner'))
      .isFloat({ min: 0 })
      .withMessage('Partner contribution must be a positive number')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user?.id;
      const updateData = req.body;

      // Check if meel record exists and belongs to user
      const existingMeel = await Meel.findOne({ _id: id, createdBy: userId });
      if (!existingMeel) {
        return res.status(404).json({ message: 'Meel record not found' });
      }

      // Validate partners for With Partner mode
      if (updateData.transactionMode === 'With Partner' && (!updateData.partners || updateData.partners.length === 0)) {
        return res.status(400).json({ message: 'Partners are required when transaction mode is With Partner' });
      }

      // Validate total contribution by partners
      if (updateData.transactionMode === 'With Partner' && updateData.partners) {
        const totalContribution = updateData.partners.reduce((sum: number, partner: any) => sum + partner.contribution, 0);
        const cost = updateData.totalCost || existingMeel.totalCost;
        if (updateData.transactionType === 'Buy' && totalContribution > cost) {
          return res.status(400).json({ message: 'Total contribution by partners cannot exceed total cost' });
        }
      }

      const updatedMeel = await Meel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy', 'username');

      res.json({
        message: 'Meel record updated successfully',
        meel: updatedMeel
      });
    } catch (error) {
      console.error('Error updating meel record:', error);
      res.status(500).json({ message: 'Failed to update meel record' });
    }
  }
);

// Delete meel record
router.delete('/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('Valid meel record ID is required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user?.id;

      const meelRecord = await Meel.findOne({ _id: id, createdBy: userId });
      if (!meelRecord) {
        return res.status(404).json({ message: 'Meel record not found' });
      }

      await Meel.findByIdAndDelete(id);

      res.json({ message: 'Meel record deleted successfully' });
    } catch (error) {
      console.error('Error deleting meel record:', error);
      res.status(500).json({ message: 'Failed to delete meel record' });
    }
  }
);

// Get meel statistics
router.get('/stats/overview',
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { startDate, endDate } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      const filter = { createdBy: userId, ...dateFilter };

      const [totalMeelRecords, buyRecords, sellRecords, individualRecords, partnerRecords] = await Promise.all([
        Meel.countDocuments(filter),
        Meel.countDocuments({ ...filter, transactionType: 'Buy' }),
        Meel.countDocuments({ ...filter, transactionType: 'Sell' }),
        Meel.countDocuments({ ...filter, transactionMode: 'Individual' }),
        Meel.countDocuments({ ...filter, transactionMode: 'With Partner' })
      ]);

      // Get total costs
      const buyCost = await Meel.aggregate([
        { $match: { ...filter, transactionType: 'Buy' } },
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]);

      const sellRevenue = await Meel.aggregate([
        { $match: { ...filter, transactionType: 'Sell' } },
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]);

      // Get top tags
      const topTags = await Meel.aggregate([
        { $match: filter },
        { $group: { _id: '$tag', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      res.json({
        overview: {
          totalMeelRecords,
          buyRecords,
          sellRecords,
          individualRecords,
          partnerRecords
        },
        financials: {
          totalBuyCost: buyCost[0]?.total || 0,
          totalSellRevenue: sellRevenue[0]?.total || 0,
          netProfit: (sellRevenue[0]?.total || 0) - (buyCost[0]?.total || 0)
        },
        topTags
      });
    } catch (error) {
      console.error('Error fetching meel statistics:', error);
      res.status(500).json({ message: 'Failed to fetch meel statistics' });
    }
  }
);

export default router; 