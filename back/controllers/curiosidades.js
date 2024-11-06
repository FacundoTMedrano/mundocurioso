import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
import pool from "../config/db.js";
import z from "zod";
import saveImg from "../utils/saveImg.js";
import fs from "node:fs/promises";
import { nanoid } from "nanoid";
import borrarImagenes from "../utils/borrarImagenes.js";

export default class CuriusidadesController {
    async verTodo(req, res) {
        if (!req.params.page) {
            throw new CustomErrors.BadRequestError(
                "numero de pagina no enviado"
            );
        }

        const page = Number(req.params.page);
        const validate = z.number().safeParse(page);
        if (!validate.success) {
            throw new CustomErrors.BadRequestError("pagina no enviado");
        }

        const limit = 10;
        const offset = (page - 1) * limit;

        const curiosidades = await pool.query(
            `
                SELECT * FROM curiosidades 
                ORDER BY fecha_de_creacion DESC
                LIMIT $1 OFFSET $2
            `,
            [limit, offset]
        );
        return res.status(StatusCodes.OK).json(curiosidades.rows);
    }

    async porCategoria(req, res) {
        if (!req.query.categoria || !req.query.page) {
            throw new CustomErrors.BadRequestError("falta categoria y pagina");
        }

        const page = Number(req.query.page);
        const validate = z
            .object({
                categoria: z.string().min(1).max(20),
                page: z.number(),
            })
            .safeParse({
                categoria: req.query.categoria,
                page,
            });

        if (!validate.success) {
            throw new CustomErrors.BadRequestError("Datos no enviados");
        }

        const limit = 10;
        const offset = (page - 1) * limit;

        const curiosidades = await pool.query(
            `
                SELECT c.*
                FROM curiosidad_categoria cc
                JOIN categorias cat ON cat.id = cc.categoria_id
                JOIN curiosidades c ON c.id = cc.curiosidad_id
                WHERE cat.nombre = $1
                ORDER BY c.fecha_de_creacion DESC
                LIMIT $2 OFFSET $3;
            `,
            [validate.data.categoria, limit, offset]
        );
        return res.status(StatusCodes.OK).json(curiosidades.rows);
    }

    async porBusqueda(req, res) {
        if (!req.query.search || !req.query.page) {
            throw new CustomErrors.BadRequestError("Datos no enviados");
        }

        const page = Number(req.query.page);
        const validate = z
            .object({
                search: z.string().min(1).max(20),
                page: z.number(),
            })
            .safeParse({
                search: req.query.search,
                page,
            });

        if (!validate.success) {
            throw new CustomErrors.BadRequestError("Datos incorrectos");
        }

        const limit = 10;
        const offset = (page - 1) * limit;

        // tuve que crear index en las columnas titulo, subtitulo, nombre(categoria) e instalar
        // pg_trgm poniendole una similiridad de pg_trgm.similarity_threshold = 0.1;
        const curiosidades = await pool.query(
            `
                SELECT
                c.*,
                cat.nombre
                FROM
                curiosidades c
                JOIN curiosidad_categoria cc ON cc.curiosidad_id = c.id
                JOIN categorias cat ON cat.id = cc.categoria_id
                WHERE
                c.titulo % $1
                OR c.subtitulo % $1
                OR cat.nombre % $1
                ORDER BY
                GREATEST(
                    similarity(c.titulo, $1),
                    similarity(c.subtitulo, $1),
                    similarity(cat.nombre, $1)
                  ) DESC
                LIMIT $2 
                OFFSET $3;
            `,
            [req.query.search, limit, offset]
        );

        return res.status(StatusCodes.OK).json(curiosidades.rows);
    }

    async crear(req, res) {
        if (!req.body.datos || !req.file) {
            throw new CustomErrors.BadRequestError("datos no recibidos");
        }
        const datos = JSON.parse(req.body.datos);
        const curiosidad = z
            .object({
                titulo: z.string().min(1),
                subtitulo: z.string().min(1),
                categorias: z.array(z.string()).min(1),
                curiosidad: z.string().min(1),
            })
            .safeParse(datos);

        if (!curiosidad.success) {
            throw new CustomErrors.BadRequestError("datos no correspondientes");
        }
        console.log(datos);
        const nombreImagenMuestra = await saveImg(req.file);
        const nombreHTML = `${nanoid()}.html`;
        await fs.writeFile(
            `curiosidades-html/${nombreHTML}`,
            curiosidad.data.curiosidad
        );

        const respuesta = await pool.query(
            `
            INSERT INTO curiosidades (titulo, subtitulo, imagen, articulohtml)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `,
            [
                curiosidad.data.titulo,
                curiosidad.data.subtitulo,
                nombreImagenMuestra,
                nombreHTML,
            ]
        );

        const curiosidad_id = respuesta.rows[0].id;

        for (let i = 0; i < curiosidad.data.categorias.length; i++) {
            const categoriaNombre = curiosidad.data.categorias[i];

            const response = await pool.query(
                `
                SELECT * FROM categorias
                WHERE nombre = $1;
            `,
                [categoriaNombre]
            );

            if (!response.rows[0]) {
                throw new Error("no se encontro la categoria");
            }

            const categoria_id = response.rows[0].id;

            await pool.query(
                `
                INSERT INTO curiosidad_categoria (curiosidad_id, categoria_id)
                VALUES ($1, $2);
            `,
                [curiosidad_id, categoria_id]
            );
        }
        return res.status(StatusCodes.OK).json({ message: "success" });
    }

