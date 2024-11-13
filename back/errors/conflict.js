import { StatusCodes } from "http-status-codes";
import CustomAPIError from "./custom-api.js";

//por ejempli no se puede crear otro elemento por que ya existe uno con el mismo nombre
export default class ConflictError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.CONFLICT;
    }
}
