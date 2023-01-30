// .env - setup environment variables
import * as dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'

mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,    
    autoIndex: true
  })
  
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected succesfully')
  })
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected')
  })
  mongoose.connection.on('error', error => {
    console.log('MongoDB has an error', error)
    mongoose.disconnect()
  })
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected')
  })