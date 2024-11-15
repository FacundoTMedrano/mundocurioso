import { sendEmail } from "./sendEmail.js";

export async function sendResetEmail({ name, email, token, origin }) {
    const message = `<p>Please reset password by clicking on the following link : 
  <a href="${`${origin}/resetear-contraseña?token=${token}&email=${email}`}">Reset Password</a></p>`;

    return sendEmail({
        to: email,
        subject: "Reset Password",
        html: `<h4>Hello, ${name}</h4>${message}`,
    });
}
