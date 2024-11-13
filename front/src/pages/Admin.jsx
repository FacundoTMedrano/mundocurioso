import { NavLink, Outlet, useNavigate } from "react-router-dom";
import categorias from "../constants/categorias";
import Hamburger from "hamburger-react";
import { useState } from "react";
import { MdNavigateNext } from "react-icons/md";
import useAuth from "../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

export default function Admin() {
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
            setLoading(true);
            navigate("/");
        },
    });

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setOpen((prev) => !prev);
            setIsOpenCategorias(false);
            navigate(`/admin/search?search=${busqueda}&page=1`);
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
                <div className="dash">
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
                                <li>
                                    <div className="input-busqueda">
                                        <input
                                            type="text"
                                            placeholder="Buscar"
                                            value={busqueda}
                                            onChange={(e) =>
                                                setBusqueda(e.target.value)
                                            }
                                            onKeyDown={handleKeyDown}
                                        />
                                    </div>
                                </li>
                                <li>
                                    <div className="link">
                                        <NavLink to={"/"}>Home</NavLink>
                                    </div>
                                </li>
                                <li>
                                    <div className="link">
                                        <NavLink to={"/admin"}>
                                            Dashboard
                                        </NavLink>
                                    </div>
                                </li>
                                <li>
                                    <div
                                        className="link-categorias"
                                        onClick={() =>
                                            setIsOpenCategorias((prev) => !prev)
                                        }
                                    >
                                        <div className="text-div">
                                            <NavLink
                                                to={"/admin/#admin-marcas-dash"}
                                            >
                                                Categorias
                                            </NavLink>
                                            <button>Categorias</button>
                                        </div>

                                        <div
                                            className={
                                                !isOpenCategorias
                                                    ? "svg-div"
                                                    : "svg-div open"
                                            }
                                        >
                                            <MdNavigateNext className="svg" />
                                        </div>
                                    </div>
                                    <div
                                        className={
                                            !isOpenCategorias
                                                ? "categorias-div"
                                                : "categorias-div open"
                                        }
                                    >
                                        <ul>
                                            {categorias.map((v) => {
                                                // const categoria = v.replaceAll(" ", "-");
                                                const categoria =
                                                    encodeURIComponent(v);
                                                return (
                                                    <li key={v}>
                                                        <NavLink
                                                            to={`/admin/categoria?categoria=${categoria}&page=${1}`}
                                                        >
                                                            {v}
                                                        </NavLink>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </li>
                                <li>
                                    <div className="link">
                                        <NavLink to={"/admin/imagenes-marcas"}>
                                            Imagenes Marcas
                                        </NavLink>
                                    </div>
                                </li>
                                <li>
                                    <div className="link">
                                        <NavLink to={"/admin/cambiar-portada"}>
                                            Cambiar Portada
                                        </NavLink>
                                    </div>
                                </li>
                                <li>
                                    <div className="link">
                                        <NavLink to={"/admin/crear"}>
                                            Crear Curiosidad
                                        </NavLink>
                                    </div>
                                </li>
                                <li>
                                    <div className="logout">
                                        <button
                                            disabled={logOut.isPending}
                                            onClick={() => logOut.mutate()}
                                        >
                                            LogOut
                                        </button>
                                    </div>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </header>
            {/* <div>
                <p>buscador</p>
                <p>incio</p>
                <p>crear curiosidad</p>
            </div> */}
            <Outlet />
        </>
    );
}
