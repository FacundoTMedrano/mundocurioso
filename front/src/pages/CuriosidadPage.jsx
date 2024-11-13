import { useQuery } from "@tanstack/react-query";
import { base } from "../constants/base";
import { axiosPublic } from "../services/api";
import { useParams } from "react-router-dom";

export default function CuriosidadPage() {
    const param = useParams().curiosidad;

    const curiosidad = useQuery({
        queryFn: async () => {
            const result = await axiosPublic(
                `curiosidades/curiosidad/${param}`
            );
            return result.data;
        },
        queryKey: ["curiosidades",param],
        retry: (failureCount, error) => {
            console.log(failureCount);
            if (error.response && error.response.status === 404) {
                return false;
            }

            return failureCount < 2; //intentara 3 veces
        },
    });

    if (curiosidad.isLoading) {
        return <p>loading...</p>;
    }

    if (curiosidad.isError) {
        if (
            curiosidad.error.response &&
            curiosidad.error.response.status === 404
        ) {
            return (
                <div>La curiosidad no fue encontrada. Verifica el slug.</div>
            );
        }
        return <p>Error</p>;
    }

    const imgBig = `${base}/imgs/curiosidades/big/${curiosidad.data.imagen}`;
    const imgMedium = `${base}/imgs/curiosidades/medium/${curiosidad.data.imagen}`;

    return (
        <main className="curiosidad-page">
            <div className="curiosidad-titulo-subtitulo">
                <h2>{curiosidad.data.titulo}</h2>
                <p>{curiosidad.data.subtitulo}</p>
            </div>
            <div className="curiosidad-div-img">
                <img
                    src={imgMedium}
                    srcSet={`${imgMedium} 500w,${imgBig} 1000w`}
                />
            </div>
            <div
                className="articulo-html"
                dangerouslySetInnerHTML={{
                    __html: curiosidad.data.articulohtml,
                }}
            />
        </main>
    );
}
