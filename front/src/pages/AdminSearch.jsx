import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosPublic } from "../services/api";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import CuriosidadesGridAdmin from "../components/CuriosidadesGridAdmin";

export default function AdminSearch() {
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);

    console.log(search, page);

    const curiosidades = useQuery({
        queryKey: ["curiosidades", { search, page }],
        queryFn: async () => {
            let url =
                search === "" ? `curiosidades/vertodo` : `curiosidades/search`;
            const result = await axiosPublic(url, {
                params: { search, page, page_size: 10 },
            });
            return result.data;
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });

    function goToNextPage() {
        setSearchParams({ search, page: page + 1 });
    }

    function goToPreviousPage() {
        setSearchParams({ search, page: page - 1 });
    }

    if (curiosidades.isLoading) {
        return <p>loading...</p>;
    }

    if (curiosidades.isError) {
        return <p>Error</p>;
    }

    return (
        <main>
            <h2>{search.replaceAll("-", " ")}</h2>
            <CuriosidadesGridAdmin
                invalidateArray={["curiosidades", { search, page }]}
                curiosidades={curiosidades.data.curiosidades}
            />
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
            {curiosidades.isFetching && <span>Cargando...</span>}
        </main>
    );
}
