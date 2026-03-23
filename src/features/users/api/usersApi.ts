import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    store_id?: number | null;
}

export interface UserCreate {
    email: string;
    full_name: string;
    password?: string;
    role: string;
    store_id?: number | null;
}

export interface UserUpdate {
    email?: string;
    full_name?: string;
    password?: string;
    role?: string;
    store_id?: number | null;
    is_active?: boolean;
}

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get<User[]>('/users/');
            return data;
        },
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: UserCreate) => {
            const { data } = await api.post<User>('/users/', user);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...user }: UserUpdate & { id: number }) => {
            const { data } = await api.put<User>(`/users/${id}`, user);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await api.delete<User>(`/users/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
