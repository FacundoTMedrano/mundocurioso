import { useParams } from "react-router-dom";
import categorias from "../constants/categorias";

export default function AdminCategoria() {
    const categoria = useParams().categoria.replaceAll("-", " ");
    console.log(categoria);

    const existe = categorias.includes(categoria);

    return (
        <div>
            {existe ? <h1>{categoria}</h1> : <h1>Categoria no encontrada</h1>}
        </div>
    );
}