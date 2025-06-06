import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  packSize: {
    type: String,
    required: [true, 'Pack size is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pcs', 'kg', 'g', 'L', 'ml', 'box', 'pack', 'bag', 'bottle', 'can', 'dozen']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

productSchema.index({ createdBy: 1, name: 1 }); // Compound index for better query performance

const Product = mongoose.model('Product', productSchema);

export default Product;