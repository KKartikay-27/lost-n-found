import express from 'express';
import { signUpload } from '../controllers/upload.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/sign', auth, signUpload);

export default router;
