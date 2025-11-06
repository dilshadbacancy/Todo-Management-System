import mongoose from "mongoose";
import { config } from "./config";


export async function connectDatabase():Promise<void>{
    try{
        await mongoose.connect(config.database.url);
        console.log("Connected to database");
    }catch(e){
        console.error("Error connecting to database", e);
        process.exit(1);
    }
}

mongoose.connection.on("connected", () => {
    console.log("Connected to database");
});

mongoose.connection.on("error", (e) => {
    console.error("Error connecting to database", e);
    process.exit(1);
});

mongoose.connection.on("disconnected", () => {
    console.log("Disconnected from database");
});