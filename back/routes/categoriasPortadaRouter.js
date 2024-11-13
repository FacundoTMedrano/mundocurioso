import express from "express";
const router = express.Router();
import { verifyJWT } from "../middlewares/verifyJWT.js";
import CategoriasPortada from "../controllers/categoriasPortada.js";

import path from "node:path";

import multer from "multer";

const categoriasPortadaObj = new CategoriasPortada();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 2 },
    fileFilter: function (req, file, cb) {
        const permitidoExtname = [".webp"];
        const permitidoMimeType = ["image/webp"];

        const mimetype = permitidoMimeType.find((v) => v === file.mimetype);
        const extname = permitidoExtname.find(
            (v) => v === path.extname(file.originalname)
        );

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Tipo de archivo no permitido"));
    },
});

router.put(
    "/cambiar-imagenes-marcas",
    verifyJWT,
    upload.array("imagenes"),
    categoriasPortadaObj.cambiarCategoriaImg
);
router.put(
    "/cambiar-portada",
    verifyJWT,
    upload.single("imagen"),
    categoriasPortadaObj.cambiarPortada
);
// router.delete("/:id", verifyJWT, curiosidades.delete);

export default router;
