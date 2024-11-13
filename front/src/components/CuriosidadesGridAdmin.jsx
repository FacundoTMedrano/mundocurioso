import PropTypes from "prop-types";
import { base } from "../constants/base";
import { NavLink } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

export default function CuriosidadesGridAdmin({
    curiosidades,
    invalidateArray,
}) {
    const queryClient = useQueryClient();
    const axios = useAxiosPrivate();

    const borrar = useMutation({
        mutationFn: async (id) => {
            await axios.delete(`curiosidades/${id}`);
        },
        onError: (err) => {
            console.log(err.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: invalidateArray,
            });
        },
    });

    return (
        <div className="categoria-ver-page-admin">
            {curiosidades.length === 0 ? (
                <p>no se encontraron curiosidades</p>
            ) : (
                curiosidades.map((v) => {
                    const imgBig = `${base}/imgs/curiosidades/big/${v.imagen}`;
                    const imgMedium = `${base}/imgs/curiosidades/medium/${v.imagen}`;
                    return (
                        <div key={v.id} className="contenedor-div">
                            <NavLink to={`/curiosidad/${v.slug}`}>
                                <div className="imagen-div">
                                    <img
                                        src={imgMedium}
                                        srcSet={`${imgMedium} 500w,${imgBig} 1000w`}
                                    />
                                </div>
                                <div className="titulo-subtitulo">
                                    <h3>{v.titulo}</h3>
                                    <p>{v.subtitulo}</p>
                                </div>
                            </NavLink>
                            <div className="botones">
                                <NavLink to={`/admin/editar/${v.id}`}>editar</NavLink>
                                <button
                                    disabled={borrar.isPending}
                                    onClick={() => borrar.mutate(v.id)}
                                >
                                    eliminar
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

CuriosidadesGridAdmin.propTypes = {
    invalidateArray: PropTypes.array,
    curiosidades: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string, // UUID como string
            titulo: PropTypes.string,
            subtitulo: PropTypes.string,
            imagen: PropTypes.string,
        })
    ),
};
