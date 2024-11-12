import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary,
        deleteImageOnCloudinary
} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


// big names help in readibility 

const generateAccessAndRefereshTokens = async (userId) =>{
    try {
        // isi help se hamne user mei add kar diye tokens apne
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // adding value in object
        user.refreshToken = refreshToken

        // user.save methods in mongodb
        // after that mongoose model kicks in
        // so password needed
        // so we didn't to validate.. 
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


 
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // json se data yeh form se data 
    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    // checking if empty tho nhi aya kuchh...
    if (
        // ek bhi nee return kiya tho true hogya
        // some mei ek bhi shi huwa tho return kar denga ...
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
// can check if email has @ or not ...

// now to check if user already exist 
    //  User.findOne({email})
    // User.findOne({username})

    // now to use operator we can use $ sign 
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // print karke ke dekho iskoo..
    //console.log(req.files);

    // .files ka access milega multer se ...
    // ham file ka path chathe haii ...
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    // isArray check karne ke liye ki proper array aya yeh nhi ...
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // avatar agar nhi hai thoo ...
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    // uploading on cloudinary ... 
    // console.log(avatarLocalPath);
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // console.log(avatar);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is req")
    }
// kafi data aata hai , tho ek baar print karke jarur dekhe..

// time lagega db mei jane mei ...
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    // await deleteImageOnCloudinary(avatar.url); wokrking ...

    // user ko mongodb autmoatically _id de deta hai..
// to check user bana yeh nhi ... 
// findById se chekc karne kar sakte ki user hai yeh nhi
// .select use karke ham select kar sakte 
// kya select nhi karnaa ..
// .select() is method ..

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        //status code , data , message 
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )


const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    // taking data from body ...
    const {email, username, password} = req.body
    // console.log(email);
    

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }


    // using $or both username and email
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not Register")
    }

    // checking if password is correct..
    // we send the password user send it to us, for the user password , we can acess using this.password,
    // jo user ham use kar rhe hai vo , database se aya hai.. 
   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }
    // after this hamne tokens add kar diye 
    // but hamre wala jo user hai vo phale hi liya tha tho usme nhi hai..
   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

//    isliye dubra chiye user 

   // now current situation kya hai ki
   // jo current user hai hamre pass , uspe access token or refres token
   // nhi hai , jo ki hone chiye the....
   // yeh tho abb add karo user mei
   // yeh dubra call hi kar lo
   // agar expensive nhi hai operation
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // sending cookies 
    const options = {
        // by defualt koi bhi modified kar sakta hai..
        // frontend se modifie nhi kar sakte abb
        // khali frontend wla kar sakta hai..
        httpOnly: true,
        secure: true
    }

    // cookie(name,value,options);
    return res 
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        // status code , data , message 
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})


// logout karunga kasee
// cookie hatoo sabse phale
// referse token ko bhi hatna hogaa...

const logoutUser = asyncHandler(async(req, res) => {
    // verifyjwt se aya hai yeh tho , user,._id 
    await User.findByIdAndUpdate(
        req.user._id,
        {
            // ki kisi hatana hai ....
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
            // $set: {
            //     refreshToken: undefined // this removes the field from document
            // }
        },
        {
            // return mei update mei new value milegi
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // we didn't using 
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    // check if token in same ...
    try {
     const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        // creating new refresstoken even ...
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    // user mi change kar diya hai...
    user.password = newPassword
    // save mei dataBase mei save karenge...
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async(req, res) => {
    // jab middleware lagega tho req.user aagya hamare pass ...
    console.log("current user");
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const { fullName, email, username, description } = req.body;

    if (!fullName && !email && !username && !description) {
      throw new ApiError(400, "At least one Change Required");
    }
  
    const user = await User.findById(req.user?._id);
  
    if (fullName) user.fullName = fullName;
  
    if (email) user.email = email;
  
    if (description) user.description = description;
  
    if (username) {
      const isExists = await User.find({ username });
      if (isExists?.length > 0) {
        throw new ApiError(400, "Username not available");
      } else {
        user.username = username;
      }
    }
  
    const updatedUserData = await user.save();
  
    if (!updatedUserData) {
      new ApiError(500, "Error while Updating User Data");
    }
  
    delete updatedUserData.password;
  
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedUserData, "Profile updated Successfully")
      );
});



// file updates 
// apply multer and verfiyJwt middlewares ....

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path
    // sheeda isko bhi save kara sakte ho databse mei ..

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")


    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})



const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})




const getUserChannelProfile = asyncHandler(async(req, res) => {
    // url se , username nikal rhe hai...
    const {username} = req.params

    // checking if username exist...
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    // direct ham arrgeation lga sakte hai , match property se ...
    const channel = await User.aggregate([
        {
            // 1st pipeline ...
            // find karta hai..
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            // left join 
            // to find the subsribers ...
            // loop up dhudne ke kaam aata hai ..
            // this gives Subscribers of channel
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            // this gives subcriptions of channel
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            // to add additional fileds 
            $addFields: {
                subscribersCount: {
                    // no of subscriber 
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    // verify condition , if ,]req.user id in subsribers .
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            // return kya karunga ...
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    // what type does aggreagte returns ...
    // array with multiple { }
    // for our case , its only return one object 
    // console.log("users  get user Profile");
    // console.log(channel);
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

// nested loopUp , like hamko histroy chiye
// hostory ke liye video pe jayega ...
const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
               // _id : req.user.id not work
               // as this codes directly goes to mongodb
               // not using mongoose
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            // left outer join between two collections, in this case, "users" and "videos".
            $lookup: { 
                
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",

                // videos ka data manga rhe hai jo video hamne dehki
                // but video mei user bhi tho hai uski infoo bhi chiye
                // sub pipleline thats why..

                // sub pipleline 
                // Additional operations on the "videos" documents
                pipeline: [
                    {
                         // abb jo watch histroy hai usme owner hai vo id hai
                         // uska data chiye , but sara nhi 
                         // so ek aur subpiple line lga ke ham project se limited data lenge 
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            // phale se owner hai ...
                            as: "owner",

                            // iss pipleline ko bhar lga ke bhi dekhna ...
                            // yeh jo user wala doucment hai uspe lagega..
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                        //selected before they are returned as part of the watchHistory field.
                                    }
                                }
                            ]
                            // agar isko bhar use karenge tho 
                            //  directly use $project after the outer lookup (i.e., after joining videos with watchHistory), 
                        }
                    },
                    {
                        // maybe array is returented 
                        $addFields:{
                            owner:{
                                $first:  "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

const clearWatchHistory = asyncHandler(async (req, res) => {
    // find karo id se watchhistory ko reset kar doo..
    const isCleared = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(req.user?._id),
      {
        $set: {
          watchHistory: [],
        },
      },
      {
        new: true,
      }
    );

    if (!isCleared) throw new ApiError(500, "Failed to clear history");
    return res
      .status(200)
      .json(new ApiResponse(200, [], "History Cleared Successfully"));

  });


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    clearWatchHistory
}


