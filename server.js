import {app} from './app.js';
import dotenv from 'dotenv';
import {connectDB} from './utils/db.js';
import {v2 as cloudinary} from 'cloudinary';
dotenv.config();

//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
  connectDB();
});

