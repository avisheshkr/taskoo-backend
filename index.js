import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

const PORT = process.env.PORT || 8080;
const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? process.env.LOCAL_DOMAIN_URL
      : process.env.DOMAIN_URL,
  optionsSuccessStatus: 200,
  credentials: true,
};

// Database configuration
connectDB();

const app = express();
// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use("/user", userRoutes);
app.use("/task", taskRoutes);

// No Routes found
app.use(notFound);
// Error Handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening on Port: ${PORT}`));
