import { useForm } from "react-hook-form";
import useAxiosPrivate from "../hooks/useAxiosPrivate.jsx";
import { useMutation } from "@tanstack/react-query";

export default function ChangePassword() {
    const axiosPrivate = useAxiosPrivate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const change = useMutation({
        mutationFn: async (dato) => {
            await axiosPrivate.post("auth/change_password", dato);
        },
        onError: (error) => {
            console.log(error.message);
        },
    });

    return (
        <div className="change-password-page">
            <h1>Cambiar Contraseña</h1>
            <form onSubmit={handleSubmit(console.log)}>
                <div>
                    <label htmlFor="old-password">Contraseña actual</label>
                    <input
                        id="old-password"
                        type="password"
                        required
                        {...register("oldPassword", {
                            minLength: {
                                value: 8,
                                message:
                                    "La contraseña debe tener al menos 8 caracteres",
                            },
                        })}
                    />
                </div>
                {errors.oldPassword && (
                    <p className="err">{errors.oldPassword.message}</p>
                )}
                <div>
                    <label htmlFor="password">Nueva contraseña</label>
                    <input
                        id="password"
                        type="password"
                        required
                        {...register("newPassword", {
                            minLength: {
                                value: 8,
                                message:
                                    "La contraseña debe tener al menos 8 caracteres",
                            },
                        })}
                    />
                </div>
                {errors.newPassword && (
                    <p className="err">{errors.newPassword.message}</p>
                )}
                <div>
                    <label htmlFor="new-password">
                        Repetir nueva contraseña
                    </label>
                    <input
                        id="new-password"
                        type="password"
                        required
                        {...register("repetNewPassword", {
                            validate: (_, formValues) => {
                                if (
                                    formValues.newPassword !==
                                    formValues.repetNewPassword
                                ) {
                                    return "las contraseñas deben ser iguales";
                                }
                            },
                        })}
                    />
                </div>
                {errors.repetNewPassword && (
                    <p className="err">{errors.repetNewPassword.message}</p>
                )}

                <div className="boton">
                    <button
                        disabled={
                            change.isPending ||
                            change.isError ||
                            change.isSuccess
                        }
                    >
                        Aceptar
                    </button>
                </div>
            </form>
            {change.isError && (
                <p className="err">no se pudo realizar el cambio</p>
            )}
            {change.isSuccess && (
                <p className="success">exito al cambiar la contraseña</p>
            )}
        </div>
    );
}
