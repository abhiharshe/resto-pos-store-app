import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export interface Store {
    id: number;
    name: string;
    address: string;
    phone: string;
    currency?: string;
    tax_percentage?: number;
    service_charge_percentage?: number;
    logo_url?: string;
    opening_time?: string;
    closing_time?: string;
    is_active: boolean;
}

export interface StoreFormValues {
    name: string;
    address: string;
    phone: string;
    currency?: string;
    tax_percentage?: number;
    service_charge_percentage?: number;
    logo_url?: string;
    opening_time?: string;
    closing_time?: string;
    is_active?: boolean;
}

export const useStores = () => {
    return useQuery({
        queryKey: ['stores'],
        queryFn: async () => {
            const { data } = await api.get<Store[]>('/stores/');
            return data;
        },
    });
};

export const useStore = (id: number) => {
    return useQuery({
        queryKey: ['stores', id],
        queryFn: async () => {
            const { data } = await api.get<Store>(`/stores/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCreateStore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: StoreFormValues) => {
            const { data: responseData } = await api.post<Store>('/stores/', data);
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stores'] });
        },
    });
};

export const useUpdateStore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<StoreFormValues> }) => {
            const { data: responseData } = await api.put<Store>(`/stores/${id}`, data);
            return responseData;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['stores'] });
            queryClient.invalidateQueries({ queryKey: ['stores', data.id] });
        },
    });
};

export const useDeleteStore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/stores/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stores'] });
        },
    });
}
