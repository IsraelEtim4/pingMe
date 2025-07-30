import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import "dotenv/config";
import { connectDB } from "./src/lib/db.js";
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/user.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json()); //for parsing application/json and content from DB
app.use(cookieParser())

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening!`);
  connectDB();
});
