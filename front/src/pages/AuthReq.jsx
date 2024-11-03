import { Outlet, Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function AuthReq() {
    const {
        auth: { accessToken },
    } = useAuth();

    const location = useLocation();

    if (accessToken === null) {
        return (
            <Navigate to={"/login"} state={{ from: location }} replace={true} />
        );
    }

    return <Outlet />;
}
