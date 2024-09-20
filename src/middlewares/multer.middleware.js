import multer from "multer";
// multer import kiya ..
// 2 thara ki storage hoti hai multer mei
// memory storage and disk storrage..

const storage = multer.diskStorage({
    // user requrst json data , file also coming , 
    destination: function (req, file, cb) {
        // cb = callback...
        // giving folder for files
        // see file have many option  
         cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      // same name ki 3 file aajye 
      // so thoda dekh lena 
      // unique suffix add kiuya jaa sakta hai
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})