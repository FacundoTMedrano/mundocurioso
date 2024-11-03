import PropTypes from "prop-types";
import validarImagen from "../utils/validarImagen";
import { useRef } from "react";

export default function CargarUnaImagen({ img, setImg }) {
    const inputFileRef = useRef();

    function cargarImg(e) {
        const file = e.target.files[0];
        const err = validarImagen(file);
        if (err) {
            setImg((prev) => {
                return { ...prev, err };
            });
            return;
        }
        setImg({ img: URL.createObjectURL(file), file, err: "" });
    }

    return (
        <div className="imagen-box">
            <div className="imagen">
                {img.img ? <img src={img.img} /> : <p>Sin Imagen</p>}
            </div>
            {img.err && <p>{img.err}</p>}

            <input //display = none en scss
                type="file"
                onChange={cargarImg}
                ref={inputFileRef}
            />

            <div className="botones">
                <button
                    type="button"
                    onClick={() => inputFileRef.current.click()}
                >
                    {img.img ? "Cambiar imagen" : "Cargar Imagen"}
                </button>
            </div>
        </div>
    );
}

CargarUnaImagen.propTypes = {
    img: PropTypes.shape({
        img: PropTypes.string,
        file: PropTypes.instanceOf(File),
        err: PropTypes.string,
    }),
    setImg: PropTypes.func,
};
