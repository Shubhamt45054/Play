// yeh nam diya , v2 bulaya aur usko cloudinary ayaa ..
import {v2 as cloudinary} from "cloudinary"
// fs is libraray comes with node.js 
import fs from "fs"
import 'dotenv/config'


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// localFilePath mei url ayegaa file kaa.
const uploadOnCloudinary = async (localFilePath) => {
    //    console.log(localFilePath);
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        //  (file url,{many options ...})
        
        const response = await cloudinary.uploader
        .upload(localFilePath,{
            resource_type: "auto"
        }).catch((error) => {
            console.log(error);
        });

        // console.log("idhar huu");
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.log("cloudnary pe nhi gya");
        // upload nhi huwa tho dikkat hai
        // ulick kar do direct or sync way mei kar do ...
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary}

