import mongoose from 'mongoose';


const paymentSchema = new mongoose.Schema({
  dueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Due',
    required: true
  },
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
  note: String
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);