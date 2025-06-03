import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
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
  unitCost: {
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

purchaseSchema.index({ createdBy: 1, productId: 1 });
purchaseSchema.index({ createdBy: 1, date: -1 });

export default mongoose.model('Purchase', purchaseSchema);