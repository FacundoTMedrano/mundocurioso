import { StatusCodes } from "http-status-codes";
import multer from "multer";

// eslint-disable-next-line no-unused-vars
export default function errorHandlerMiddleware(err, req, res, next) {
    const customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong try again later",
    };
    if (err.name === "ValidationError") {
        customError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(",");
        customError.statusCode = 400;
    } else if (err.code && err.code === 11000) {
        customError.msg = `Duplicate value entered for ${Object.keys(
            err.keyValue,
        )} field, please choose another value`;
        customError.statusCode = 400;
    } else if (err.name === "CastError") {
        customError.msg = `No item found with id : ${err.value}`;
        customError.statusCode = 404;
    } else if (err instanceof multer.MulterError) {
        customError.msg = err.message || "error en la imagen";
        customError.statusCode = 400;
    }
    console.log(err);
    return res.status(customError.statusCode).json({ msg: customError.msg });
}
