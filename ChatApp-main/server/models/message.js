import mongoose from "mongoose";
import { nanoid } from "nanoid";

const readByUserSchema = new mongoose.Schema(
  {
    _id: false,
    readByUserId: String,
    readAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: false,
  }
);

const messageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => nanoid(12),
    },
    roomId: String,
    message: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      default: () => "text",
    },
    postedByUserId: String,
    readByUsers: [readByUserSchema],
  },
  {
    timestamps: true,
    collection: "roommessages",
  }
);

messageSchema.statics.postMessageToRoom = async function (roomId, message, postedByUserId) {

    try {
      const post = await this.create({
        roomId,
        message,
        postedByUserId,
        readByUsers: { readByUserId: postedByUserId }
      });      

      const aggregate = await this.aggregate([        
        { $match: { _id: post._id } },                
        {
          $lookup: {
            from: 'users',
            localField: 'postedByUserId',
            foreignField: '_id',
            as: 'postedByUser',
          }
        },
        { $unwind: '$postedByUser' },
        {
          $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'roomInfo',
          }
        },
        { $unwind: '$roomInfo' },       
        {
          $group: {
            _id: '$_id',            
            roomId: { $last: '$roomInfo._id' },
            roomName: {$last: '$roomInfo.roomName'},
            message: { $last: '$message' },            
            postedByUser: { $last: '$postedByUser' },
            createdAt: { $last: '$createdAt' },
            updatedAt: { $last: '$updatedAt' },
          }
        }
      ]);
      return aggregate[0];
    } catch (error) {
      throw error;
    }
  }

  messageSchema.statics.getConversationByRoomId = async function (roomId, options = {}) {
    try {
      return this.aggregate([
        { $match: { roomId } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: 'users',
            localField: 'postedByUserId',
            foreignField: '_id',
            as: 'postedByUser',
          }
        },
        { $unwind: "$postedByUser" },
        
        { $skip: options.page * options.limit },
        { $limit: options.limit },
        { $sort: { createdAt: 1 } },
      ]);
    } catch (error) {
      throw error;
    }
  }

  messageSchema.statics.markMessageRead = async function (roomId, userId) {
    try {
      return this.updateMany(
        {
          roomId,
          'readByRecipients.readByUserId': { $ne: userId }
        },
        {
          $addToSet: {
            readByRecipients: { readByUserId: userId }
          }
        },
        {
          multi: true
        }
      );
    } catch (error) {
      throw error;
    }
  }

export default mongoose.model("Message", messageSchema);