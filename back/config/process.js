/* eslint-disable no-undef */
import dotenv from "dotenv";
dotenv.config();

export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const ORIGIN = process.env.ORIGIN;
export const EMAIL = process.env.EMAIL;
export const EMAILPASSWORD = process.env.EMAILPASSWORD;
export const PORT = process.env.PORT;