import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { axiosPublic } from "../services/api";

export default function OlvideLaContraseña() {
    const enviar = useMutation({
        mutationFn: async (data) => {
            await axiosPublic.post("auth/forgot-password", data);
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
        <div className="olvide-la-contraseña">
            <h2>Coloque su email</h2>
            <form onSubmit={handleSubmit(enviar.mutate)}>
                <input
                    required
                    placeholder="email"
                    type="text"
                    {...register("email", {
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Formato de correo electrónico no válido",
                        },
                    })}
                />
                {errors.email && <p className="err">{errors.email.message}</p>}
                <button
                    disabled={
                        enviar.isPending || enviar.isSuccess || enviar.isError
                    }
                    type="submit"
                >
                    enviar
                </button>
            </form>
            {enviar.isError && <p className="err">hubo un error en el envio</p>}
            {enviar.isSuccess && (
                <p className="success">Mensaje enviado, verifique su email</p>
            )}
        </div>
    );
}
