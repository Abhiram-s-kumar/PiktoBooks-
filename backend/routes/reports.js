import express from 'express';
import Item from '../models/Item.js';
import Invoice from '../models/Invoice.js';
import Purchase from '../models/Purchase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Run all queries in parallel for faster loading
    const [totalStockResult, totalSales, invoices, items] = await Promise.all([
      Item.aggregate([{ $group: { _id: null, total: { $sum: '$inStock' } } }]),
      Invoice.countDocuments(),
      Invoice.find().lean(), // Use lean() for faster queries
      Item.find().lean().select('_id purchasePrice') // Only get needed fields
    ]);
    
    // Create a map for O(1) lookup instead of O(n) for each item
    const itemPriceMap = {};
    items.forEach(item => {
      itemPriceMap[item._id.toString()] = item.purchasePrice;
    });
    
    let totalPurchaseValue = 0;
    let totalSellingValue = 0;
    
    // Calculate based on sold items from invoices
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const purchasePrice = itemPriceMap[item.itemId?.toString()];
        if (purchasePrice) {
          totalPurchaseValue += purchasePrice * item.quantity;
        }
        totalSellingValue += item.total;
      });
    });
    
    // Calculate profit
    const profit = totalSellingValue - totalPurchaseValue;
    
    res.json({
      totalStock: totalStockResult[0]?.total || 0,
      totalSales,
      totalPurchaseValue,
      totalSellingValue,
      profit
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/daybook', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    
    let selectedDate;
    if (date) {
      // Parse the date string and create a proper date object
      selectedDate = new Date(date + 'T00:00:00.000Z');
    } else {
      selectedDate = new Date();
    }
    
    // Set time to start and end of day in UTC
    const startOfDay = new Date(selectedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log('Date query:', { date, selectedDate, startOfDay, endOfDay });

    // Get all invoices for the selected date - use lean() for faster queries
    const invoices = await Invoice.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).lean().sort({ date: 1 });

    console.log('Found invoices:', invoices.length);

    // Calculate totals
    let cash = 0, upi = 0, card = 0;
    const transactions = [];
    
    invoices.forEach(invoice => {
      if (invoice.paymentMethod === 'cash') cash += invoice.totalAmount;
      if (invoice.paymentMethod === 'upi') upi += invoice.totalAmount;
      if (invoice.paymentMethod === 'card') card += invoice.totalAmount;

      // Add each item as a separate row
      invoice.items.forEach((item, index) => {
        transactions.push({
          date: invoice.date,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customerName,
          category: invoice.category || '-',
          subCategory: item.itemName,
          remarks: index === 0 ? `${invoice.items.length} items` : '',
          amount: item.total,
          totalTransaction: index === invoice.items.length - 1 ? invoice.totalAmount : '',
          paymentMethod: invoice.paymentMethod,
          cash: invoice.paymentMethod === 'cash' && index === invoice.items.length - 1 ? invoice.totalAmount : '',
          card: invoice.paymentMethod === 'card' && index === invoice.items.length - 1 ? invoice.totalAmount : '',
          upi: invoice.paymentMethod === 'upi' && index === invoice.items.length - 1 ? invoice.totalAmount : '',
          isLastItem: index === invoice.items.length - 1
        });
      });
    });

    const totals = {
      cash,
      upi,
      card,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      totalTransactions: invoices.length
    };

    res.json({ transactions, totals });
  } catch (error) {
    console.error('Daybook error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Daily Sales Report
router.get('/daily', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const dailySales = await Invoice.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalSales: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          cash: {
            $sum: { $cond: [{ $eq: ["$paymentMethod", "cash"] }, "$totalAmount", 0] }
          },
          upi: {
            $sum: { $cond: [{ $eq: ["$paymentMethod", "upi"] }, "$totalAmount", 0] }
          },
          card: {
            $sum: { $cond: [{ $eq: ["$paymentMethod", "card"] }, "$totalAmount", 0] }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          totalSales: 1,
          totalAmount: 1,
          cash: 1,
          upi: 1,
          card: 1,
          _id: 0
        }
      }
    ]);

    res.json(dailySales);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Monthly Sales Report
router.get('/monthly', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const monthlySales = await Invoice.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          totalSales: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: "$_id",
          totalSales: 1,
          totalAmount: 1,
          averagePerDay: { $divide: ["$totalAmount", 30] },
          _id: 0
        }
      }
    ]);

    res.json(monthlySales);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Revenue Summary
router.get('/revenue', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [invoices, items] = await Promise.all([
      Invoice.find({ date: { $gte: start, $lte: end } }).lean(),
      Item.find().lean().select('_id purchasePrice')
    ]);

    const itemPriceMap = {};
    items.forEach(item => {
      itemPriceMap[item._id.toString()] = item.purchasePrice;
    });

    let totalRevenue = 0, totalCost = 0, cash = 0, upi = 0, card = 0;

    invoices.forEach(invoice => {
      totalRevenue += invoice.totalAmount;
      
      if (invoice.paymentMethod === 'cash') cash += invoice.totalAmount;
      if (invoice.paymentMethod === 'upi') upi += invoice.totalAmount;
      if (invoice.paymentMethod === 'card') card += invoice.totalAmount;

      invoice.items.forEach(item => {
        const purchasePrice = itemPriceMap[item.itemId?.toString()];
        if (purchasePrice) {
          totalCost += purchasePrice * item.quantity;
        }
      });
    });

    res.json({
      totalSales: invoices.length,
      totalRevenue,
      totalCost,
      netProfit: totalRevenue - totalCost,
      cash,
      upi,
      card
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Invoice-wise List
router.get('/invoiceList', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [invoices, items] = await Promise.all([
      Invoice.find({ date: { $gte: start, $lte: end } }).lean().sort({ date: -1 }),
      Item.find().lean().select('_id purchasePrice')
    ]);

    const itemPriceMap = {};
    items.forEach(item => {
      itemPriceMap[item._id.toString()] = item.purchasePrice;
    });

    const invoiceList = invoices.map(invoice => {
      let cost = 0;
      invoice.items.forEach(item => {
        const purchasePrice = itemPriceMap[item.itemId?.toString()];
        if (purchasePrice) {
          cost += purchasePrice * item.quantity;
        }
      });

      return {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date,
        customerName: invoice.customerName,
        itemCount: invoice.items.length,
        paymentMethod: invoice.paymentMethod,
        totalAmount: invoice.totalAmount,
        profit: invoice.totalAmount - cost
      };
    });

    res.json(invoiceList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
