import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export interface Store {
    id: string;
    name: string;
    address: string;
    phone: string;
    prefix: string;
    tax_percentage?: number;
    service_charge_percentage?: number;
    logo_url?: string;
    banner_url?: string;
    opening_time?: string;
    closing_time?: string;
    has_pos: boolean;
    has_kds: boolean;
    is_active: boolean;
}

export interface StoreFormValues {
    name: string;
    address: string;
    phone: string;
    prefix: string;
    tax_percentage?: number;
    service_charge_percentage?: number;
    logo_url?: string;
    banner_url?: string;
    logo_file?: File | null;
    banner_file?: File | null;
    opening_time?: string;
    closing_time?: string;
    has_pos?: boolean;
    has_kds?: boolean;
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

export const useStore = (id: string) => {
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
            const { logo_file, banner_file, ...rest } = data;
            const { data: store } = await api.post<Store>('/stores/', rest);

            let updated = false;

            if (logo_file) {
                const formData = new FormData();
                formData.append('file', logo_file);
                const { data: assetRes } = await api.post(`/assets/Store/${store.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                store.logo_url = assetRes.asset.url;
                updated = true;
            }

            if (banner_file) {
                const formData = new FormData();
                formData.append('file', banner_file);
                const { data: assetRes } = await api.post(`/assets/Store/${store.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                store.banner_url = assetRes.asset.url;
                updated = true;
            }

            if (updated) {
                await api.put(`/stores/${store.id}`, {
                    logo_url: store.logo_url,
                    banner_url: store.banner_url
                });
            }

            return store;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stores'] });
        },
    });
};

export const useUpdateStore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<StoreFormValues> }) => {
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
        mutationFn: async (id: string) => {
            await api.delete(`/stores/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stores'] });
        },
    });
}
