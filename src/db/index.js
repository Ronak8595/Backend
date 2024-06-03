import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";


const connectDB = async() => {
    try {
        const connectionReferrence = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // console.log(connectionReferrence);
        console.log(`MONGODB Connection Established!!! DB Host - ${connectionReferrence.connection.host}`);
    } catch (error) {
        console.log("Error Connecting to MONGODB", error);
        process.exit(1);
    }
}

export default  connectDB;