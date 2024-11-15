import categorias from "../constants/categorias";
import { base } from "../constants/base";
import { NavLink } from "react-router-dom";
import CuriosidadesGridHome from "../components/CuriosidadesGridHome";

export default function Home() {
    return (
        <main className="home-page">
            <h2>Curiosidades</h2>
            <CuriosidadesGridHome />
            <NavLink
                onClick={() => {
                    window.scrollTo({
                        top: 0,
                    });
                }}
                className={"ver-mas-curiosidades"}
                to={"/ver-todo"}
            >
                ver mas curiosidades
            </NavLink>

            <div className="grupo-de-categorias-home">
                <h2>Categorias</h2>
                <div className="contenedor-grid">
                    {categorias.map((v) => {
                        const nombre = v.replaceAll(" ", "-");
                        const nombreURL = encodeURIComponent(v);
                        const imgSmall = `${base}/imgs/categorias/small/${nombre}.webp`;
                        const imgMedium = `${base}/imgs/categorias/medium/${nombre}.webp`;

                        return (
                            <div className="div-imagen" key={`${v}img`}>
                                <NavLink
                                    to={`/categoria/?categoria=${nombreURL}&page=${1}`}
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
