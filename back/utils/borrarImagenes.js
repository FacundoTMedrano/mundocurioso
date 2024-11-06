import fs from "node:fs/promises";

export default function borrarImagenes(nombre) {
    return Promise.all([
        fs.unlink(`imgs/curiosidades/big/${nombre}`),
        fs.unlink(`imgs/curiosidades/medium/${nombre}`),
    ]);
}
