import {  Outlet } from "react-router-dom";
export default function Admin() {
    return (
        <>
            <div>
                <p>buscador</p>
                <p>incio</p>
                <p>crear curiosidad</p>
            </div>
            <Outlet />
        </>
    );
}
