import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import "dotenv/config";
import { connectDB } from "./src/lib/db.js";
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/user.js";
import chatRoutes from "./src/routes/chat.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // This allows cookies to be sent with requests
}));
app.use(express.json()); //for parsing application/json and content from DB
app.use(cookieParser())

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening!`);
  connectDB();
});
