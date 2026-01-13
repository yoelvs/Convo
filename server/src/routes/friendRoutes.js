import express from 'express';
import { request, accept, decline, requests, remove } from '../controllers/friendController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/request', request);
router.post('/accept', accept);
router.post('/decline', decline);
router.post('/remove', remove);
router.get('/requests', requests);

export default router;

