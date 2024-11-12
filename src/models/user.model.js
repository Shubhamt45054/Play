import mongoose, {Schema} from "mongoose";
// directly taking mongoose.Schema .. 
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            // using index make optimize in searxh 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            // agar nhi diya gya tho message print hoga...
            required: [true, 'Password is required']
        },
        description: {
         type: String,
         default: "",
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)

// just event se phale chlta hai 
// events fixed hai konse hai validate, save, updateone...
// error function mai this ka reference nhi hota...
// we need to the context 
// middleware ke flag mei next hoga hi hoga ...

userSchema.pre("save", async function (next) {

    // we have this to check is field is modified
    // we pass the filed we are checking in bracket ...
    if(!this.isModified("password")) return next();

    // kya hash karna hai aur , number of salts .. mtlb hash rounds 
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// countom methods in schmea 
// we adding property is Pass
// then adding function to adding the method ..
userSchema.methods.isPasswordCorrect = async function(password){
    // its in alreday bcrypt
    // time lagata hai ....
    return await bcrypt.compare(password, this.password)
}

// jwt kya hai , bearer token
// generating access token 
userSchema.methods.generateAccessToken = function(){
    // jwt.sign to generate token ...
    // (payload ,secret token , {expriresIn:  } // yhe hamsea isme hi aygea object ki firm mei)
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// generating refress token 
// it have less information
// it keeps refreshing ....
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)