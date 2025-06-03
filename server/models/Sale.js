import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  saledUnitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  costUnitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

saleSchema.index({ createdBy: 1, productId: 1 });
saleSchema.index({ createdBy: 1, date: -1 });

export default mongoose.model('Sale', saleSchema);