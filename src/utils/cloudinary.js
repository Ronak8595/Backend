import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uplaodOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader(localFilePath, {
            resource_type: "auto",
        })
        console.log("File uplaod succesfull !!", response.url);
        return response;
    }
    catch (err) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export {uplaodOnCloudinary};