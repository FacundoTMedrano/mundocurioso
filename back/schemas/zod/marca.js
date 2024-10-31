import z from "zod";

export const marcaSchema = z.object({
    marca: z.string().min(1),
    socketId: z.string().min(1),
    img: z.string().min(1),
});

export function validateMarca(input) {
    return marcaSchema.safeParse(input);
}
