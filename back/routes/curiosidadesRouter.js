import express from "express";
const router = express.Router();
import { verifyJWT } from "../middlewares/verifyJWT.js";
import CuriusidadesController from "../controllers/curiosidades.js";
import path from "node:path";

import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: function (req, file, cb) {
        const permitidoExtname = [
            ".jpeg",
            ".jpg",
            ".png",
            ".svg",
            ".webp",
            ".gif",
        ];

        const permitidoMimeType = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/svg+xml",
            "image/webp",
            "image/gif",
        ];

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

const curiosidades = new CuriusidadesController();

router.get("/vertodo", curiosidades.verTodo);
router.get("/curiosidad/:curiosidad", curiosidades.curiosidad);
router.get("/curiosidad/por-id/:id", curiosidades.curiosidadPorId);
router.get("/categoria", curiosidades.porCategoria);
router.get("/search", curiosidades.porBusqueda);

router.post("/crear", verifyJWT, upload.single("imagen"), curiosidades.crear);
router.put("/:id", verifyJWT, upload.single("imagen"), curiosidades.update);
router.delete("/:id", verifyJWT, curiosidades.delete);

export default router;
