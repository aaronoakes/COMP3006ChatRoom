import * as dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken';
// models
import UserModel from '../models/user.js';

// this middleware hooks into the request pipeline, encoding the user's id for transmission in the Authorization header
export const encode = async (req, res, next) => {
    try {
      const { username } = req.params;      
      const user = await UserModel.getUserIdByUsername( username );
      const payload = {
        userId: user._id
      };      
      const authToken = jwt.sign(payload, process.env.JWT_SECRET_KEY);
      req.authToken = authToken;
      next();
    } catch (error) {
      return res.status(400).json({ success: false, message: error.error });
    }
  }

  // hook into the pipeline to decode the authorization header, to get the user id. 
  export const decode = (req, res, next) => {    

    if (!req.headers['authorization']) {
      return res.status(400).json({ success: false, message: 'No access token provided' });
    }
    const accessToken = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
      // add id to the request object and pass along the pipeline
      req.userId = decoded.userId;         
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }  
  }