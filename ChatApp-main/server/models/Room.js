import mongoose from "mongoose";
import { nanoid } from "nanoid";


const roomSchema = new mongoose.Schema(
    {
      _id: {
        type: String,
        default: () => nanoid(12),
      },
      roomName: String,
      adminUserId: String,      
    },
    {
      timestamps: true,
      collection: "rooms",
    }
  );

  roomSchema.statics.createRoom = async function (roomName, adminUserId) {
    try {
      const newRoom = await this.create({ roomName, adminUserId });
      return {
        isNew: true,
        message: 'creating new chat room',
        roomId: newRoom._doc._id,        
        roomName: newRoom._doc.roomName
      };
    } catch (error) {
      console.log('error creating chat room', error);
      throw error;
    }
  }

  roomSchema.statics.getRooms = async function () {
    try {
      const rooms = await this.find();
      return rooms;
    } catch (error) {      
      throw error;
    }
  }

  roomSchema.statics.getRoom = async function (roomId) {        
    try {
      const room = await this.findOne({ _id: roomId });
      return room;
    } catch (error) {      
      throw error;
    }
  }

  export default mongoose.model("Room", roomSchema);