import { Outlet } from "react-router-dom";
import DashboardUser from "../components/DashboardUser";
import useAuth from "../hooks/useAuth";
import DashboardAdmin from "../components/DashboardAdmin";
// import { useEffect } from "react";

export default function Dashboard() {
    const {
        auth: { accessToken },
    } = useAuth();

    // useEffect(() => {}, [accessToken]);
    return (
        <>
            {accessToken ? <DashboardAdmin /> : <DashboardUser />}
            <Outlet />
        </>
    );
}
