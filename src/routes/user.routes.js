import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory, 
    clearWatchHistory,
    updateAccountDetails,
    
} from "../controllers/user.controller.js";

import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT,checkUser } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    // register se phale lgana hai ..
    // single one file
    // array ek filed mei multiple files
    // array leta hai , different filed kii
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
    // middle ware use karne ke baad aur fileds add hoti hai

router.route("/login").post(loginUser)

//secured routes
// adding verfiyjJWT middleware..
// abb 2 method lageneg tho ham next use karte hai batne ke liye ki
// agle pe jaoo

router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
// patch se whi details update hogi jo karni hai..
// update karne liye avatar le rhe hai ..
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

// url se hai ...
//    /c/: ke baad jo likhoge tab milega..
router.route("/c/:username").get(checkUser, getUserChannelProfile)
router.route("/history")
      .get(verifyJWT, getWatchHistory)
      .delete(verifyJWT, clearWatchHistory);

export default router