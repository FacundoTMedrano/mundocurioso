import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
import pool from "../config/db.js";
import z from "zod";
import saveImg from "../utils/saveImg.js";
import fs from "node:fs/promises";
import { nanoid } from "nanoid";
import borrarImagenes from "../utils/borrarImagenes.js";
import slugify from "slugify";

export default class CuriusidadesController {
    async curiosidadPorId(req, res) {
        const validate = z.string().uuid().safeParse(req.params.id);
        if (!validate.success) {
            throw new CustomErrors.BadRequestError(
                "error en los datos enviados"
            );
        }

        const curiosidad = await pool
            .query(
                `
                select
                    c.*,
                    array_agg(cat.nombre) as categorias
                from
                    curiosidades c
                join curiosidad_categoria cc on
                    cc.curiosidad_id = c.id
                join categorias cat on
                    cc.categoria_id = cat.id
                    where c.id = $1
                group by
                    c.id;
            `,
                [validate.data]
            )
            .then((data) => data.rows[0]);

        if (curiosidad) {
            const html = await fs.readFile(
                `curiosidades-html/${curiosidad.articulohtml}`,
                "utf-8"
            );
            curiosidad.articulohtml = html;
            curiosidad.categorias = curiosidad.categorias.reduce((ac, v) => {
                ac[v] = true;
                return ac;
            }, {});
            console.log(curiosidad.categoriasObj);
        } else {
            throw new CustomErrors.NotFoundError("no se encontro el slug");
        }

        return res.status(StatusCodes.OK).json(curiosidad);
    }

    async curiosidad(req, res) {
        const validate = z.string().min(1).safeParse(req.params.curiosidad);
        if (!validate.success) {
            throw new CustomErrors.BadRequestError("error en los datos");
        }

        const curiosidad = await pool
            .query(
                `
                SELECT * FROM curiosidades
                WHERE slug = $1;
            `,
                [validate.data]
            )
            .then((data) => data.rows[0]);

        if (curiosidad) {
            const html = await fs.readFile(
                `curiosidades-html/${curiosidad.articulohtml}`,
                "utf-8"
            );
            curiosidad.articulohtml = html;
        } else {
            throw new CustomErrors.NotFoundError("no se encontro el slug");
        }

        return res.status(StatusCodes.OK).json(curiosidad);
    }

    async verTodo(req, res) {
        const page = Number(req.query.page);
        const page_size = Number(req.query.page_size);

        const validate = z
            .object({
                page: z.number(),
                page_size: z.number(),
            })
            .safeParse({
                page,
                page_size,
            });

        if (!validate.success) {
            throw new CustomErrors.BadRequestError("pagina no enviado");
        }

        const limit = page_size;
        const offset = (page - 1) * limit;

        const cantidad = await pool
            .query(
                `
                SELECT COUNT(*)
                from curiosidades
            `
            )
            .then((data) => Number(data.rows[0].count));

        if (cantidad === 0) {
            return res.status(StatusCodes.OK).json({
                curiosidades: [],
                page,
                page_size,
                totalPage: cantidad,
            });
        }

        const curiosidades = await pool
            .query(
                `
                SELECT * FROM curiosidades 
                ORDER BY fecha_de_creacion DESC
                LIMIT $1 OFFSET $2
            `,
                [limit, offset]
            )
            .then((data) => data.rows);

        return res.status(StatusCodes.OK).json({
            curiosidades,
            page,
            page_size,
            totalPage: cantidad,
        });
    }

