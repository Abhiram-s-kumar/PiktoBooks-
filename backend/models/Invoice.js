import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  category: { type: String },
  paymentMethod: { type: String, required: true, enum: ['cash', 'upi', 'card'], index: true },
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    itemName: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'paid', enum: ['paid', 'pending', 'cancelled'] },
  date: { type: Date, required: true, index: true }
}, { timestamps: true });

// Add compound index for date-based queries
invoiceSchema.index({ date: -1, createdAt: -1 });

export default mongoose.model('Invoice', invoiceSchema);
