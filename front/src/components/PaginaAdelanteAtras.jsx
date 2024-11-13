import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { useSearchParams } from "react-router-dom";

export default function PaginaAdelanteAtras({
    next,
    back,
    page,
    page_size,
    totalPage,
}) {
    const [_, setSearchParams] = useSearchParams;
    
    return (
        <div>
            <button disabled={page === 1} onClick={goToPreviousPage}>
                <MdNavigateBefore />
            </button>
            <p>{page}</p>
            <button
                disabled={
                    page * curiosidades.data.page_size >
                    curiosidades.data.totalPage
                }
                onClick={goToNextPage}
            >
                <MdNavigateNext />
            </button>
        </div>
    );
}

// PaginaAdelanteAtras.propTypes = {
//     next: PropTypes.string,
//     back: PropTypes.string,
//     page: PropTypes.string,
//     page_size: PropTypes.string,
//     totalPage: PropTypes.string,
// };
