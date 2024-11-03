import { Contexto } from "../context/ContextoBase";
import { useContext } from "react";

export default function useContexto() {
    return useContext(Contexto);
}
