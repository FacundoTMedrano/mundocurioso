import sharp from "sharp";
import { nanoid } from "nanoid";
import fs from "node:fs/promises";
import path from "node:path";

export default async function saveImg(file) {
    const nombreNuevo = `${nanoid(10)}${path.extname(file.originalname)}`;
    await fs.writeFile(`imgs/curiosidades/big/${nombreNuevo}`, file.buffer);
    const metadata = await sharp(file.buffer).metadata();
    const mitadancho = Math.floor(metadata.width / 2);
    const mitadAlto = Math.floor(metadata.height / 2);
    await sharp(file.buffer)
        .resize(mitadancho, mitadAlto)
        .toFile(`imgs/curiosidades/medium/${nombreNuevo}`);
    return nombreNuevo;
}
