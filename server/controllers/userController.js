import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (e) {
    console.error('Error fetching users:', e);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
};

export const register = async (req, res) => {
  try {
    const { storeName, proprietor, email, phone, address, password } = req.body;
    
    // Validation
    if (!storeName || !proprietor || !email || !phone || !address || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required',
        field: 'general'
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      const conflictField = existingUser.email === email ? 'email' : 'phone';
      return res.status(400).json({ 
        success: false,
        error: `${conflictField} already in use`,
        field: conflictField
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      storeName,
      proprietor,
      email,
      phone,
      address,
      password: hashedPassword
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: userResponse
    });

  } catch (e) {
    console.error('Registration error:', e);
    
    let errorResponse = {
      success: false,
      error: 'Registration failed',
      field: 'general'
    };

    if (e.name === 'ValidationError') {
      errorResponse.error = 'Validation failed';
      errorResponse.details = Object.values(e.errors).map(err => err.message);
    } else if (e.code === 11000) {
      const field = Object.keys(e.keyPattern)[0];
      errorResponse.error = `${field} already in use`;
      errorResponse.field = field;
    }

    res.status(500).json(errorResponse);
  }
};

export const login = async (req, res) => {
    console.log(req.body);
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email/phone and password are required',
        field: 'general'
      });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        field: 'general'
      });
    }
    console.log(user);
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        field: 'general'
      });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log(token);
    // Prepare user data without password
    const userData = user.toObject();
    delete userData.password;
   console.log(userData);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
};