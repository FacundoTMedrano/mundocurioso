import { NavLink, useNavigate } from "react-router-dom";
import categorias from "../constants/categorias";
import Hamburger from "hamburger-react";
import { useState } from "react";

export default function DashboardUser() {
    const navigate = useNavigate();

    const [isOpen, setOpen] = useState(false);
    const [busqueda, setBusqueda] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setOpen((prev) => !prev);
            navigate(`/search/?search=${busqueda}&page=1`);
        }
    };

    return (
        <header className="header-dash">
            <div className="portada-home">
                <div className="opacity-portada">
                    <h1>
                        <NavLink to={"/"}>Mundo Curioso</NavLink>
                    </h1>
                </div>
            </div>
            <div className="dash">
                <div className={!isOpen ? "burger" : "burger close"}>
                    <Hamburger toggled={isOpen} toggle={setOpen} />
                </div>
                <div className={!isOpen ? "menu" : "menu open"}>
                    <nav className="nav-links">
                        <ul>
                            <li className="input-busqueda">
                                <input
                                    type="text"
                                    placeholder="Buscar"
                                    value={busqueda}
                                    onChange={(e) =>
                                        setBusqueda(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                />
                            </li>
                            <li>
                                <NavLink to={"/"}>Home</NavLink>
                            </li>
                            {categorias.map((v) => {
                                // const categoria = v.replaceAll(" ", "-");
                                const categoria = encodeURIComponent(v);
                                return (
                                    <li key={v}>
                                        <NavLink
                                            to={`/categoria/?categoria=${categoria}&page=${1}`}
                                        >
                                            {v}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}
