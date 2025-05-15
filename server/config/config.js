import dotenv from 'dotenv';

dotenv.config();

export default {
  port : process.env.PORT,
  mongodbURI : process.env.MONGO_DB_URI
}