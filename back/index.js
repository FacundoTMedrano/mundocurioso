import { PORT } from "./config/process.js";
import "express-async-errors";

import express from "express";
const app = express();

import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { corsOptions } from "./config/corsConfig.js";

// import { verifyJWT } from "./middlewares/verifyJWT.js";

import authRouter from "./routes/authRouter.js";
import curiosidadesRouter from "./routes/curiosidadesRouter.js";
import categoriasPortadaRouter from "./routes/categoriasPortadaRouter.js";

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
app.use("/categorias-portada", categoriasPortadaRouter);
app.use("/curiosidades", curiosidadesRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`);
});
