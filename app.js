import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

const app = express();

// app.use(cors()) // yeh bhi theek hai
app.use(cors({
    origin : [process.env.CORS_ORIGIN,"http://localhost:5173"],
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




//routes import
import userRouter from './src/routes/user.routes.js'
import healthcheckRouter from "./src/routes/healthcheck.routes.js"
import tweetRouter from "./src/routes/tweet.routes.js"
import subscriptionRouter from "./src/routes/subscription.routes.js"
import videoRouter from "./src/routes/video.routes.js"
import commentRouter from "./src/routes/comment.routes.js"
import likeRouter from "./src/routes/like.routes.js"
import playlistRouter from "./src/routes/playlist.routes.js"
import dashboardRouter from "./src/routes/dashboard.routes.js"
import aboutRouter from "./src/routes/about.routes.js"


// routes decleration

// user abb prefix, http://localhost:7000/api/v1/users/register

app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscription", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comment", commentRouter)
app.use("/api/v1/like", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/about/user/", aboutRouter);

// we are attaching out routers for given routes ...
// we created routes somewhere else , so we need middle wares ... 
// userRouter have may routes thars why use then . get to use routes..


// export default app; 
// then import like app
export {app};
// then import like {app}

/*
app.use() // used for middle wares or configuration settings
api response and request 
there are certain thins such that req mai data aata hai

*/

