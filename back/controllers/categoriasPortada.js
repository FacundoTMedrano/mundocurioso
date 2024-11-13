import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
import z from "zod";
import sharp from "sharp";
import isExistImage from "../utils/isExistImage.js";

export default class CategoriasPortada {
    async cambiarCategoriaImg(req, res) {
        console.log(req.files, req.body.nombres);
        if (!req.body.nombres || !req.files) {
            throw new CustomErrors.NotFoundError("datos no provistos");
        }
        const validate = z.array(z.string()).safeParse([...req.body.nombres]);
        if (!validate.success) {
            throw new CustomErrors.BadRequestError("datos erroneos");
        }
        const nombres = req.body.nombres;
        for (let i = 0; i < nombres.length; i++) {
            const nombre = nombres[i].replaceAll(" ", "-");
            const isExist = await isExistImage(
                `imgs/categorias/medium/${nombre}.webp`
            );
            if (!isExist) {
                throw new CustomErrors.BadRequestError("error en la direccion");
            }
        }

        for (let i = 0; i < nombres.length; i++) {
            const nombre = nombres[i].replaceAll(" ", "-");
            const file = req.files[i];
            await sharp(file.buffer)
                .resize({ width: 640 })
                .toFile(`imgs/categorias/medium/${nombre}.webp`);
            await sharp(file.buffer)
                .resize({ width: 400 })
                .toFile(`imgs/categorias/small/${nombre}.webp`);
        }

        return res.status(StatusCodes.NO_CONTENT).send();
    }

    async cambiarPortada(req, res) {
        if (!req.file) {
            throw new CustomErrors.NotFoundError("imagen no provista");
        }

        await sharp(req.file.buffer)
            .resize({ width: 1800 })
            .toFile(`imgs/portada.webp`);

        return res.status(StatusCodes.NO_CONTENT).send();
    }
}
