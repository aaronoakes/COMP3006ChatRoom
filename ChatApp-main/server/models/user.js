import mongoose from "mongoose";
import { nanoid } from "nanoid";

const userSchema = new mongoose.Schema(
    {
      _id: {
        type: String,
        default: () => nanoid(12),
      },  
      username: { type: String, required: true, unique: true } ,
      firstName: { type: String, required: true }, 
      lastName: { type: String, required: true },    
    },
    {
      timestamps: true,     // have mongoose manage createdAt and updatedAt fields
      collection: "users",  // collection name inside database
    }
  );

 userSchema.statics.createUser = async function (username, firstName, lastName) {
    try {
      const user = await this.create({username, firstName, lastName});
      return user;
    } catch (error) {
      throw error;
    }
  }

  userSchema.statics.getUserIdByUsername = async function(username) {
  
    try {
      const user = await this.findOne({ username: username}) ;
      if (!user) {
        throw ({error: 'User not found' });
      }
      return user;

    } catch (error) {      
      throw error;
    }
  }

  userSchema.statics.getUserById = async function (id) {
    try {
      const user = await this.findOne({ _id: id });
      if (!user) throw ({ error: 'User not found' });
      return user;
    } catch (error) {
      throw error;
    }
  }

  userSchema.statics.getUsers = async function () {
    try {
      const users = await this.find();
      return users;
    } catch (error) {
      throw error;
    }
  }

  userSchema.statics.deleteUserById = async function (id) {
    try {
      const result = await this.remove({ _id: id });
      return result;
    } catch (error) {
      throw error;
    }
  }

  userSchema.statics.getUsersByIds = async function (ids) {
    try {
      const users = await this.find({ _id: { $in: ids } });
      return users;
    } catch (error) {
      throw error;
    }
  }

  // assign the schema just defined to the User model 
  export default mongoose.model("User", userSchema);