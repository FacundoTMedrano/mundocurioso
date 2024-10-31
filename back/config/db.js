import pkg from "pg";
const { Pool } = pkg;

export default new Pool({
    host: "localhost",
    database: "mi_basedatos",
    user: "mi_usuario",
    password: "mi_contraseña",
    port: 5432,
});
