import { StatusCodes } from "http-status-codes";
import multer from "multer";

// eslint-disable-next-line no-unused-vars
export default function errorHandlerMiddleware(err, req, res, next) {
    const customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong try again later",
    };
    if (err instanceof multer.MulterError) {
        customError.msg = err.message || "error en la imagen";
        customError.statusCode = 400;
    }
    console.log(err);
    return res.status(customError.statusCode).json({ msg: customError.msg });
}
