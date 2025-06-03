import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoute.js';
import productRoutes from './routes/productRoute.js';
import customerRoute from './routes/customerRoute.js';

const app = express();

// Connect to DB
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} ✅`);
});