import { useParams } from "react-router-dom";
export default function Search() {
    const { search } = useParams();
    console.log(search);
    return <div>Search</div>;
}
