import useAuth from "./useAuth";
import { axiosPublic } from "../services/api";

export default function useRefresh() {
    const { setAuth } = useAuth();
    async function refresh() {
        try {
            const { data } = await axiosPublic("/auth/refresh", {
                withCredentials: true,
            });
            setAuth(data); // accessToken, id
            return data?.accessToken;
        } catch (error) {
            throw Error(`error en el refresh ${error.message}`);
        }
    }
    return refresh;
}
