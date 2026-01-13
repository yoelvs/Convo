import express from 'express';
import { 
  getRooms, 
  getMessages, 
  createGroup, 
  addMembers,
  removeMember,
  leaveGroup,
  deleteRoom,
  getInvitations,
  acceptInvitation,
  declineInvitation,
  updateGroup,
  promoteToManager,
  demoteManager,
  uploadFile,
  markRead,
} from '../controllers/chatController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.use(authenticate);

router.get('/rooms', getRooms);
router.get('/rooms/:roomId/messages', getMessages);
router.post('/rooms/:roomId/read', markRead);
router.post('/upload', upload.single('file'), uploadFile);
router.post('/groups', createGroup);
router.put('/groups/:roomId', updateGroup);
router.post('/groups/:roomId/members', addMembers);
router.delete('/groups/:roomId/members/:memberId', removeMember);
router.post('/groups/:roomId/managers/:memberId', promoteToManager);
router.delete('/groups/:roomId/managers/:managerId', demoteManager);
router.post('/groups/:roomId/leave', leaveGroup);
router.delete('/rooms/:roomId', deleteRoom);
router.get('/invitations', getInvitations);
router.post('/invitations/accept', acceptInvitation);
router.post('/invitations/decline', declineInvitation);

export default router;