    async porCategoria(req, res) {
        const page = Number(req.query.page);
        const page_size = Number(req.query.page_size);

        const validate = z
            .object({
                categoria: z.string().min(1),
                page: z.number(),
                page_size: z.number(),
            })
            .safeParse({
                categoria: req.query.categoria,
                page,
                page_size,
            });

        if (!validate.success) {
            throw new CustomErrors.BadRequestError("Datos no enviados");
        }

        const cantidad = await pool
            .query(
                `
                select count(*) 
                from categorias cat 
                join curiosidad_categoria cc on cc.categoria_id = cat.id 
                join curiosidades c on cc.curiosidad_id = c.id 
                where cat.nombre = $1;
            `,
                [validate.data.categoria]
            )
            .then((data) => Number(data.rows[0].count));

        if (cantidad === 0) {
            return res.status(StatusCodes.OK).json({
                curiosidades: [],
                page,
                page_size,
                totalPage: cantidad,
            });
        }

        const limit = page_size;
        const offset = (page - 1) * limit;

        const curiosidades = await pool
            .query(
                `
                select c.*, cat.nombre 
                from categorias cat
                join curiosidad_categoria cc on cc.categoria_id = cat.id 
                join curiosidades c on cc.curiosidad_id = c.id
                where cat.nombre = $1
                ORDER BY c.fecha_de_creacion DESC
                LIMIT $2 OFFSET $3;
            `,
                [validate.data.categoria, limit, offset]
            )
            .then((data) => data.rows);

        return res.status(StatusCodes.OK).json({
            curiosidades,
            page,
            page_size,
            totalPage: cantidad,
        });
    }

    async porBusqueda(req, res) {
        const page = Number(req.query.page);
        const page_size = Number(req.query.page_size);

        const validate = z
            .object({
                search: z.string(),
                page: z.number(),
                page_size: z.number(),
            })
            .safeParse({
                search: req.query.search,
                page,
                page_size,
            });

        if (!validate.success) {
            throw new CustomErrors.BadRequestError("Datos incorrectos");
        }

        const limit = validate.data.page_size;
        const offset = (page - 1) * limit;

        const cantidad = await pool
            .query(
                `
                SELECT count(c.id) 
                FROM curiosidades c
                WHERE 
                    to_tsvector(
                        c.titulo || ' ' ||
                        c.subtitulo || ' ' || 
                        COALESCE((
                            SELECT string_agg(cat.nombre, ' ')
                            FROM categorias cat
                            JOIN curiosidad_categoria cc ON cc.categoria_id = cat.id
                            WHERE cc.curiosidad_id = c.id
                        ), '')
                        ) @@ websearch_to_tsquery( $1 )
                `,
                [req.query.search]
            )
            .then((data) => Number(data.rows[0].count));

        if (cantidad === 0) {
            return res.status(StatusCodes.OK).json({
                curiosidades: [],
                page,
                page_size,
                totalPage: cantidad,
            });
        }

        //existe una mejor manera creando primero la tabla con una subconsulta y de ahi buscandola
        //es decir select * from (select * from .... es decir la tabla con todos los join)
        const curiosidades = await pool
            .query(
                `
                SELECT c.*
                FROM curiosidades c
                WHERE 
                    to_tsvector(
                        c.titulo || ' ' ||
                        c.subtitulo || ' ' || 
                        COALESCE((
                            SELECT string_agg(cat.nombre, ' ')
                            FROM categorias cat
                            JOIN curiosidad_categoria cc ON cc.categoria_id = cat.id
                            WHERE cc.curiosidad_id = c.id
                        ), '')
                    ) @@ websearch_to_tsquery( $1 )
                ORDER BY
                    ts_rank(setweight(to_tsvector(c.titulo),'A') ||
                    setweight(to_tsvector(c.subtitulo), 'B') ||
                    setweight(to_tsvector(
                            COALESCE((
                            SELECT string_agg(cat.nombre, ' ')
                            FROM categorias cat
                            JOIN curiosidad_categoria cc ON cc.categoria_id = cat.id
                            WHERE cc.curiosidad_id = c.id
                        ), '')
                    ),'C')
                    ,websearch_to_tsquery( $1 )) DESC
                LIMIT $2 OFFSET $3
            `,
                [req.query.search, limit, offset]
            )
            .then((data) => data.rows);

        return res.status(StatusCodes.OK).json({
            curiosidades,
            page,
            page_size,
            totalPage: cantidad,
        });
    }

