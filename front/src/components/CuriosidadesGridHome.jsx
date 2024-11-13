import { useQuery } from "@tanstack/react-query";
import { axiosPublic } from "../services/api";
import CuriosidadesGrid from "./CuriosidadesGrid";

export default function CuriosidadesGridHome() {
    const curiosidades = useQuery({
        queryKey: ["curiosidades", { search: "", page: 1 }],
        queryFn: async () => {
            const result = await axiosPublic("curiosidades/vertodo", {
                params: { page: 1, page_size: 10 },
            });
            return result.data;
        },
    });

    if (curiosidades.isLoading) {
        return <p>loading...</p>;
    }

    if (curiosidades.isError) {
        return <p>Error</p>;
    }

    console.log(curiosidades.data);

    return <CuriosidadesGrid curiosidades={curiosidades.data.curiosidades} />;
}
