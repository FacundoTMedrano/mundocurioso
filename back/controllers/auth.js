import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
// import User from "../models/mongoose/User.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { makeAccess, makeRefresh } from "../utils/jwt.js";
import { sendResetEmail } from "../utils/sendResetEmail.js";
import { verifyReturnData } from "../utils/jwt.js";
import z from "zod";

const cookie = {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
    async login(req, res) {
        const validate = z
            .object({
                email: z.string().email(),
                password: z.string(),
            })
            .safeParse(req.body);
        if (!validate.success) {
            throw new CustomErrors.BadRequestError(
                "Please provide email and password"
            );
        }
        const user = await User.findOne({ email: validate.data.email });
        if (!user) {
            throw new CustomErrors.UnauthenticatedError("invalid credentials");
        }
        const match = await bcrypt.compare(
            validate.data.password,
            user.password
        );
        if (!match) {
            console.log("mal password");
            throw new CustomErrors.UnauthenticatedError("invalid credentials");
        }
        if (!user.isVerified) {
            throw new CustomErrors.UnauthenticatedError(
                "Please verify your email"
            );
        }

        const jwt = req?.cookies?.jwt;
        if (jwt) {
            // eslint-disable-next-line no-unused-vars
            const { maxAge, ...restoDeLaCookie } = cookie; //al parecer se debe pasar sin maxage
            res.clearCookie("jwt", restoDeLaCookie);
        }

        const accessToken = makeAccess({
            user: { id: user._id, role: user.role },
        });
        const refreshToken = makeRefresh({ user: { id: user._id } });

        res.cookie("jwt", refreshToken, cookie);

        res.status(StatusCodes.OK).json({
            role: user.role,
            accessToken,
            name: user.name,
            email: user.email,
            id: user._id,
        });
    }

    async logOut(req, res) {
        const jwt = req?.cookies?.jwt;
        if (jwt) {
            // eslint-disable-next-line no-unused-vars
            const { maxAge, ...restoDeLaCookie } = cookie; //al parecer se debe pasar sin maxage
            res.clearCookie("jwt", restoDeLaCookie);
        }

        return res.status(StatusCodes.NO_CONTENT).send();
    }

    async refreshToken(req, res) {
        const refreshToken = req?.cookies?.jwt;
        if (!refreshToken) {
            throw new CustomErrors.UnauthorizedError(
                "no autorizado en el refresh"
            );
        }

        // eslint-disable-next-line no-unused-vars
        const { maxAge, ...restoDeLaCookie } = cookie; //al parecer se debe pasar sin maxage
        res.clearCookie("jwt", restoDeLaCookie);

        const decode = await verifyReturnData(
            refreshToken,
            // eslint-disable-next-line no-undef
            process.env.REFRESH_TOKEN_SECRET
        );
        if (!decode) throw new CustomErrors.UnauthorizedError("bad token");

        const user = await User.findById(decode.user.id);

        if (!user) {
            throw new CustomErrors.UnauthorizedError(
                "no autorizado en el refresh"
            );
        }

        const accessToken = makeAccess({
            user: { id: user._id, role: user.role },
        });

        const newRefreshToken = makeRefresh({
            user: { id: user._id },
        });

        res.cookie("jwt", newRefreshToken, cookie);

        return res.status(StatusCodes.CREATED).json({
            role: user.role,
            accessToken,
            name: user.name,
            email: user.email,
            id: user._id,
        });
    }

    async forgotPassword(req, res) {
        const email = z
            .object({
                email: z.string().email(),
            })
            .safeParse(req.body);

        if (!email.success) {
            throw new CustomErrors.BadRequestError(
                "Please provide valid email"
            );
        }
        const user = await User.findOne({ email: email.data.email });
        if (!user) {
            throw new CustomErrors.BadRequestError(
                "Please provide valid email"
            );
        }
        const passwordToken = crypto.randomBytes(70).toString("hex");
        const passwordTokenHash = await bcrypt.hash(passwordToken, 10);

        await sendResetEmail({
            name: user.name,
            email: user.email,
            token: passwordToken,
            // eslint-disable-next-line no-undef
            origin: process.env.ORIGIN,
        });

        const tenMinutes = 1000 * 60 * 10;
        const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes); //debe hacerse con orario mundial

        user.passwordToken = passwordTokenHash;
        user.passwordTokenExpirationDate = passwordTokenExpirationDate;
        await user.save();

        res.status(StatusCodes.OK).json({
            msg: "Please check your email for reset password link",
        });
    }

    async resetPassword(req, res) {
        const validacion = z
            .object({
                email: z.string().email(),
                password: z.string(),
                token: z.string(),
            })
            .safeParse(req.body);

        if (!validacion.success) {
            throw new CustomErrors.BadRequestError("Please provide all values");
        }

        const user = await User.findOne({ email: validacion.data.email });
        if (!user) {
            throw new CustomErrors.BadRequestError(
                "Please provide valid values"
            );
        }

        const match = await bcrypt.compare(
            user.passwordToken,
            validacion.data.token
        );

        if (!match) {
            throw new CustomErrors.BadRequestError(
                "Please provide valid values"
            );
        }
        const currentDate = new Date();
        if (user.passwordTokenExpirationDate > currentDate) {
            const passHashed = await bcrypt.hash(validacion.data.password, 10);
            user.password = passHashed;
            user.passwordToken = null;
            user.passwordTokenExpirationDate = null;
            await user.save();
        } else {
            user.passwordToken = null;
            user.passwordTokenExpirationDate = null;
            throw new CustomErrors.BadRequestError(
                "Please provide valid values"
            );
        }
        res.status(StatusCodes.OK).json({
            msg: "reset password",
        });
    }

    async cambiarPassword(req, res) {
        console.log(req.body);
        const validacion = z
            .object({
                oldPassword: z.string(),
                newPassword: z.string().min(5).max(20),
                repetNewPassword: z.string().min(5).max(20),
            })
            .refine((data) => data.oldPassword !== data.newPassword, {
                path: ["newPassword"],
            })
            .refine((data) => data.newPassword === data.repetNewPassword, {
                path: ["repetNewPassword"],
            })
            .safeParse(req.body);

        if (!validacion.success) {
            throw new CustomErrors.BadRequestError("Please provide all values");
        }

        const user = await User.findById(req.id);
        if (!user) {
            throw new CustomErrors.BadRequestError("Please provide all values");
        }

        const match = await bcrypt.compare(
            validacion.data.oldPassword,
            user.password
        );
        if (!match) {
            throw new CustomErrors.BadRequestError(
                "Please provide valid values"
            );
        }

        const newPassword = await bcrypt.hash(validacion.data.newPassword, 10);

        user.password = newPassword;
        await user.save();
        res.status(StatusCodes.OK).json({
            msg: "password change",
        });
    }
}
