import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { MenuItem } from '../../menu/api/menuApi';

export type PromotionType = 'BXGY' | 'ITEM_DISCOUNT';

export interface Promotion {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    type: PromotionType;

    buy_item_id?: string;
    buy_quantity: number;

    get_item_id?: string;
    get_quantity: number;

    discount_percentage: number;

    max_applications: number;
    is_stackable: boolean;

    start_date?: string;
    end_date?: string;
    is_active: boolean;
    store_id?: string;
    approval_status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
    is_global?: boolean;

    buy_item?: MenuItem;
    get_item?: MenuItem;
}

export interface PromotionCreate {
    title: string;
    description?: string;
    image_url?: string;
    type: PromotionType;
    buy_item_id?: string;
    buy_quantity: number;
    get_item_id?: string;
    get_quantity: number;
    discount_percentage: number;
    max_applications: number;
    is_stackable: boolean;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    store_id?: string;
}

export const usePromotions = (params?: { store_id?: string; skip?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['promotions', params],
        queryFn: async () => {
            const { data } = await api.get<Promotion[]>('/promotions/', { params });
            return data;
        },
    });
};

export const useActivePromotions = (storeId?: string) => {
    return useQuery({
        queryKey: ['promotions', 'active', storeId],
        queryFn: async () => {
            const { data } = await api.get<Promotion[]>('/promotions/active', { params: { store_id: storeId } });
            return data;
        },
        enabled: !!storeId,
    });
};

export const usePromotion = (id?: string) => {
    return useQuery({
        queryKey: ['promotions', id],
        queryFn: async () => {
            const { data } = await api.get<Promotion>(`/promotions/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCreatePromotion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (promotion: PromotionCreate) => {
            const { data } = await api.post<Promotion>('/promotions/', promotion);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
        },
    });
};

export const useUpdatePromotion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...promotion }: Partial<Promotion> & { id: string }) => {
            const { data } = await api.patch<Promotion>(`/promotions/${id}`, promotion);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            queryClient.invalidateQueries({ queryKey: ['promotions', data.id] });
            queryClient.invalidateQueries({ queryKey: ['promotions', 'active'] });
        },
    });
};

export const useDeletePromotion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/promotions/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            queryClient.invalidateQueries({ queryKey: ['promotions', 'active'] });
        },
    });
};
