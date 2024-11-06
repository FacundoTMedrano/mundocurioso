export default function aceptedCategories(obj) {
    return Object.entries(obj).reduce((ac, [key, val]) => {
        if (val) {
            ac.push(key);
        }
        return ac;
    }, []);
}
