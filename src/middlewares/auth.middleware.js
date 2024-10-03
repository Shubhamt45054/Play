import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

// phale verify karunga shi token hai yeh nhi...
// we can also user (res=> _ ) to implement tha we arn't using this 
export const verifyJWT = asyncHandler(async(req,res, next) => {
    try {
        // maybe cookies mei ho accesstokens
        // user can also send coutom header...
        // Authorization aata hai generally ... headr mei
        // Authorization : Bearer <token>
        // console.log(req.cookies);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        // like hamne token mei data bej tha
        // to hamko verify karna hoga , secret key ko dekar
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
        // after verifying we adding a new property

        // req.user in that .....
        // req mei naya obejct add karna ..
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})