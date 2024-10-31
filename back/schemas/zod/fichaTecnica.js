import { z } from "zod";

const mecanicaSchema = z.object({
    Motor: z.string(),
    Cilindrada: z.string().min(1),
    "Potencia máxima": z.string(),
    "Velocidad máxima": z.string(),
    Alimentación: z.string(),
    Encendido: z.string(),
    Arranque: z.string(),
    Transmisión: z.string(),
    Tracción: z.string(),
});

const configuracionSchema = z.object({
    "Faro Delantero": z.string(),
    Llantas: z.string(),
    "Frenos D / T": z.string(),
    "Neumático Delantero": z.string(),
    "Neumático Trasero": z.string(),
    "Suspensión Delantera": z.string(),
    "Suspensión Trasera": z.string(),
    "Largo / Ancho / Alto": z.string(),
    "Distancia entre Ejes": z.string(),
    Peso: z.string(),
    "Capacidad de Carga": z.string(),
    "Capacidad del Tanque": z.string(),
    "Consumo y Autonomía": z.string(),
    "Puerto USB": z.string(),
    "Altura del Asiento": z.string(),
    Equipamiento: z.array(z.string()),
    "Tipo de Batería": z.string(),
    "Cantidad de Baterías": z.string(),
    "Tiempo de Carga": z.string(),
});

export default function fichaMecanConfigValidate(input) {
    return z
        .object({
            mecanica: mecanicaSchema.partial(),
            configuracion: configuracionSchema.partial(),
        })
        .safeParse(input);
}
