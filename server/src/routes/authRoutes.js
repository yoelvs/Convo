import express from 'express';
import { signup, login, refresh, logout, forgotPassword } from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { signupSchema, loginSchema } from '../utils/validators.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

// Handle OPTIONS requests for CORS preflight
router.options('*', (req, res) => {
  res.sendStatus(200);
});

// Note: validateRequest must come after upload since we need to validate the body
// but multer processes files first
router.post('/signup', authLimiter, upload.single('avatar'), (req, res, next) => {
  // Validate body fields (file is handled separately)
  const { error } = signupSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  next();
}, signup);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);

export default router;

