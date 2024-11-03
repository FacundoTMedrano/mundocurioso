import { useEffect } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { axiosPublic } from "../services/api";

export default function Login() {
    const {
        auth: { accessToken },
        setAuth,
    } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (accessToken) {
            navigate(from, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logIn = useMutation({
        mutationFn: async (datos) => {
            const { data } = await axiosPublic.post(`auth/login`, datos, {
                withCredentials: true,
            });
            return data;
        },
        onSuccess: (data) => {
            console.log("success, loageado", data);
            setAuth(data);
            navigate("/admin");
        },
        onError: (error) => {
            //dependiendo el error podria ser que sea las credenciales malas
            console.log(error.message, error.response.data.msg);
        },
    });

    return (
        <div className="login-page">
            <div className="contenedor">
                <h1>Iniciar sesion</h1>
                <form onSubmit={handleSubmit(logIn.mutate)}>
                    <div>
                        <label htmlFor="email">Correo Electronico</label>
                        <input
                            placeholder="nombre@gmail.com"
                            type="email"
                            required
                            {...register("email", {
                                pattern: {
                                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                    message: "Formato de email inválido",
                                },
                            })}
                        />
                        {errors.email?.message && (
                            <p>{errors.email?.message}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            placeholder="password"
                            type="password"
                            required
                            {...register("password", {
                                minLength: {
                                    value: 6,
                                    message:
                                        "La contraseña debe tener al menos 8 caracteres",
                                },
                                // pattern: {
                                //     value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/,
                                //     message:
                                //         "La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales",
                                // },
                            })}
                        />
                        {errors.password?.message && (
                            <p>{errors.password?.message}</p>
                        )}
                    </div>
                    <button>ingresar</button>
                </form>
                {logIn.isError && <p>error</p>}
                {logIn.isPending && <p>loading...</p>}
            </div>
        </div>
    );
}
