import PropTypes from "prop-types";
import { base } from "../constants/base";
import { NavLink } from "react-router-dom";

export default function CuriosidadesGrid({ curiosidades }) {
    return (
        <div className="categoria-ver-page">
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
                        </div>
                    );
                })
            )}
        </div>
    );
}

CuriosidadesGrid.propTypes = {
    curiosidades: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string, // UUID como string
            titulo: PropTypes.string,
            subtitulo: PropTypes.string,
            imagen: PropTypes.string,
        })
    ),
};