    async delete(req, res) {
        if (!req.params.id) {
            throw new CustomErrors.NotFoundError("not found moto id");
        }

        const validate = z.string().min(1).safeParse(req.params.id);
        if (!validate.success) {
            throw new CustomErrors.BadRequestError("dato no correspondiente");
        }
        const response = await pool.query(
            `
                SELECT * FROM curiosidades
                WHERE id = $1;
            `,
            [req.params.id]
        );

        const curiosidad = response.rows[0];
        if (!curiosidad) {
            throw new CustomErrors.NotFoundError("not found moto id");
        }

        //borrada de imagenes y archivo
        await Promise.all([
            borrarImagenes(curiosidad.imagen),
            fs.unlink(`curiosidades-html/${curiosidad.articulohtml}`),
        ]);

        const borrado = await pool.query(
            `DELETE FROM curiosidades WHERE id = $1`,
            [req.params.id]
        );

        if (borrado.rowCount === 0) {
            throw new Error("no se pudo borrar");
        }

        return res.status(StatusCodes.NO_CONTENT).send();
    }

    async update(req, res) {
        if (!req.params.id || !req.body.datos) {
            throw new CustomErrors.NotFoundError("valores no enviados");
        }

        const datos = JSON.parse(req.body.datos);
        const validate = z
            .object({
                titulo: z.string().min(1),
                subtitulo: z.string().min(1),
                categorias: z.array(z.string()).min(1),
                curiosidad: z.string().min(1),
            })
            .safeParse(datos);

        if (!validate.success) {
            throw new CustomErrors.BadRequestError("datos no correspondientes");
        }

        const curiosidad = await pool
            .query(
                `
            SELECT * FROM curiosidades
            WHERE id = $1;
        `,
                [req.params.id]
            )
            .then((data) => data.rows[0]);

        if (!curiosidad) {
            throw new CustomErrors.NotFoundError("not found id");
        }

        let imagen = curiosidad.imagen;
        //borrado de lo anterior
        if (req.file) {
            await borrarImagenes(curiosidad.imagen);
            imagen = await saveImg(req.file);
        }

        //borro articulo anterior y creo nuevo
        await fs.unlink(`curiosidades-html/${curiosidad.articulohtml}`);
        const nombreHTML = `${nanoid()}.html`;
        await fs.writeFile(
            `curiosidades-html/${nombreHTML}`,
            validate.data.curiosidad
        );

        //actualizo
        await pool.query(
            `
                UPDATE curiosidades 
                SET titulo = $1, subtitulo = $2, imagen = $3, articulohtml = $4 
                WHERE id = $5;
            `,
            [
                validate.data.titulo,
                validate.data.subtitulo,
                imagen,
                nombreHTML,
                req.params.id,
            ]
        );

        // actualizar categorias
        const categegoriasDb = await pool.query(
            `
                SELECT cc.categoria_id, c.nombre
                FROM curiosidad_categoria cc
                JOIN categorias c ON cc.categoria_id = c.id
                WHERE cc.curiosidad_id = $1;
            `,
            [req.params.id]
        );
        const listaSoloNombres = categegoriasDb.rows.map((v) => {
            return v.nombre;
        });

        const cargar = validate.data.categorias.filter(
            (v) => !listaSoloNombres.includes(v)
        );

        const eliminar = listaSoloNombres.filter(
            (v) => !validate.data.categorias.includes(v)
        );

        if (cargar.length > 0) {
            for (let i = 0; i < cargar.length; i++) {
                const categoria = await pool
                    .query(
                        `
                        SELECT * FROM categorias
                        WHERE nombre = $1;
                    `,
                        [cargar[i]]
                    )
                    .then((data) => data.rows[0]);

                if (!categoria) {
                    throw new Error("no se encontro la categoria");
                }

                await pool.query(
                    `
                        INSERT INTO curiosidad_categoria (curiosidad_id, categoria_id)
                        VALUES ($1, $2);

                    `,
                    [curiosidad.id, categoria.id]
                );
            }
        }

        if (eliminar.length > 0) {
            for (let i = 0; i < eliminar.length; i++) {
                const categoria = categegoriasDb.rows.find(
                    (v) => v.nombre === eliminar[i]
                );

                const borrado = await pool.query(
                    `
                    DELETE FROM curiosidad_categoria 
                    WHERE curiosidad_id = $1 AND categoria_id = $2;
                `,
                    [curiosidad.id, categoria.categoria_id]
                );

                if (borrado.rowCount === 0) {
                    throw new Error("no se pudo borrar");
                }
            }
        }

        res.status(StatusCodes.OK).json({ message: "success" });
    }
}
