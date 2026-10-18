import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, verify } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Slows down credential stuffing; counted per client IP, per pod.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.post('/register', credentialLimiter, register);
router.post('/login', credentialLimiter, login);
router.get('/verify', auth, verify);

export default router;
