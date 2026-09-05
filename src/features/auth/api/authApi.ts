import { useQuery } from "@tanstack/react-query";
import api from "../../../utils/api";

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    store_id?: number | null;
}

export const useGetMeQuery = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const { data } = await api.get<User>('users/me');
            return data;
        },
        enabled,
        retry: false,
        staleTime: Infinity, // Persistent throughout session
    });
};
