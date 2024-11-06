import { verifyReturnData } from "../utils/jwt.js";
import CustomAPIErrors from "../errors/index.js";
import { ACCESS_TOKEN_SECRET as secret } from "../config/process.js";

export async function verifyJWT(req, _, next) {
    const authHeader = req.headers?.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        throw new CustomAPIErrors.UnauthenticatedError("require token verify"); //401
    }

    const token = authHeader.split(" ")[1];

    const decode = await verifyReturnData(token, secret);

    if (!decode) throw new CustomAPIErrors.UnauthorizedError("invalid token"); //403
    req.id = decode.user;
    next();
}
