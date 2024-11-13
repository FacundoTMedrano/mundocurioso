import { useRef, useState } from "react";
import { base } from "../constants/base";
import { useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

function validarImagen(file) {
    const validTypes = ["image/webp"];
    const isValidType = validTypes.includes(file?.type);
    if (!isValidType) {
        return "Tipo de dato incorrecto";
    }
    const isValidSize = file.size <= 2 * 1024 * 1024;
    if (!isValidSize) {
        return "Tamaño maximo por imagen excedido";
    }
    return null;
}

export default function CambiarPortada() {
    const axios = useAxiosPrivate();
    const inputRef = useRef(null);
    const [portada, setPortada] = useState(() => {
        return {
            file: null,
            url: `${base}/imgs/portada.webp`,
            err: "",
        };
    });

    const enviar = useMutation({
        mutationFn: async () => {
            const form = new FormData();

            form.append("imagen", portada.file);

            await axios.put("categorias-portada/cambiar-portada", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        },
        onError: (err) => {
            console.log(err.message);
        },
        onSuccess: () => {
            setPortada((prev) => {
                return { ...prev, file: null };
            });
        },
    });

    function cambiar(e) {
        const file = e.target.files[0];
        const err = validarImagen(file);
        if (err) {
            setPortada((prev) => {
                return { ...prev, err };
            });
            return;
        } else {
            const img = new Image();
            img.onload = () => {
                console.log(img);
                if (img.naturalWidth < 1600) {
                    setPortada((prev) => {
                        return { ...prev, err: "imagen poco ancha" };
                    });
                    return;
                }
                setPortada((prev) => {
                    return {
                        ...prev,
                        err: "",
                        file,
                        url: URL.createObjectURL(file),
                    };
                });
            };
            img.src = URL.createObjectURL(file);
        }
    }

    function cancelar() {
        setPortada({ file: null, url: `${base}/imgs/portada.webp`, err: "" });
    }

    console.log(portada, !portada.file || !portada.err);

    return (
        <main className="cambiar-portada">
            <h2>Cambiar Portada</h2>

            <div className="portada">
                <img src={portada.url} alt="portada" />
            </div>

            <input
                ref={inputRef}
                type="file"
                style={{ display: "none" }}
                onChange={cambiar}
            />
            <div className="botones-input">
                <button onClick={() => inputRef.current.click()}>
                    cambiar
                </button>
                <button
                    onClick={cancelar}
                    disabled={!portada.file && !portada.err}
                >
                    cancelar
                </button>
            </div>
            <div className="div-boton-enviar">
                <button onClick={enviar.mutate} disabled={!portada.file}>
                    aceptar cambios
                </button>
            </div>

            {portada.err && <p>Error: {portada.err}</p>}
        </main>
    );
}
