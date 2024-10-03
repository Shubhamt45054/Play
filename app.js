import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

const app = express();

// app.use(cors()) // yeh bhi theek hai
app.use(cors({
    origin : process.env.CORS_ORIGIN,
     credentials:true,
}))

// data will come from different forms, froms url
// yeh forms wale data se aya
app.use(express.json({limit:"16kb"}))
// url encoder 
// space = %20
// different place url different thara se chlta hai
app.use(express.urlencoded({extended:true,limit:"16kb"}));

// files or folder or koi pdf video store karne hai server pe
app.use(express.static("public"))
// its folder name

// cookie-parser , ham browser cookie par cruds operation perform karenge
// securely karne kuch options hota hai, jo sirf server hi upload kar pay aur server hi update..
app.use(cookieParser())
// its and configuration...

// routes import 

import userRoutes from './src/routes/user.routes.js'



// routes decleration

// user abb prefix, http://localhost:8000/api/v1/users/register
app.use('/api/v1/users',userRoutes);








// export default app; 
// then import like app
export {app};
// then import like {app}

/*
app.use() // used for middle wares or configuration settings
api response and request 
there are certain thins such that req mai data aata hai

*/

