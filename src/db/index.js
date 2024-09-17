import mongoose from "mongoose";
import { DB_NAME } from "../../constant.js";


const connectDB = async () => {
    try {
        // mongo db give return 
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        // connection instance ko console . log dekhna hai ...
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);

    } catch (error) {

        console.log("MONGODB connection FAILED ", error);
        // throw error;
        // node js give acess of process , current node kisi process pe chl rha hoga

        process.exit(1)

    }
}

export default connectDB






















// use can also use iffy
// ; to clean the code 
/* 
(async ()=>
    {
    }) ()


*/