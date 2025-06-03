import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import Sale from '../models/Sale.js';
import mongoose from 'mongoose';

// Middleware to verify ownership
export const checkOwnership = async (req, res, next) => {
  const resource = await Product.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });
  
  if (!resource) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this resource'
    });
  }
  
  next();
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (e) {
    console.error('Error fetching products:', e);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
};

// Create product
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user._id
    });
    
    if (product.stock > 0) {
      
      const purchase = await Purchase.create({
      productId: product._id,
      quantity : product.stock,
      unitCost : product.price,
      createdBy: req.user._id
    });
    }

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (e) {
    console.error('Product creation error:', e);
    res.status(500).json({
      success: false,
      error: e.name === 'ValidationError' ? 
        Object.values(e.errors).map(err => err.message) : 
        'Product creation failed'
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (e) {
    console.error('Product update error:', e);
    res.status(500).json({
      success: false,
      error: 'Product update failed'
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (e) {
    console.error('Product deletion error:', e);
    res.status(500).json({
      success: false,
      error: 'Product deletion failed'
    });
  }
};

// Purchase product
export const purchaseProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { quantity, unitCost } = req.body;
    
    // 1. Update product stock AND unit cost
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { 
        $inc: { stock: quantity },
        $set: { price: unitCost } // This will update the unit cost
      },
      { 
        new: true, 
        runValidators: true, // Ensures the new unitCost passes validation
        session 
      }
    );

    if (!product) {
      throw new Error('Product not found');
    }

    // 2. Create purchase record
    const purchase = await Purchase.create([{
      productId: req.params.id,
      quantity,
      unitCost,
      createdBy: req.user._id
    }], { session });

    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      data: { product, purchase: purchase[0] }
    });
  } catch (e) {
    await session.abortTransaction();
    console.error('Purchase error:', e);
    res.status(500).json({
      success: false,
      error: e.message || 'Purchase failed'
    });
  } finally {
    session.endSession();
  }
};

// Sell product
export const sellProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { quantity, saledUnitPrice,costUnitPrice } = req.body;

    // 1. Update product stock
    const product = await Product.findOneAndUpdate(
      { 
        _id: req.params.id, 
        createdBy: req.user._id,
        stock: { $gte: quantity } 
      },
      { $inc: { stock: -quantity } },
      { new: true, session }
    );

    if (!product) {
      throw new Error('Insufficient stock or product not found');
    }

    // 2. Create sale record
    const sale = await Sale.create([{
      productId: req.params.id,
      quantity,
      saledUnitPrice,
      costUnitPrice,
      createdBy: req.user._id
    }], { session });

    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      data: { 
        product, 
        sale: sale[0],
        saleTotal: quantity * saledUnitPrice 
      }
    });
  } catch (e) {
    await session.abortTransaction();
    console.error('Sale error:', e);
    res.status(500).json({
      success: false,
      error: e.message || 'Sale failed'
    });
  } finally {
    session.endSession();
  }
};

export const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period } = req.query;
    const { startDate, endDate } = getDateRange(period, req.query);
    const lowStockThreshold = 10; // Define your low-stock threshold

    // 1. Sales Aggregation (unchanged)
    const salesPromise = Sale.aggregate([
      {
        $match: {
          createdBy: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: { $multiply: ["$quantity", "$saledUnitPrice"] } },
          cost: { $sum: { $multiply: ["$quantity", "$costUnitPrice"] } },
          salesCount: { $sum: 1 },
          itemsSold: { $sum: "$quantity" }
        }
      }
    ]);

    // 2. Purchases Aggregation (unchanged)
    const purchasePromise = Purchase.aggregate([
      {
        $match: {
          createdBy: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          purchased: { $sum: { $multiply: ["$quantity", "$unitCost"] } }
        }
      }
    ]);

    // 3. Inventory Status & Stock Value (UPDATED: Uses Product.price)
    const inventoryPromise = Product.aggregate([
      { 
        $match: { 
          createdBy: userId,
          stock: { $gt: 0 } // Optional: Only count in-stock items
        } 
      },
      {
        $addFields: {
          stockValue: { $multiply: ["$stock", "$price"] } // stock × selling price
        }
      },
      {
        $facet: {
          totalProducts: [{ $count: 'count' }],
          outOfStock: [
            { $match: { stock: { $lte: 0 } } }, 
            { $count: 'count' }
          ],
          lowStock: [
            { $match: { stock: { $gt: 0, $lt: lowStockThreshold } } }, 
            { $count: 'count' }
          ],
          stockValues: [
            { 
              $group: { 
                _id: null, 
                stockValue: { $sum: "$stockValue" } // Total stock value
              } 
            }
          ]
        }
      }
    ]);

    // Execute all promises in parallel
    const [salesData, purchaseData, inventoryData] = await Promise.all([
      salesPromise,
      purchasePromise,
      inventoryPromise
    ]);

    // Response (unchanged structure, but now uses accurate stockValue)
    res.status(200).json({
      success: true,
      data: {
        sales: {
          revenue: salesData[0]?.revenue || 0,
          count: salesData[0]?.salesCount || 0,
          itemsSold: salesData[0]?.itemsSold || 0
        },
        cost: salesData[0]?.cost || 0,
        profit: (salesData[0]?.revenue || 0) - (salesData[0]?.cost || 0),
        purchased: purchaseData[0]?.purchased || 0,
        inventory: {
          total: inventoryData[0].totalProducts[0]?.count || 0,
          outOfStock: inventoryData[0].outOfStock[0]?.count || 0,
          lowStock: inventoryData[0].lowStock[0]?.count || 0,
          stockValue: inventoryData[0].stockValues[0]?.stockValue || 0
        }
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard metrics.'
    });
  }
};






// Helper function to calculate date ranges
function getDateRange(period, query = {}) {
  const now = new Date();
  let startDate, endDate = new Date(now); // Create new Date instance for endDate

  // Create a fresh date for calculations to avoid mutation
  const calcDate = new Date(now);

  switch(period) {
    case 'today':
      startDate = new Date(calcDate);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(calcDate);
      startDate.setDate(calcDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(calcDate);
      startDate.setMonth(calcDate.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(calcDate);
      startDate.setFullYear(calcDate.getFullYear() - 1);
      break;
    case 'all':
      startDate = new Date(0);
      break;
    case 'custom':
      startDate = query.startDate ? new Date(query.startDate) : new Date(0);
      endDate = query.endDate ? new Date(query.endDate) : new Date(now);
      break;
    default:
      startDate = new Date(calcDate);
      startDate.setDate(calcDate.getDate() - 7);
  }

  // Ensure endDate is at end of day
  if (period !== 'custom') {
    endDate = new Date(now);
  }
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}