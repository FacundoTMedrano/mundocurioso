import { useState, useMemo, useRef, useEffect } from "react";
import JoditEditor from "jodit-react";
import { useForm } from "react-hook-form";
import CargarUnaImagen from "../components/CargarUnaImagen";
import categorias from "../constants/categorias";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import aceptedCategories from "../utils/aceptedCategories";
import { useParams } from "react-router-dom";
import { base } from "../constants/base";

export default function CrearCuriosidad() {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    const { id } = useParams();
    console.log(id);

    const editorRef = useRef(null);
    const [content, setContent] = useState("");
    const [contentErr, setContentErr] = useState("");

    const [img, setImg] = useState({
        img: null,
        file: null,
        err: "",
    });

    const curiosidad = useQuery({
        queryKey: ["curiosidades", id],
        queryFn: async () => {
            const result = await axiosPrivate(
                `curiosidades/curiosidad/por-id/${id}`
            );
            console.log(result.data);
            return result.data;
        },
        retry: (failureCount, error) => {
            console.log(failureCount);
            if (error.response && error.response.status === 404) {
                return false;
            }

            return failureCount < 2; //intentara 3 veces
        },
        refetchOnWindowFocus: false,
    });

    const crear = useMutation({
        mutationFn: async (data) => {
            await axiosPrivate.put(`curiosidades/${id}`, data, {
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
    } = useForm({
        values: {
            categoria: curiosidad.data?.categorias,
            titulo: curiosidad.data?.titulo,
            subtitulo: curiosidad.data?.subtitulo,
        },
    });

    const config = useMemo(() => {
        return {
            uploader: {
                insertImageAsBase64URI: true,
            },
        };
    }, []);

    function prepareSend(data) {
        const form = new FormData();
        if (img.file) {
            form.append("imagen", img.file);
        }

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

        // if (!img.file) {
        //     setImg((prev) => {
        //         return { ...prev, err: "Debe tener una imagen" };
        //     });
        //     errores = true;
        // }

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
    }

    useEffect(() => {
        if (curiosidad.isSuccess) {
            setImg((prev) => {
                const url = `${base}/imgs/curiosidades/big/${curiosidad.data.imagen}`;
                return { ...prev, img: url };
            });
            setContent(curiosidad.data.articulohtml);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curiosidad.isSuccess]);

    if (curiosidad.isLoading) {
        return <p>loading...</p>;
    }

    if (curiosidad.isError) {
        if (
            curiosidad.error.response &&
            curiosidad.error.response.status === 404
        ) {
            return <div>La curiosidad no fue encontrada.</div>;
        }
        return <p>Error</p>;
    }

    return (
        <div className="crear-curiosidad">
            <h1>Crear Curiosidad</h1>
            <form onSubmit={handleForm}>
                <div>
                    <CargarUnaImagen img={img} setImg={setImg} />
                    <div className="titulo-form">
                        <label htmlFor="titulo-Form">Titulo</label>
                        <input
                            id="titulo-Form"
                            type="text"
                            placeholder="titulo"
                            required
                            {...register("titulo", {
                                max: {
                                    value: 300,
                                    message: "debe ser menor a 300 letras",
                                },
                            })}
                        />
                        {errors.titulo && <p>{errors.titulo.message}</p>}
                    </div>
                    <div className="subtitulo-form">
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
                    <div className="categorias-select">
                        <div className="select-box">
                            {categorias.map((categoria) => (
                                <div key={categoria} className="div-checkbox">
                                    <input
                                        type="checkbox"
                                        id={`div-checkbox${categoria}`}
                                        {...register(`categoria.${categoria}`, {
                                            onChange: () => {
                                                if (errors.categoria) {
                                                    clearErrors("categoria");
                                                }
                                            },
                                        })}
                                    />
                                    <label htmlFor={`div-checkbox${categoria}`}>
                                        {categoria}
                                    </label>
                                </div>
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
                <div className="boton-aceptar">
                    <button type="submit">Aceptar</button>
                </div>
            </form>
        </div>
    );
}
