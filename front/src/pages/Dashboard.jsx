import { NavLink, Outlet } from "react-router-dom";
import categorias from "../constants/categorias";

export default function Dashboard() {
    return (
        <>
            <header>
                <nav>
                    <ul>
                        {categorias.map((v) => {
                            const categoria = v.replaceAll(" ", "-");
                            return (
                                <li key={v}>
                                    <NavLink to={`categoria/${categoria}`}>
                                        {v}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </header>
            <Outlet />
        </>
    );
}
