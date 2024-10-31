import dotenv from "dotenv";
dotenv.config();
import "express-async-errors";

import express from "express";
const app = express();

import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { corsOptions } from "./config/corsConfig.js";

import { verifyJWT } from "./middlewares/verifyJWT.js";

import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";

import connectDB from "./config/db.js";
connectDB();

import notFoundMiddleware from "./middlewares/notFound.js";
import errorHandlerMiddleware from "./middlewares/error-handler.js";

app.set("trust proxy", 1);

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/imgs", express.static("imgs"));
app.use(helmet());

app.use("/auth", authRouter);
app.use("/admin", verifyJWT, userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// eslint-disable-next-line no-undef
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`);
});
