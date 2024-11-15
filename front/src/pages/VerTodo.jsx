import { useSearchParams } from "react-router-dom";
import { axiosPublic } from "../services/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import CuriosidadesGrid from "../components/CuriosidadesGrid";

export default function VerTodo() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Number(searchParams.get("page") || 1);

    const curiosidades = useQuery({
        queryKey: ["curiosidades", { search: "", page }],
        queryFn: async () => {
            const { data } = await axiosPublic(`curiosidades/vertodo`, {
                params: { search: "", page, page_size: 10 },
            });
            return data;
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });

    function goToNextPage() {
        setSearchParams({ page: page + 1 });
    }

    function goToPreviousPage() {
        setSearchParams({ page: page - 1 });
    }

    if (curiosidades.isLoading) {
        return <p>cargando</p>;
    }
    if (curiosidades.isError) {
        return <p>error al cargar los datos</p>;
    }

    return (
        <main>
            <h2>Curiosidades</h2>

            <CuriosidadesGrid curiosidades={curiosidades.data.curiosidades} />

            <div className="back-next">
                <button
                    className="back"
                    disabled={page === 1}
                    onClick={goToPreviousPage}
                >
                    <div className="back-icon">
                        <MdNavigateBefore />
                    </div>
                </button>
                <p className="page">{page}</p>
                <button
                    className="next"
                    disabled={
                        page * curiosidades.data.page_size >
                        curiosidades.data.totalPage
                    }
                    onClick={goToNextPage}
                >
                    <div className="next-icon">
                        <MdNavigateNext />
                    </div>
                </button>
            </div>

            {curiosidades.isFetching && (
                <div>
                    <span>Cargando...</span>
                </div>
            )}
        </main>
    );
}
