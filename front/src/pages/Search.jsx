import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { axiosPublic } from "../services/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import CuriosidadesGrid from "../components/CuriosidadesGrid";
import { IoIosSearch } from "react-icons/io";

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);

    const curiosidades = useQuery({
        queryKey: ["curiosidades", { search, page }],
        queryFn: async () => {
            let url =
                search === "" ? `curiosidades/vertodo` : `curiosidades/search`;
            console.log(search, url);
            const { data } = await axiosPublic(url, {
                params: { search, page, page_size: 10 },
            });
            console.log(data);

            return data;
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });

    const [inputQuery, setInputQuery] = useState(search);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setSearchParams({ search: inputQuery, page: 1 });
        }
    };

    function goToNextPage() {
        setSearchParams({ search: inputQuery, page: page + 1 });
    }

    function goToPreviousPage() {
        setSearchParams({ search: inputQuery, page: page - 1 });
    }

    if (curiosidades.isLoading) {
        return <p>cargando</p>;
    }
    if (curiosidades.isError) {
        return <p>error al cargar los datos</p>;
    }

    return (
        <main className="search-page">
            <h2>Buscar</h2>
            <div className="buscador">
                <label htmlFor="buscador-search-page" className="lupa">
                    <IoIosSearch />
                </label>
                <div className="input-div">
                    <input
                        id="buscador-search-page"
                        type="text"
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            </div>
            <h3>{search}</h3>
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
            {curiosidades.isFetching && <span>Cargando...</span>}
        </main>
    );
}
