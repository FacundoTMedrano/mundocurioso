import { useParams } from "react-router-dom";
export default function EditarCuriosidad() {
    const { id } = useParams();
    console.log(id);
    return <div>EditarCuriosidad</div>;
}
