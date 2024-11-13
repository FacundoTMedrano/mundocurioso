import sharp from "sharp";
import { nanoid } from "nanoid";
import path from "node:path";

export default async function saveImg(file) {
    const nombreNuevo = `${nanoid(10)}${path.extname(file.originalname)}`;

    await sharp(file.buffer)
        .resize({ width: 800 })
        .toFile(`imgs/curiosidades/big/${nombreNuevo}`);

    await sharp(file.buffer)
        .resize({ width: 640 })
        .toFile(`imgs/curiosidades/medium/${nombreNuevo}`);
    return nombreNuevo;
}
