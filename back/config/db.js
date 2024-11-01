import pkg from "pg";
const { Pool } = pkg;
import { DB_NAME, DB_USER, DB_PASSWORD } from "./process.js";

export default new Pool({
    host: "localhost",
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    port: 5432,
});
