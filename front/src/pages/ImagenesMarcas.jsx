import categorias from "../constants/categorias";
import { base } from "../constants/base";
import { useState } from "react";
import AdminCambioImgMarca from "../components/AdminCambioImgMarca";
import { useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

export default function ImagenesMarcas() {
    const axios = useAxiosPrivate();
    const [imagenes, setImagenes] = useState(() => {
        return categorias.map((v) => {
            const nombre = v.replaceAll(" ", "-");
            const imgMedium = `${base}/imgs/categorias/medium/${nombre}.webp`;
            return {
                file: null,
                url: imgMedium,
                oldUrl: imgMedium,
                nombre: v,
                err: "",
            };
        });
    });

    function cancelarTodosLosCambios() {
        setImagenes((prev) => {
            return prev.map((v) => {
                return {
                    file: null,
                    url: v.oldUrl,
                    nombre: v.nombre,
                    err: "",
                };
            });
        });
    }

    const enviar = useMutation({
        mutationFn: async () => {
            const form = new FormData();

            imagenes.forEach((v) => {
                if (v.file) {
                    form.append("imagenes", v.file);
                    form.append("nombres", v.nombre);
                }
            });

            await axios.put(
                "categorias-portada/cambiar-imagenes-marcas",
                form,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
        },
        onError: (err) => {
            console.log(err.message);
        },
        onSuccess: () => {
            window.location.reload();
        },
    });

    const aceptarCambios = imagenes.some((v) => v.file);

    return (
        <div>
            <div className="grupo-de-categorias-home">
                <h2>Categorias</h2>
                <div className="contenedor-grid-admin">
                    {imagenes.map((v) => {
                        return (
                            <AdminCambioImgMarca
                                key={`${v.nombre}img`}
                                setImagenes={setImagenes}
                                file={v.file}
                                url={v.url}
                                nombre={v.nombre}
                                err={v.err}
                            />
                        );
                    })}
                </div>
            </div>
            <button
                onClick={() => {
                    enviar.mutate();
                }}
                disabled={!aceptarCambios || enviar.isPending}
            >
                aceptar cambios
            </button>
            <button
                onClick={cancelarTodosLosCambios}
                disabled={!aceptarCambios}
            >
                cancelar cambios
            </button>
            {enviar.isPending && <p>Enviando...</p>}
            {enviar.isError && <p>Error: {enviar.error.message}</p>}
        </div>
    );
}
