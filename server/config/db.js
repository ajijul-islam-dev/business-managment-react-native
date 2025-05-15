import mongoose from 'mongoose';
import config from './config.js';

const connectDB = async ()=>{
  try {
    await mongoose.connect(config.mongodbURI)
    console.log('mongodb connected successfully ✅')
  } catch (e) {
    console.log('mongodb connection failed ❌',e.message)
  }
}

export default connectDB;