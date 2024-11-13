import fs from "node:fs/promises";

export default async function isExistImage(url) {
    try {
        await fs.access(url);
        return true;
    } catch (err) {
        console.log(err);
        return null;
    }
}
