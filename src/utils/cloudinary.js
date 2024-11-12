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
const uploadOnCloudinary = async(localFilePath)=> {
    //    console.log(localFilePath);
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        //  (file url,{many options ...})    
        const response = await cloudinary.uploader
        .upload(localFilePath,{
            resource_type: "auto",
            folder: "playtube",
        })
        .catch((error) => {
            console.log(error);
        });
        // console.log("idhar huu");
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary ", response.url);
        await fs.unlinkSync(localFilePath)
        return response;
    }
    catch (error) {
        console.log("cloudnary pe nhi gya",error);
        // upload nhi huwa tho dikkat hai
        // ulick kar do direct or sync way mei kar do ...
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteImageOnCloudinary = async (publicUrl) => {
    try {
        console.log("Public URL:", publicUrl);
        // Extract the image or video ID from the Cloudinary URL
        let match = publicUrl.match(/(?:image|video)\/upload\/v\d+\/playtube\/(.+?)\.\w+$/);
        if (!match || match.length < 2) {
          console.log("Invalid URL format.");
          return null;
        } 
        let publicId = `playtube/${match[1]}`;
        console.log("Public ID to delete:", publicId);
    
        // Deleting the file by its public ID (including folder path)
        const response = await cloudinary.uploader.destroy(
            publicId,
         {
          resource_type: "image" // Works for both images and videos
        });
    
        console.log("File deleted successfully:", response);
        return response;
    } catch (error) {
      console.log("Failed to delete the file:", error);
      return null;
    }
  };

const deleteVideoOnCloudinary = async (publicUrl) => {
    try {
        console.log("Public URL:", publicUrl);

        // Extract the image or video ID from the Cloudinary URL
        let match = publicUrl.match(/(?:image|video)\/upload\/v\d+\/playtube\/(.+?)\.\w+$/);
        if (!match || match.length < 2) {
          console.log("Invalid URL format.");
          return null;
        }
        
        let publicId = `playtube/${match[1]}`;
        console.log("Public ID to delete:", publicId);
    
        // Deleting the file by its public ID (including folder path)
        const response = await cloudinary.uploader.destroy(
            publicId,
         {
          resource_type: "video" // Works for both images and videos
        });
    
        console.log("File deleted successfully:", response);
        return response;
    } catch (error) {
      console.log("Failed to delete the file:", error);
      return null;
    }
  };

export {uploadOnCloudinary,
        deleteImageOnCloudinary,
        deleteVideoOnCloudinary
}

