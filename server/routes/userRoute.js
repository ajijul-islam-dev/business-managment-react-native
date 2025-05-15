import express from 'express';
import { getUsers, register,login } from '../controllers/userController.js';

const router = express.Router();

// Define routes
router.get('/', getUsers);       // GET /api/users
router.post('/register', register); // POST /api/users/register
router.post('/login', login); // POST /api/users/login

export default router;