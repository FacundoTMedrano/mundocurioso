import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
import pool from "../config/db.js";
import z from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import sharp from "sharp";

export default class CategoriasPortada {
    async cambiarCategoriaImg(req, res) {
        if (!req.params.id || !req.file) {
            throw new CustomErrors.NotFoundError("datos no provistos");
        }
        const validate = z.number().safeParse(Number(req.params.id));
        if (!validate.success) {
            throw new CustomErrors.BadRequestError("datos erroneos");
        }

        const categoria = await pool
            .query(
                `
                SELECT * FROM categorias
                WHERE id = $1
            `,
                [validate.data]
            )
            .then((data) => data.rows[0]);

        if (!categoria) {
            throw new CustomErrors.BadRequestError("categoria no encontrada");
        }
        const nombre = `${categoria.nombre.replace(" ", "-")}.webp`;
        await Promise.all([
            fs.unlink(`imgs/categorias/medium/${nombre}`),
            fs.unlink(`imgs/categorias/small/${nombre}`),
        ]);

        const file = req.file;
        await fs.writeFile(
            `imgs/categorias/medium/${categoria.nombre}`,
            file.buffer
        );
        const metadata = await sharp(file.buffer).metadata();
        const mitadancho = Math.floor(metadata.width / 2);
        const mitadAlto = Math.floor(metadata.height / 2);
        await sharp(file.buffer)
            .resize(mitadancho, mitadAlto)
            .toFile(`imgs/categorias/small/${categoria.nombre}`);
    }
}
