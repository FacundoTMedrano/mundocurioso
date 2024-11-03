import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect } from "react";
import useRefresh from "../hooks/useRefresh";

export default function AuthGate() {
    const { loading, setLoading } = useAuth();
    const refresh = useRefresh();

    async function cargarUsuario() {
        try {
            await refresh();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (loading) {
            cargarUsuario();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return <p>loading...</p>;
    } else if (!loading) {
        return <Outlet />;
    }
}
