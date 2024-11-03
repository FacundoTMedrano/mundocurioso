import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
import pool from "../config/db.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendResetEmail } from "../utils/sendResetEmail.js";
import { verifyReturnData, makeAccess, makeRefresh } from "../utils/jwt.js";
import { ORIGIN, REFRESH_TOKEN_SECRET } from "../config/process.js";
import z from "zod";
import ms from "ms";

//como no tiene path o domain entonces al borrar deberia poder sin poner las opciones
const cookie = {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: ms("7d"),
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

        const query = `
        SELECT * FROM admin 
        WHERE email = $1;
      `;
        const values = [validate.data.email];
        const response = await pool.query(query, values);
        const user = response.rows[0];

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

        const accessToken = makeAccess({ user: user.id });

        const refreshToken = makeRefresh({ user: user.id });

        res.cookie("jwt", refreshToken, cookie);

        res.status(StatusCodes.OK).json({
            accessToken,
            id: user.id,
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
            REFRESH_TOKEN_SECRET
        );

        if (!decode) throw new CustomErrors.UnauthorizedError("bad token");

        const query = `
        SELECT * FROM admin 
        WHERE id = $1;
      `;
        const values = [decode.user];
        const response = await pool.query(query, values);
        const user = response.rows[0];

        if (!user) {
            throw new CustomErrors.UnauthorizedError(
                "no autorizado en el refresh"
            );
        }

        const accessToken = makeAccess({ user: user.id });

        const newRefreshToken = makeRefresh({ user: user.id });

        res.cookie("jwt", newRefreshToken, cookie);

        return res.status(StatusCodes.CREATED).json({
            accessToken,
            id: user.id,
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

        const query = `
        SELECT * FROM admin 
        WHERE email = $1;
      `;
        const values = [email.data.email];
        const response = await pool.query(query, values);
        const user = response.rows[0];

        if (!user) {
            throw new CustomErrors.BadRequestError(
                "Please provide valid email"
            );
        }
        const passwordToken = crypto.randomBytes(70).toString("hex");
        const passwordTokenHash = await bcrypt.hash(passwordToken, 10);

        await sendResetEmail({
            email: user.email,
            token: passwordToken,
            origin: ORIGIN,
        });

        const password_token_expiration_date = new Date(Date.now() + ms("10m")); //debe hacerse con orario mundial
        const queryUpdate = `
        UPDATE admin SET password_token = $1,
        password_token_expiration_date = $2
        WHERE email = $3
        `;

        const valuesUpdate = [
            passwordTokenHash,
            password_token_expiration_date,
            user.email,
        ];
        await pool.query(queryUpdate, valuesUpdate);

        // await user.save();

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

        const query = `
            SELECT * FROM admin 
            WHERE email = $1;
        `;
        const values = [validacion.data.email];
        const response = await pool.query(query, values);
        const user = response.rows[0];

        if (!user) {
            throw new CustomErrors.UnauthenticatedError("invalid credentials");
        }

        const match = await bcrypt.compare(
            user.password_token,
            validacion.data.token
        );

        if (!match) {
            throw new CustomErrors.BadRequestError(
                "Please provide valid values"
            );
        }
        const currentDate = new Date();

        if (user.password_token_expiration_date < currentDate) {
            throw new CustomErrors.BadRequestError("token expired");
        }

        const passHashed = await bcrypt.hash(validacion.data.password, 10);
        const queryUpdate = `
            UPDATE admin SET password = $1,
            password_token = $2,
            password_token_expiration_date = $3
            WHERE email = $4
        `;
        const valuesUpdate = [passHashed, null, null, validacion.data.email];
        await pool.query(queryUpdate, valuesUpdate);

        res.status(StatusCodes.OK).json({
            msg: "reset password",
        });
    }

    async cambiarPassword(req, res) {
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

        const query = `
            SELECT * FROM admin 
            WHERE id = $1;
        `;
        const values = [req.id];
        const response = await pool.query(query, values);
        const user = response.rows[0];

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

        const queryUpdate = `
            UPDATE admin SET password = $1
            WHERE id = $2
        `;
        const valuesUpdate = [newPassword, user.id];
        await pool.query(queryUpdate, valuesUpdate);

        res.status(StatusCodes.OK).json({
            msg: "password change",
        });
    }
}
