import CustomAPIErrors from "../errors/index.js";

export function verifyRoles(allowedRoles) {
    return (req, res, next) => {
        if (!req?.role) {
            throw new CustomAPIErrors.UnauthenticatedError("require rol");
        }
        const result = allowedRoles.includes(req.role);
        if (!result) {
            throw new CustomAPIErrors.UnauthenticatedError(
                "Rol not authorized",
            );
        }
        next();
    };
}
