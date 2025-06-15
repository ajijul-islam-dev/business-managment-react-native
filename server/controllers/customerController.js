import Customer from '../models/Customer.js';
import Payment from '../models/Payment.js';
import Due from '../models/Due.js';

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body;
    const storeUserId = req.user._id; // Assuming user is authenticated

    const customer = new Customer({
      name,
      phone,
      address,
      notes,
      storeUserId
    });

    await customer.save();

    // Create initial due record
    const initialDue = new Due({
      customerId: customer._id,
      storeUserId,
      amount: 0,
      note: 'Initial customer registration',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    await initialDue.save();

    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Record a payment for a customer
export const recordPayment = async (req, res) => {
  try {
    const { amount, note } = req.body;
    const { id: customerId } = req.params;
    const storeUserId = req.user._id;

    // Find the customer's active due
    const activeDue = await Due.findOne({ 
      customerId, 
      storeUserId 
    }).sort({ createdAt: -1 });

    if (!activeDue) {
      return res.status(404).json({ message: 'No active due found for this customer' });
    }

    // Create payment record
    const payment = new Payment({
      dueId: activeDue._id,
      customerId,
      storeUserId,
      amount,
      note
    });

    await payment.save();

    // Update the due amount
    activeDue.amount -= amount;
    if (activeDue.amount < 0) activeDue.amount = 0;
    await activeDue.save();

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add new due amount for a customer
export const addDue = async (req, res) => {
  try {
    const { amount, note } = req.body;
    const { id: customerId } = req.params;
    const storeUserId = req.user._id;

    // Find the customer's active due
    let activeDue = await Due.findOne({ 
      customerId, 
      storeUserId 
    }).sort({ createdAt: -1 });

    // If no active due exists, create one
    if (!activeDue) {
      activeDue = new Due({
        customerId,
        storeUserId,
        amount: 0,
        note: 'Initial due created',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
    }

    // Add to the due amount
    activeDue.amount += amount;
    if (note) activeDue.note = note;
    await activeDue.save();

    res.status(201).json(activeDue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all transactions for a customer
export const getStoreTransactions = async (req, res) => {
  try {
    const { id: customerId } = req.params;
    const storeUserId = req.user._id;

    // Get payments
    const payments = await Payment.find({ customerId, storeUserId })
      .sort({ createdAt: -1 })
      .lean();

    // Get due additions
    const dues = await Due.find({ customerId, storeUserId })
      .sort({ createdAt: -1 })
      .lean();

    // Combine and format the transactions
    const transactions = [
      ...payments.map(p => ({ ...p, type: 'payment' })),
      ...dues.map(d => ({ 
        ...d, 
        type: 'due',
        amount: d.amount,
        note: d.note || 'Due added'
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all customers for a store
export const getStoreCustomers = async (req, res) => {
  
  try {
    const storeUserId = req.user._id;
    const customers = await Customer.find({ storeUserId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Get current due amounts for each customer
    const customersWithDues = await Promise.all(
      customers.map(async customer => {
        const due = await Due.findOne({ 
          customerId: customer._id, 
          storeUserId 
        }).sort({ createdAt: -1 });
        
        return {
          ...customer,
          dueValue: due?.amount || 0,
          lastPayment: await getLastPaymentDate(customer._id, storeUserId)
        };
      })
    );

    res.status(200).json(customersWithDues);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper function to get last payment date
const getLastPaymentDate = async (customerId, storeUserId) => {
  const lastPayment = await Payment.findOne({ customerId, storeUserId })
    .sort({ createdAt: -1 });
  
  if (!lastPayment) return 'Never paid';
  
  const now = new Date();
  const paymentDate = new Date(lastPayment.createdAt);
  const diffDays = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24));
  
  return `${diffDays} days ago`;
};