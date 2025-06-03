import express from 'express';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  purchaseProduct,
  sellProduct,
  checkOwnership,
  getDashboardMetrics
} from '../controllers/productController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProducts)
  .post(createProduct);
  
// Dashboard metrics route
router.route('/metrics')
  .get(getDashboardMetrics);


router.route('/:id')
  .patch(checkOwnership, updateProduct)
  .delete(checkOwnership, deleteProduct);

router.route('/:id/purchase')
  .post(checkOwnership, purchaseProduct);

router.route('/:id/sale')
  .post(checkOwnership, sellProduct);

export default router;