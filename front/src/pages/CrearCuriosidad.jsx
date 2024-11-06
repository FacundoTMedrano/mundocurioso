import { useState, useMemo, useRef } from "react";
import JoditEditor from "jodit-react";
import { useForm } from "react-hook-form";
import CargarUnaImagen from "../components/CargarUnaImagen";
import categorias from "../constants/categorias";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import aceptedCategories from "../utils/aceptedCategories";

export default function CrearCuriosidad() {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();

    const editorRef = useRef(null);
    const [content, setContent] = useState("");
    const [contentErr, setContentErr] = useState("");

    const [img, setImg] = useState({
        img: null,
        file: null,
        err: "",
    });

    const crear = useMutation({
        mutationFn: async (data) => {
            await axiosPrivate.post("curiosidades/crear", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        },
        onError: (error) => {
            console.log(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["curiosidades"] });
            console.log("realizado");
        },
    });

    const {
        handleSubmit,
        register,
        formState: { errors },
        getValues,
        setError,
        trigger,
        clearErrors,
    } = useForm();

    const config = useMemo(() => {
        return {
            uploader: {
                insertImageAsBase64URI: true,
            },
        };
    }, []);

    function prepareSend(data) {
        const form = new FormData();
        form.append("imagen", img.file);

        const datos = {
            titulo: data.titulo,
            subtitulo: data.subtitulo,
            categorias: aceptedCategories(data.categoria),
            curiosidad: content,
        };

        form.append("datos", JSON.stringify(datos));

        crear.mutate(form);
    }

    async function findErrors() {
        //busqueda de errores
        let errores = false;

        const { categoria } = getValues();
        const categoriasSeleccionadas =
            Object.values(categoria).filter(Boolean);
        if (categoriasSeleccionadas.length === 0) {
            setError("categoria", {
                type: "required",
                message: "Debes seleccionar al menos una categoría",
            });
            errores = true;
        }

        if (!content) {
            setContentErr("debe tener un contenido para mostrar");
            errores = true;
        }

        if (!img.file) {
            setImg((prev) => {
                return { ...prev, err: "Debe tener una imagen" };
            });
            errores = true;
        }

        const allRigth = await trigger();

        if (!allRigth) {
            errores = true;
        }
        return errores;
    }

    async function handleForm(e) {
        e.preventDefault();
        const errorEnImgs = await findErrors();
        if (!errorEnImgs) {
            console.log("si ingreso");
            handleSubmit(prepareSend)();
        }
        // handleSubmit((data) => {
        //     if (!errorEnImgs) {
        //         prepareSend(data);
        //     }
        // })();
    }

    return (
        <div>
            <h1>Crear Curiosidad</h1>
            <form onSubmit={handleForm}>
                <div>
                    <h2>Previsualizacion</h2>
                    <CargarUnaImagen img={img} setImg={setImg} />
                    <div>
                        <label htmlFor="titulo-Form">Titulo</label>
                        <input
                            id="titulo-Form"
                            type="text"
                            placeholder="titulo"
                            required
                            {...register("titulo")}
                        />
                        {errors.titulo && <p>{errors.titulo.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="subtitulo-Form">Subtitulo</label>
                        <textarea
                            id="subtitulo-Form"
                            rows={4}
                            placeholder="subtitulo"
                            required
                            {...register("subtitulo")}
                        />
                        {errors.subtitulo && <p>{errors.subtitulo.message}</p>}
                    </div>
                    <div>
                        <div>
                            {categorias.map((categoria) => (
                                <label key={categoria}>
                                    <input
                                        type="checkbox"
                                        {...register(`categoria.${categoria}`, {
                                            onChange: () => {
                                                if (errors.categoria) {
                                                    clearErrors("categoria");
                                                }
                                            },
                                        })}
                                    />
                                    {categoria}
                                </label>
                            ))}
                        </div>
                        {errors.categoria && <p>{errors.categoria.message}</p>}
                    </div>
                </div>
                <div className="jodit-div">
                    <JoditEditor
                        ref={editorRef}
                        value={content}
                        config={config}
                        onBlur={(newContent) => setContent(newContent)}
                    />
                    {contentErr && <p>{contentErr}</p>}
                </div>
                <button type="submit">Aceptar</button>
            </form>
        </div>
    );
}
