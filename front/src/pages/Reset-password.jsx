import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { axiosPublic } from "../services/api";
import { useForm } from "react-hook-form";

export default function ResetPassword() {
    const [querySearch] = useSearchParams();

    const token = querySearch.get("token");
    const email = querySearch.get("email");

    const enviar = useMutation({
        mutationFn: async (data) => {
            if (!token || !email) return null;
            const result = await axiosPublic.post("auth/reset-password", {
                email: data.email,
                token,
                password: data.password,
            });
            console.log(result.data);
        },
        onError: (err) => {
            console.log(err.message);
        },
        onSuccess: () => {
            console.log("success");
        },
    });

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm();

    return (
        <div className="reset-password">
            <h1>Recupere su contraseña</h1>
            <h2>{email}</h2>
            <form onSubmit={handleSubmit(enviar.mutate)}>
                <div>
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        required
                        {...register("password", {
                            minLength: {
                                value: 8,
                                message:
                                    "La contraseña debe tener al menos 8 caracteres",
                            },
                        })}
                    />
                </div>
                {errors.password && (
                    <p className="err">{errors.password.message}</p>
                )}
                <div>
                    <label htmlFor="repeatPassword">Repetir contraseña</label>
                    <input
                        type="password"
                        id="repeatPassword"
                        required
                        {...register("repeatPassword", {
                            validate: (_, formValues) => {
                                if (
                                    formValues.password !==
                                    formValues.repeatPassword
                                ) {
                                    return "las contraseñas deben ser iguales";
                                }
                            },
                        })}
                    />
                </div>
                {errors.repeatPassword && (
                    <p className="err">{errors.repeatPassword.message}</p>
                )}
                <button
                    disabled={
                        enviar.isPending || enviar.isSuccess || enviar.isError
                    }
                    type="submit"
                >
                    enviar
                </button>
            </form>
            {enviar.isError && (
                <p className="err">problemas al asignar la contraseña</p>
            )}
            {enviar.isSuccess && <p className="success">Contraseña asignada</p>}
        </div>
    );
}
