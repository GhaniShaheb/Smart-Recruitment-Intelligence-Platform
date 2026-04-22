import mongoose from "mongoose";

export const connectdb = async () => {
    try {
await mongoose.connect(process.env.mongo_uri,
    { serverSelectionTimeoutMS: 10000 }
);
    
        console.log("MongoDB connect hoise!!");
    } catch (error) {
        console.error("Error connecting to mongo db. the error is:", error);
        process.exit(1)//exit with failure
    }
};