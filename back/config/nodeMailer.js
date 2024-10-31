
// los datos de la cuenta se generan automaticamente en https://ethereal.email/create, son cuentas random
import dotenv from "dotenv";
dotenv.config();
export default {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        // eslint-disable-next-line no-undef
        user: process.env.EMAIL,
        // eslint-disable-next-line no-undef
        pass: process.env.EMAILPASSWORD,
    },
};
