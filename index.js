// require('dotenv').config({path: './env'})
import connectDB from "./src/db/index.js";
import {app} from './app.js'

// import dotenv from "dotenv"
// dotenv.config({
//     path: './.env'
// })

import 'dotenv/config'

// listen for error also
// app.on();
// kisi event ke liye listen karo error 

// ascryonous methods return the promise also
connectDB()
.then(() => {
    app.listen(process.env.PORT || 7000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})










/*
connecting data base on spot ...

import express from "express"
const app = express()

// using iffy

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        // to check if there is any error in express app.
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/