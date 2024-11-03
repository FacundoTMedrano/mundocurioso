import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
import pool from "../config/db.js";
import z from "zod";
import saveImg from "../utils/saveImg.js";
import fs from "node:fs/promises";
import { nanoid } from "nanoid";

export default class CuriusidadesController {
    async crear(req, res) {
        const curiosidad = z
            .object({
                titulo: z.string().min(1),
                subtitulo: z.string().min(1),
                categorias: z.array(z.string()).min(1),
            })
            .safeParse(req.body);

        if (!curiosidad.success || !req.file || !req.body.curiosidad) {
            throw new CustomErrors.BadRequestError(
                "bad data moto en la recibida"
            );
        }
        const nombreImagenMuestra = await saveImg(req.file);
        const documentoHTML = JSON.stringify(req.body.curiosidad);
        const nombreHTML = `${nanoid()}.html`;
        await fs.writeFile(`curiosidades-html/${nombreHTML}`, documentoHTML);

        const query = `
            INSERT INTO curiosidades (titulo, subtitulo, imagen, articulohtml)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        const values = [
            curiosidad.data.titulo,
            curiosidad.data.subtitulo,
            nombreImagenMuestra,
            nombreHTML,
        ];
        const respuesta = await pool.query(query, values);
        const curiosidad_id = respuesta.rows[0].id;

        for (let i = 0; i < curiosidad.data.categorias; i++) {
            const categoriaNombre = curiosidad.data.categorias[i];
            const queryCategoria = `
                SELECT * FROM categorias
                WHERE nombre = $1;
            `;

            const valuesCategoria = [categoriaNombre];
            const response = await pool.query(queryCategoria, valuesCategoria);
            const categoria_id = response.rows[0].id;

            const query = `
                INSERT INTO curiosidad_categoria (curiosidad_id, categoria_id)
                VALUES ($1, $2)
            `;
            const values = [curiosidad_id, categoria_id];
            await pool.query(query, values);
        }
        return res.status(StatusCodes.OK).json({ message: "success" });
    }
}
