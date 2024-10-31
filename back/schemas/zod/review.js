import z from "zod";

export function validateReview(input) {
    return z
        .object({
            motor: z.number(),
            velocidadMaxima: z.number(),
            armadoYTerminaciones: z.number(),
            equipamientoEInstrumental: z.number(),
            bateriasYRecarga: z.number(),
            consumoYAutonimia: z.number(),
            neumaticos: z.number(),
            frenos: z.number(),
            luces: z.number(),
            costoDeMantenimiento: z.number(),
            moto: z.string(),
            opinionPositiva: z.string(),
            opinionNegativa: z.string().optional(),
            user: z.string(),
            state: z.string(),
            marca: z.string(),
        })
        .safeParse(input);
}
