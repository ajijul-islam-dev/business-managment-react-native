import express from 'express';
import {
  createCustomer,
  recordPayment,
  addDue,
  getStoreTransactions,
  getStoreCustomers
} from '../controllers/customerController.js';
import protect from '../middleware/authMiddleware.js';


const router = express.Router();

router.use(protect);
// Customer routes
router.route('/')
  .get(getStoreCustomers)
  .post(createCustomer);

router.route('/:id/payments')
  .post(recordPayment);

router.route('/:id/dues')
  .post(addDue);

router.route('/:id/transactions')
  .get(getStoreTransactions);

export default router;