import { verifyReturnData } from "../utils/jwt.js";
import CustomAPIErrors from "../errors/index.js";

export async function verifyJWT(req, res, next) {
    const authHeader = req.headers?.authorization.startsWith("Bearer ");
    if (!authHeader) {
        throw new CustomAPIErrors.UnauthenticatedError("require token verify"); //401
    }
    // eslint-disable-next-line no-undef
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const token = authHeader.split(" ")[1];

    const decoded = await verifyReturnData(token, secret);

    if (!decoded) throw new CustomAPIErrors.UnauthorizedError("invalid token"); //403
    req.id = decoded.user.id;
    req.role = decoded.user.role;
    next();
}
