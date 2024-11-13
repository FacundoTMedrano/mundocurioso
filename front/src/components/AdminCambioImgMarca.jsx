import PropTypes from "prop-types";
import { useRef } from "react";

function validarImagen(file) {
    const validTypes = ["image/webp"];
    const isValidType = validTypes.includes(file?.type);
    if (!isValidType) {
        return "Tipo de dato incorrecto";
    }
    const isValidSize = file.size <= 2 * 1024 * 1024; // 5 megas
    if (!isValidSize) {
        return "Tamaño maximo por imagen excedido";
    }
    return null;
}

export default function AdminCambioImgMarca({
    setImagenes,
    file,
    url,
    nombre,
    err,
}) {
    const refInputImg = useRef();

    function cargarImg(e) {
        const file = e.target.files[0];
        const err = validarImagen(file);
        if (err) {
            setImagenes((prev) => {
                return prev.map((v) => {
                    if (v.nombre === nombre) {
                        return { ...v, err };
                    } else {
                        return { ...v, err: "" };
                    }
                });
            });
            return;
        }
        setImagenes((prev) => {
            return prev.map((v) => {
                if (v.nombre === nombre) {
                    return {
                        ...v,
                        err: "",
                        url: URL.createObjectURL(file),
                        file,
                    };
                } else {
                    return v;
                }
            });
        });
    }

    function cancelar() {
        setImagenes((prev) => {
            return prev.map((v) => {
                if (v.nombre === nombre) {
                    return {
                        ...v,
                        url: v.oldUrl,
                        file: null,
                    };
                } else {
                    return v;
                }
            });
        });
    }

    return (
        <div className="div-imagen">
            <input
                type="file"
                onChange={cargarImg}
                ref={refInputImg}
                style={{ display: "none" }}
            />
            <img src={url} />
            <h3>{nombre}</h3>
            <div className="div-imagen-botones">
                <button onClick={() => refInputImg.current.click()}>
                    cambiar
                </button>
                <button onClick={cancelar} disabled={!file}>
                    cancelar
                </button>
            </div>
            {err && <p>{err}</p>}
        </div>
    );
}

AdminCambioImgMarca.propTypes = {
    setImagenes: PropTypes.func,

    file: PropTypes.oneOfType([
        PropTypes.instanceOf(File),
        PropTypes.oneOf([null]),
    ]),
    url: PropTypes.string,
    nombre: PropTypes.string,
    err: PropTypes.string,
};
