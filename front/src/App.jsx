import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Categoria from "./pages/Categoria";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AuthGate from "./pages/AuthGate";
import AuthReq from "./pages/AuthReq";
import Admin from "./pages/Admin";
import AdminDash from "./pages/AdminDash";
import AdminCategoria from "./pages/AdminCategoria";
import AdminSearch from "./pages/AdminSearch";
import CrearCuriosidad from "./pages/CrearCuriosidad";
import EditarCuriosidad from "./pages/EditarCuriosidad";
// import { GiAstronautHelmet } from "react-icons/gi"; logo

export default function App() {
    return (
        <Routes>
            <Route path="login" element={<Login />} />

            <Route path="/" element={<Dashboard />}>
                <Route index element={<Home />} />
                <Route path="categoria/:categoria" element={<Categoria />} />
                <Route path="search/:search" element={<Search />} />
            </Route>

            <Route element={<AuthGate />}>
                <Route element={<AuthReq />}>
                    <Route path="Admin" element={<Admin />}>
                        <Route index element={<AdminDash />} />
                        <Route path="crear" element={<CrearCuriosidad />} />
                        <Route
                            path="editar/:id"
                            element={<EditarCuriosidad />}
                        />
                        <Route
                            path="categoria/:categoria"
                            element={<AdminCategoria />}
                        />
                        <Route
                            path="search/:search"
                            element={<AdminSearch />}
                        />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
