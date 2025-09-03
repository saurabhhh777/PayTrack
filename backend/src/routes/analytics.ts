import express, { Request, Response } from 'express';
import Payment from '../models/Payment';
import Attendance from '../models/Attendance';
import Cultivation from '../models/Cultivation';
import Property from '../models/Property';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get unified dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    // Get payments data
    const payments = await Payment.find({
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    });
    
    // Get cultivations data
    const cultivations = await Cultivation.find({
      ...(Object.keys(dateFilter).length > 0 && { cultivationDate: dateFilter })
    });
    
    // Get properties data
    const properties = await Property.find({
      ...(Object.keys(dateFilter).length > 0 && { transactionDate: dateFilter })
    });

    // Get attendance data
    const attendance = await Attendance.find({
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    });
    
    // Calculate payment mode distribution
    const paymentModes = {
      cash: payments.filter(p => p.paymentMode === 'cash').length,
      UPI: payments.filter(p => p.paymentMode === 'UPI').length
    };
    
    // Calculate total expenses vs income
    const totalExpenses = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalIncome = cultivations.reduce((sum, c) => sum + c.amountReceived, 0) + 
                       properties.filter(p => p.propertyType === 'sell').reduce((sum, p) => sum + p.amountPaid, 0);
    
    // Calculate category-wise totals
    const categoryTotals = {
      workers: {
        totalPayments: payments.length,
        totalAmount: totalExpenses,
        pendingAmount: 0, // Workers don't have pending amounts
        totalWorkers: attendance.length > 0 ? new Set(attendance.map(a => a.workerId.toString())).size : 0,
        totalWorkingDays: attendance.filter(a => a.status === 'Present').length,
        totalAbsentDays: attendance.filter(a => a.status === 'Absent').length,
        totalLeaveDays: attendance.filter(a => a.status === 'HalfDay').length
      },
      agriculture: {
        totalCultivations: cultivations.length,
        totalCost: cultivations.reduce((sum, c) => sum + c.totalCost, 0),
        totalReceived: cultivations.reduce((sum, c) => sum + c.amountReceived, 0),
        pendingAmount: cultivations.reduce((sum, c) => sum + c.amountPending, 0),
        profit: cultivations.reduce((sum, c) => sum + (c.amountReceived - c.totalCost), 0)
      },
      realEstate: {
        totalProperties: properties.length,
        totalInvestment: properties.filter(p => p.propertyType === 'buy').reduce((sum, p) => sum + p.totalCost, 0),
        totalRevenue: properties.filter(p => p.propertyType === 'sell').reduce((sum, p) => sum + p.amountPaid, 0),
        pendingAmount: properties.reduce((sum, p) => sum + p.amountPending, 0),
        profit: properties.filter(p => p.propertyType === 'sell').reduce((sum, p) => sum + (p.amountPaid - p.totalCost), 0)
      }
    };
    
    // Time series data for charts
    const timeSeriesData = [];
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i <= days; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const dayPayments = payments.filter(p => 
          p.date.toISOString().split('T')[0] === dateStr
        );
        const dayCultivations = cultivations.filter(c => 
          c.cultivationDate.toISOString().split('T')[0] === dateStr
        );
        const dayProperties = properties.filter(p => 
          p.transactionDate.toISOString().split('T')[0] === dateStr
        );
        
        const dayAttendance = attendance.filter(a => 
          a.date.toISOString().split('T')[0] === dateStr
        );
        
        timeSeriesData.push({
          date: dateStr,
          expenses: dayPayments.reduce((sum, p) => sum + p.amount, 0),
          income: dayCultivations.reduce((sum, c) => sum + c.amountReceived, 0) + 
                 dayProperties.filter(p => p.propertyType === 'sell').reduce((sum, p) => sum + p.amountPaid, 0),
          presentWorkers: dayAttendance.filter(a => a.status === 'Present').length,
          absentWorkers: dayAttendance.filter(a => a.status === 'Absent').length
        });
      }
    }
    
    const dashboardData = {
      summary: {
        totalExpenses,
        totalIncome,
        netProfit: totalIncome - totalExpenses,
        totalPending: categoryTotals.agriculture.pendingAmount + categoryTotals.realEstate.pendingAmount,
        totalWorkers: categoryTotals.workers.totalWorkers,
        totalWorkingDays: categoryTotals.workers.totalWorkingDays,
        totalAbsentDays: categoryTotals.workers.totalAbsentDays
      },
      paymentModes,
      categoryTotals,
      timeSeriesData,
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        category: category || 'all'
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/workers
// @desc    Get workers analytics
// @access  Private
router.get('/workers', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    // Since we've changed the Payment model to track cultivation payments,
    // we'll return a placeholder for now. This can be updated later to track
    // worker-specific payments if needed.
    const workerAnalytics = {
      message: 'Worker payment analytics have been moved to cultivation payments. Use /api/analytics/agriculture for cultivation payment analytics.'
    };
    
    res.json(workerAnalytics);
  } catch (error) {
    console.error('Get workers analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/agriculture
// @desc    Get agriculture analytics
// @access  Private
router.get('/agriculture', auth, async (req, res) => {
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
    
    // Group by crop
    const cropAnalytics = cultivations.reduce((acc: any, cultivation) => {
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
      acc[cropName].count++;
      
      return acc;
    }, {});
    
    // Calculate profit for each crop
    Object.keys(cropAnalytics).forEach(cropName => {
      const crop = cropAnalytics[cropName];
      crop.profit = crop.totalReceived - crop.totalCost;
      crop.profitMargin = crop.totalCost > 0 ? ((crop.profit / crop.totalCost) * 100).toFixed(2) : 0;
    });
    
    res.json(cropAnalytics);
  } catch (error) {
    console.error('Get agriculture analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/real-estate
// @desc    Get real estate analytics
// @access  Private
router.get('/real-estate', auth, async (req, res) => {
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
    
    // Group by partner
    const partnerAnalytics = properties.reduce((acc: any, property) => {
      const partnerName = property.partnerName;
      
      if (!acc[partnerName]) {
        acc[partnerName] = {
          totalTransactions: 0,
          buyTransactions: 0,
          sellTransactions: 0,
          totalInvestment: 0,
          totalRevenue: 0,
          totalPending: 0
        };
      }
      
      acc[partnerName].totalTransactions++;
      acc[partnerName].totalPending += property.amountPending;
      
      if (property.propertyType === 'buy') {
        acc[partnerName].buyTransactions++;
        acc[partnerName].totalInvestment += property.totalCost;
      } else {
        acc[partnerName].sellTransactions++;
        acc[partnerName].totalRevenue += property.amountPaid;
      }
      
      return acc;
    }, {});
    
    // Calculate profit for each partner
    Object.keys(partnerAnalytics).forEach(partnerName => {
      const partner = partnerAnalytics[partnerName];
      partner.profit = partner.totalRevenue - partner.totalInvestment;
    });
    
    res.json(partnerAnalytics);
  } catch (error) {
    console.error('Get real estate analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 