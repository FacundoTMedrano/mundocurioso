import nodeMailerConfig from "../config/nodeMailer.js";
import nodemailer from "nodemailer";

export function sendEmail({ to, html, subject }) {
    const transporter = nodemailer.createTransport(nodeMailerConfig);

    return transporter.sendMail({
        from: "pagina de motos",
        to,
        html,
        subject,
    });
}
