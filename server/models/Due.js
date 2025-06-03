import mongoose from 'mongoose';

const dueSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  storeUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  note: String,
  dueDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Due', dueSchema);