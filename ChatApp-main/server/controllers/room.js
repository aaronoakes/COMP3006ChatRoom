import RoomModel from "../models/room.js";
import MessageModel from '../models/message.js';

export default {
  // create a new chat room
  createRoom: async (req, res) => {
    try {
      // TODO: could enhance to add validation

      const { roomName, adminUserId } = req.body;   
      const room = await RoomModel.createRoom(
        roomName,
        adminUserId
      );
      return res.status(200).json({ success: true, room });
    } catch (error) {
      return res.status(500).json({ success: false, error: error });
    }
  },
  // return array of all rooms 
  getRooms: async (req, res) => {
    
    try {
      const rooms = await RoomModel.getRooms();
      return res.status(200).json({ success: true, rooms });
    } catch (error) {      
      return res.status(500).json({ success: false, error: error });
    }
  },  
  // post a message into a room
  postMessage: async (req, res) => {

    try {
      const { roomId } = req.params;
      const userId = req.userId;

      const messagePayload = {
        messageText: req.body.messageText,
      };      

      const post = await MessageModel.postMessageToRoom(roomId, messagePayload, userId);
      // send message to all clients that are in this room
      global.io.sockets.in(roomId).emit('new message', { message: post });                  
      return res.status(200).json({ success: true, post });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },  
  deleteMessageById: async (req, res) => {
    try {
      const { messageId } = req.params;
      const message = await MessageModel.remove({ _id: messageId });
      return res.status(200).json({ 
        success: true, 
        deletedMessagesCount: message.deletedCount,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },  
  // return the last n records for the room
  getConversationByRoomId: async (req, res) => {
    try {
      // check that the room exists for the id passed
      const { roomId } = req.params;      
      const room = await RoomModel.getRoom(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'Room does not exist',
        })
      }      

      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      
      const conversation = await MessageModel.getConversationByRoomId(roomId, options);
      return res.status(200).json({
        success: true,
        conversation,        
      });
    } catch (error) {      
      return res.status(500).json({ success: false, error });
    }
  },
  // add the specified user id to the array of users who've viewed this room
  markReadByUserId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;
      const room = await RoomModel.getRoom(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'Room does not exist',
        })
      }
      
      const result = await MessageModel.markMessageRead(roomId, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },
};
