import express from 'express';
import room from '../controllers/room.js';
import { decode } from '../middleware/auth_token.js';

const router = express.Router();

router
  .get('/:roomId', room.getConversationByRoomId)
  .get('/', room.getRooms)
  .post('/create', room.createRoom)  
  .post('/:roomId/message', decode, room.postMessage)
  .delete('/:messageId/delete', room.deleteMessageById)
  .put('/:roomId/mark-read', decode, room.markReadByUserId)

export default router;