import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import friendRoutes from './friendRoutes.js';
import postRoutes from './postRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = express.Router();

// Handle OPTIONS requests for all routes (CORS preflight)
router.options('*', (req, res) => {
  res.sendStatus(200);
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/friends', friendRoutes);
router.use('/posts', postRoutes);
router.use('/chat', chatRoutes);

export default router;

