import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Add/Update Telegram username
router.post('/add-telegram', 
  auth,
  [
    body('telegramUsername')
      .isLength({ min: 3, max: 32 })
      .withMessage('Telegram username must be between 3 and 32 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Telegram username can only contain letters, numbers, and underscores')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { telegramUsername } = req.body;
      const userId = req.user?._id;

      // Check if Telegram username is already registered with another user
      const existingUser = await User.findOne({ telegramUsername });
      if (existingUser && existingUser._id?.toString() !== userId?.toString()) {
        return res.status(400).json({ 
          message: 'Telegram username already registered with another user' 
        });
      }

      // Update user's Telegram username
      await User.findByIdAndUpdate(userId, { telegramUsername });

      res.json({ 
        message: 'Telegram username updated successfully', 
        telegramUsername
      });
    } catch (error) {
      console.error('Error updating Telegram username:', error);
      res.status(500).json({ message: 'Failed to update Telegram username' });
    }
  }
);

// Get user's Telegram username
router.get('/status',
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId).select('telegramUsername');
      
      res.json({
        telegramUsername: user?.telegramUsername || null
      });
    } catch (error) {
      console.error('Error getting Telegram username:', error);
      res.status(500).json({ message: 'Failed to get Telegram username' });
    }
  }
);

export default router; 