import categorias from "../constants/categorias";
import { base } from "../constants/base";
import { NavLink } from "react-router-dom";

export default function AdminDash() {
    return (
        <main>
            <div>
                <div className="contenedor-grid" id="admin-marcas-dash">
                    {categorias.map((v) => {
                        const nombre = v.replaceAll(" ", "-");
                        const nombreURL = encodeURIComponent(v);
                        const imgSmall = `${base}/imgs/categorias/small/${nombre}.webp`;
                        const imgMedium = `${base}/imgs/categorias/medium/${nombre}.webp`;

                        return (
                            <div className="div-imagen" key={`${v}img`}>
                                <NavLink
                                    to={`/admin/categoria?categoria=${nombreURL}&page=${1}`}
                                >
                                    <div className="contenedor-imagen">
                                        <img
                                            src={imgMedium}
                                            srcSet={`${imgSmall} 500w,${imgMedium} 1000w`}
                                        />
                                    </div>
                                    <h3>{v}</h3>
                                </NavLink>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
