import { sendEmail } from "./sendEmail.js";

export async function sendVerificationEmail({
    origin,
    name,
    email,
    verificationToken,
}) {
    //se debe crear la ruta en el front para envial al back el token
    const verifyEmail = `${origin}/verificacion_email?token=${verificationToken}&email=${email}`;

    const message = `<p>Please confirm your email by clicking on the following link : 
    <a href="${verifyEmail}">Verify Email</a> </p>`;

    return sendEmail({
        to: email,
        subject: "email confirmation",
        html: `<h4> Hello, ${name}</h4> ${message}`,
    });
}
