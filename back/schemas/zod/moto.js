import { z } from "zod";

export function validateSafeUpdate(input) {
    return z
        .object({
            _id: z.string(),
            nombre: z.string(),
            imagen: z.string(),
            marca: z.string(),
            estilo: z.string().optional(),
            cilindrada: z.number().min(0).optional(),
        })
        .safeParse(input);
}

export function validateSafeCreate(input) {
    return z
        .object({
            nombre: z.string().min(1),
            marca: z.string().min(1),
            estilo: z.string().min(1).optional(),
            cilindrada: z.number().min(0).optional(),
        })
        .safeParse(input);
}
