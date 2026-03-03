import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true, index: true },
  size: { type: String },
  hsnCode: { type: String },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  inStock: { type: Number, default: 0 },
  reorderPoint: { type: Number, required: true }
}, { timestamps: true });

// Add compound index for common queries
itemSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model('Item', itemSchema);
