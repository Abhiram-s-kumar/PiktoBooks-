import express from 'express';
import Purchase from '../models/Purchase.js';
import Item from '../models/Item.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const purchases = await Purchase.find().lean().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { supplierName, supplierPhone, date, purchaseNumber, paymentMethod, items, totalAmount, notes } = req.body;

    // Check if purchase number already exists
    const existingPurchase = await Purchase.findOne({ purchaseNumber });
    if (existingPurchase) {
      return res.status(400).json({ message: 'Purchase number already exists' });
    }

    // Update stock for each item
    for (const item of items) {
      const stockItem = await Item.findById(item.itemId);
      if (stockItem) {
        stockItem.inStock += item.quantity;
        await stockItem.save();
      }
    }

    const purchase = new Purchase({
      supplierName,
      supplierPhone,
      date,
      purchaseNumber,
      paymentMethod,
      items,
      totalAmount,
      notes,
      status: 'completed'
    });

    await purchase.save();
    res.status(201).json(purchase);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).lean();
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
