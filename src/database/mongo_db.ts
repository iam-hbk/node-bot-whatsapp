import mongoose from "mongoose";
import dotenv from "dotenv";
import { populateMongoDB } from "../utils/read_csv";

dotenv.config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("MongoDB connected 🔥");
    await populateMongoDB();
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1);
  }
};
export default connectDB;
