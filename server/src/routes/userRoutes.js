import express from 'express';
import { getProfile, updateProfile, search, getAllUsers, getFriendsList, getCurrentUser, changeEmail, changePassword } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { updateProfileSchema } from '../utils/validators.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.get('/me', authenticate, getCurrentUser);
router.get('/search', authenticate, search);
router.get('/all', authenticate, getAllUsers);
router.get('/friends', authenticate, getFriendsList);
router.put('/email', authenticate, changeEmail);
router.put('/password', authenticate, changePassword);
router.get('/:id', authenticate, getProfile);
router.put('/:id/edit', authenticate, upload.single('avatar'), (req, res, next) => {
  // Validate body fields (file is handled separately)
  const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  next();
}, updateProfile);

export default router;

