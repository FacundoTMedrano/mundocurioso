import express from "express";
const router = express.Router();
import { verifyJWT } from "../middlewares/verifyJWT.js";
import CuriusidadesController from "../controllers/curiosidades.js";

import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: function (req, file, cb) {
        const filetypes = new RegExp(/\.(jpeg|jpg|png|svg|webp|gif)$/i);
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Tipo de archivo no permitido"));
    },
});

const curiosidades = new CuriusidadesController();

router.post("/crear", verifyJWT, upload.single("imagen"), curiosidades.crear);

export default router;
