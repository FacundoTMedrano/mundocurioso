import express from "express";
const router = express.Router();
import { AuthController } from "../controllers/auth.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const auth = new AuthController();

router.get("/refresh", auth.refreshToken);
router.post("/logout", verifyJWT, auth.logOut);
router.post("/login", auth.login);
router.post("/reset-password", auth.resetPassword);
router.post("/forgot-password", auth.forgotPassword);
router.post("/change_password", verifyJWT, auth.cambiarPassword);

export default router;
