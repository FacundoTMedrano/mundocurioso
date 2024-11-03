import { useParams } from "react-router-dom";
export default function AdminSearch() {
    const { search } = useParams();
    console.log(search);
    return <div>Search</div>;
}
