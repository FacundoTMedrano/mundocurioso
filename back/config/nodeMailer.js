import { EMAIL, EMAILPASSWORD } from "./process.js";
import dotenv from "dotenv";
dotenv.config();
export default {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: EMAIL,
        pass: EMAILPASSWORD,
    },
};
