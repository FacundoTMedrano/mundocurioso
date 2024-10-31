import z from "zod";

export function validateUpdate(input) {
    return z
        .object({
            name: z.string(),
            email: z.string().email(),
            oldPassword: z.string(),
            newPassword: z.string(),
        })
        .partial()
        .safeParse(input);
}

export function validateChangePassword(input) {
    return z
        .object({
            oldPassword: z.string(),
            newPassword: z.string().min(5).max(20),
            repetNewPassword: z.string(),
        })
        .safeParse(input);
}

export function validateResetPassword(input) {
    return z
        .object({
            email: z.string().email(),
            password: z.string(),
            token: z.string(),
        })
        .safeParse(input);
}

export function emailForgetPass(input) {
    return z
        .object({
            email: z.string().email(),
        })
        .safeParse(input);
}

export function validateLogin(input) {
    return z
        .object({
            email: z.string().email(),
            password: z.string(),
        })
        .safeParse(input);
}

export function validateCreate(input) {
    return z
        .object({
            name: z.string(),
            email: z.string().email(),
            password: z.string(),
        })
        .safeParse(input);
}

export function validateEmail(input) {
    return z
        .object({
            email: z.string().email(),
            verificationToken: z.string(),
        })
        .safeParse(input);
}