    async crear(req, res) {
        const curiosidad = z
            .object({
                titulo: z.string().min(1),
                subtitulo: z.string().min(1),
                categorias: z.array(z.string()).min(1),
                curiosidad: z.string().min(1),
                imagen: z.instanceof(File),
            })
            .safeParse({
                ...JSON.parse(req.body.datos || "{}"),
                imagen: req.file,
            });

        if (!curiosidad.success) {
            throw new CustomErrors.BadRequestError("datos no correspondientes");
        }

        const slug = slugify(curiosidad.data.titulo, {
            replacement: "-",
            remove: /[^A-Za-z0-9\s-]/g,
            lower: true,
            strict: true,
        });

        const isExist = await pool
            .query(
                `
                SELECT * FROM curiosidades
                WHERE titulo = $1 OR slug = $2;
            `,
                [curiosidad.data.titulo, slug]
            )
            .then((data) => data.rows[0]);

        if (isExist) {
            throw new CustomErrors.ConflictError("titulo/slug ya utilizado");
        }

        const nombreImagenMuestra = await saveImg(req.file);
        const nombreHTML = `${nanoid()}.html`;
        await fs.writeFile(
            `curiosidades-html/${nombreHTML}`,
            curiosidad.data.curiosidad
        );

        const curiosidad_id = await pool
            .query(
                `
            INSERT INTO curiosidades (titulo, subtitulo, imagen, articulohtml,slug)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `,
                [
                    curiosidad.data.titulo,
                    curiosidad.data.subtitulo,
                    nombreImagenMuestra,
                    nombreHTML,
                    slug,
                ]
            )
            .then((data) => data.rows[0].id);

        for (let i = 0; i < curiosidad.data.categorias.length; i++) {
            const categoriaNombre = curiosidad.data.categorias[i];

            const categoria_id = await pool
                .query(
                    `
                SELECT * FROM categorias
                WHERE nombre = $1;
            `,
                    [categoriaNombre]
                )
                .then((data) => data.rows[0]?.id);

            if (!categoria_id) {
                throw new Error("no se encontro la categoria");
            }

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
        const validate = z.string().uuid().safeParse(req.params.id);
        if (!validate.success) {
            throw new CustomErrors.BadRequestError("dato no correspondiente");
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
            throw new CustomErrors.BadRequestError(
                "no se pudo borrar chekee el id"
            );
        }

        return res.status(StatusCodes.NO_CONTENT).send();
    }

    async update(req, res) {
        const validate = z
            .object({
                titulo: z.string().min(1),
                subtitulo: z.string().min(1),
                categorias: z.array(z.string()).min(1),
                curiosidad: z.string().min(1),
                id: z.string().uuid(),
            })
            .safeParse({
                ...JSON.parse(req.body.datos || "{}"),
                id: req.params.id,
            });

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

        const slug = slugify(validate.data.titulo, {
            replacement: "-",
            remove: /[^A-Za-z0-9\s-]/g,
            lower: true,
            strict: true,
        });

        if (validate.data.titulo !== curiosidad.titulo) {
            //slug actualizado

            const isExist = await pool
                .query(
                    `
                SELECT * FROM curiosidades
                WHERE titulo = $1 OR slug = $2;
            `,
                    [validate.data.titulo, slug]
                )
                .then((data) => data.rows[0]);

            if (isExist) {
                throw new CustomErrors.ConflictError(
                    "titulo/slug ya utilizado"
                );
            }
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
                SET titulo = $1, subtitulo = $2, imagen = $3, articulohtml = $4, slug = $5
                WHERE id = $6;
            `,
            [
                validate.data.titulo,
                validate.data.subtitulo,
                imagen,
                nombreHTML,
                slug,
                req.params.id,
            ]
        );

        // actualizar categorias

        const categorias = await pool
            .query("SELECT * FROM categorias")
            .then((data) => data.rows);

        //borro todo lo anterior (son pocos datos y es mas facil de entender asi)
        await pool.query(
            `
                DELETE FROM curiosidad_categoria cc
                WHERE curiosidad_id = $1
            `,
            [req.params.id]
        );

        const agregar = categorias.filter((v) =>
            validate.data.categorias.includes(v.nombre)
        );

        const queryText = `
        INSERT INTO curiosidad_categoria (curiosidad_id, categoria_id)
        VALUES ${agregar
            .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
            .join(", ")}
        `;

        const valores = agregar.map((v) => [req.params.id, v.id]).flat();

        await pool.query(queryText, valores);

        return res.status(StatusCodes.OK).json({ message: "success" });
    }
}
