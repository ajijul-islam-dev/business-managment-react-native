import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user.userId });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (e) {
    console.error('Error fetching products:', e);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, packSize, unit } = req.body;

    // Validation
    if (!name || !price || !stock || !packSize || !unit) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const product = await Product.create({
      name,
      price,
      stock,
      packSize,
      unit,
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (e) {
    console.error('Product creation error:', e);
    
    let errorResponse = {
      success: false,
      error: 'Product creation failed'
    };

    if (e.name === 'ValidationError') {
      errorResponse.error = 'Validation failed';
      errorResponse.details = Object.values(e.errors).map(err => err.message);
    }

    res.status(500).json(errorResponse);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, packSize, unit } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: id, createdBy: req.user.userId },
      { name, price, stock, packSize, unit },
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
      message: 'Product updated successfully',
      data: product
    });

  } catch (e) {
    console.error('Product update error:', e);
    res.status(500).json({
      success: false,
      error: 'Product update failed',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (e) {
    console.error('Product deletion error:', e);
    res.status(500).json({
      success: false,
      error: 'Product deletion failed',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
};