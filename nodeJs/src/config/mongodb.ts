// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// const MONGODB_URI = process.env.MONGODB_URI;
// if (!MONGODB_URI) {
//   throw new Error("MONGODB_URI is not defined in environment variables.");
// }

// mongoose
//   .connect(MONGODB_URI)
//   .then(() => {
//     console.log("MongoDB connected successfully.");
//   })
//   .catch((err) => {
//     console.error("MongoDB connection failed:", err);
//   });

// mongoose.connection.on("disconnected", () => {
//   console.log("MongoDB disconnected.");
// });

// mongoose.connection.on("error", (err) => {
//   console.error("MongoDB connection error:", err);
// });

// export default mongoose;
