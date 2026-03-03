import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  purchaseNumber: { type: String, required: true, unique: true, index: true },
  supplierName: { type: String, required: true },
  supplierPhone: { type: String, required: true },
  paymentMethod: { type: String, required: true, enum: ['cash', 'upi', 'card', 'bank_transfer'] },
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    itemName: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'completed', enum: ['completed', 'pending', 'cancelled'] },
  notes: { type: String },
  date: { type: Date, required: true }
}, { timestamps: true });

purchaseSchema.index({ date: -1, createdAt: -1 });

export default mongoose.model('Purchase', purchaseSchema);
