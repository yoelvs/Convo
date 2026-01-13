import express from 'express';
import { create, feed, like, comment, deletePostController, editCommentController, deleteCommentController } from '../controllers/postController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createPostSchema } from '../utils/validators.js';
import { postLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.use(authenticate);

router.post('/', postLimiter, validateRequest(createPostSchema), create);
router.get('/feed', feed);
router.post('/:postId/like', like);
router.post('/:postId/comments', comment);
router.put('/:postId/comments/:commentId', editCommentController);
router.delete('/:postId/comments/:commentId', deleteCommentController);
router.delete('/:postId', deletePostController);

export default router;

