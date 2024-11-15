import { NavLink, useNavigate } from "react-router-dom";
import categorias from "../constants/categorias";
import Hamburger from "hamburger-react";
import { useState } from "react";
import { MdNavigateNext } from "react-icons/md";
import useAuth from "../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

export default function DashboardAdmin() {
    const navigate = useNavigate();

    const [isOpen, setOpen] = useState(false);
    const [isOpenCategorias, setIsOpenCategorias] = useState(false);
    const [busqueda, setBusqueda] = useState("");

    const axios = useAxiosPrivate();
    const { setAuth, setLoading } = useAuth();

    const logOut = useMutation({
        mutationFn: async () => {
            await axios.post("auth/logout");
        },
        onError: (err) => {
            console.log(err.message);
        },
        onSuccess: () => {
            setAuth({ accessToken: null, id: null });
            localStorage.removeItem("admin");
            setLoading(true);
            navigate("/");
        },
    });

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setOpen((prev) => !prev);
            setIsOpenCategorias(false);
            navigate(`/admin/search/?search=${busqueda}&page=1`);
        }
    };

    return (
        <>
            <header className="header-dash-admin">
                <div className="portada-home">
                    <div className="opacity-portada">
                        <h1>
                            <NavLink to={"/"}>Mundo Curioso</NavLink>
                        </h1>
                    </div>
                </div>
            </header>
            <div className="dash-admin">
                <div className="burger">
                    <Hamburger
                        toggled={isOpen}
                        toggle={() => {
                            setOpen((prev) => !prev);
                            setIsOpenCategorias(false);
                        }}
                    />
                </div>
                <div className={!isOpen ? "menu" : "menu open"}>
                    <nav className="nav-links">
                        <ul className="primer-ul">
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
                            <li className="link">
                                <NavLink to={"/"}>Home</NavLink>
                            </li>
                            <li className="link">
                                <NavLink to={"/admin"}>Dashboard</NavLink>
                            </li>
                            <li className="link-categorias">
                                <button
                                    className="submenu-boton"
                                    onClick={() => {
                                        if (window.innerWidth < 1200) {
                                            //desktop
                                            setIsOpenCategorias(
                                                (prev) => !prev
                                            );
                                        }
                                    }}
                                >
                                    Categorias
                                    <MdNavigateNext
                                        className={
                                            !isOpenCategorias
                                                ? "svg-div"
                                                : "svg-div open"
                                        }
                                    />
                                </button>

                                <ul
                                    className={
                                        !isOpenCategorias
                                            ? "categorias-div"
                                            : "categorias-div open"
                                    }
                                >
                                    {categorias.map((v) => {
                                        return (
                                            <li
                                                key={v}
                                                className="link-submenu"
                                            >
                                                <NavLink
                                                    to={`/admin/categoria/?categoria=${encodeURIComponent(
                                                        v
                                                    )}&page=${1}`}
                                                >
                                                    {v}
                                                </NavLink>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                            <li className="link">
                                <NavLink to={"/admin/imagenes-marcas"}>
                                    Imagenes Marcas
                                </NavLink>
                            </li>
                            <li className="link">
                                <NavLink to={"/admin/cambiar-portada"}>
                                    Cambiar Portada
                                </NavLink>
                            </li>
                            <li className="link">
                                <NavLink to={"/admin/crear"}>
                                    Crear Curiosidad
                                </NavLink>
                            </li>
                            <li className="link">
                                <NavLink to={"/admin/cambiar-contraseña"}>
                                    cambiar contraseña
                                </NavLink>
                            </li>
                            <li className="logout">
                                <button
                                    disabled={logOut.isPending}
                                    onClick={() => logOut.mutate()}
                                >
                                    LogOut
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}
