import { NavLink, Outlet } from "react-router-dom";
import categorias from "../constants/categorias";
import Hamburger from "hamburger-react";
import { useState } from "react";

export default function Dashboard() {
    const [isOpen, setOpen] = useState(false);

    return (
        <>
            <header className="header-dash">
                <div className="portada-home">
                    <div className="opacity-portada">
                        <h1>Mundo Curioso</h1>
                    </div>
                </div>
                <div className="dash">
                    <div className={!isOpen ? "burger" : "burger close"}>
                        <Hamburger toggled={isOpen} toggle={setOpen} />
                    </div>
                    <div className={!isOpen ? "menu" : "menu open"}>
                        <nav className="nav-links">
                            <ul>
                                <li>
                                    <NavLink to={"/"}>Home</NavLink>
                                </li>
                                {categorias.map((v) => {
                                    const categoria = v.replaceAll(" ", "-");
                                    return (
                                        <li key={v}>
                                            <NavLink
                                                to={`categoria/${categoria}`}
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
            <Outlet />
        </>
    );
}
