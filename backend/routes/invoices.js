import express from 'express';
import Invoice from '../models/Invoice.js';
import Item from '../models/Item.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find().lean().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { customerName, phoneNumber, date, invoiceNumber, category, paymentMethod, items, totalAmount } = req.body;

    // Check if invoice number already exists
    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }

    // Update stock for each item
    for (const item of items) {
      const stockItem = await Item.findById(item.itemId);
      if (stockItem) {
        if (stockItem.inStock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${stockItem.name}. Available: ${stockItem.inStock}` 
          });
        }
        stockItem.inStock -= item.quantity;
        await stockItem.save();
      }
    }

    const invoice = new Invoice({
      customerName,
      phoneNumber,
      date,
      invoiceNumber,
      category,
      paymentMethod,
      items,
      totalAmount,
      status: 'paid'
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
