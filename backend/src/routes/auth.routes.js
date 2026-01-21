import express from 'express';
import { login, register, verify } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/verify', auth, verify);

export default router;
