import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { MenuItem, MenuItemVariant } from '../../menu/api/menuApi';

export interface DealSelectionOption {
    id: string;
    group_id: string;
    menu_item_id: string;
    variant_id: string;
    additional_price: number;
    is_default: boolean;
    menu_item?: MenuItem;
    variant?: MenuItemVariant;
}

export interface DealSelectionGroup {
    id: string;
    deal_id: string;
    name: string;
    min_selection: number;
    max_selection: number;
    is_required: boolean;
    options: DealSelectionOption[];
}

export interface DealImage {
    id?: number;
    image_url: string;
}

export interface DealStorePrice {
    id?: number;
    store_id: string;
    price: number;
    is_active: boolean;
    store?: { name: string };
}

export interface Deal {
    id: string;
    title: string;
    description?: string;
    is_active: boolean;
    assets: any[];
    featured_image?: string;
    store_prices: DealStorePrice[];
    selection_groups: DealSelectionGroup[];
}

export interface DealCreate {
    title: string;
    description?: string;
    is_active: boolean;
    store_prices: { store_id: string; price: number; is_active: boolean }[];
    selection_groups: {
        name: string;
        min_selection: number;
        max_selection: number;
        is_required: boolean;
        options: {
            menu_item_id: string;
            variant_id: string;
            additional_price: number;
            is_default: boolean;
        }[];
    }[];
}

export const useDeals = (params?: { store_id?: string; is_active?: boolean; q?: string }) => {
    return useQuery({
        queryKey: ['deals', params],
        queryFn: async () => {
            const { data } = await api.get<Deal[]>('/menu/deals/', { params });
            return data;
        },
    });
};

export const useDeal = (id?: string) => {
    return useQuery({
        queryKey: ['deals', id],
        queryFn: async () => {
            const { data } = await api.get<Deal>(`/menu/deals/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCreateDeal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (deal: DealCreate) => {
            const { data } = await api.post<Deal>('/menu/deals/', deal);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
        },
    });
};

export const useUpdateDeal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, deal }: { id: string; deal: DealCreate }) => {
            // Explicitly send only the clean DealCreate payload, not the full Deal response object.
            // This prevents sending nested response-only fields (store, menu_item, variant, etc.)
            // that the backend DealUpdate schema does not accept.
            const payload: DealCreate = {
                title: deal.title,
                description: deal.description,
                is_active: deal.is_active,
                store_prices: deal.store_prices.map(sp => ({
                    store_id: sp.store_id,
                    price: sp.price,
                    is_active: sp.is_active,
                })),
                selection_groups: deal.selection_groups.map(g => ({
                    name: g.name,
                    min_selection: g.min_selection,
                    max_selection: g.max_selection,
                    is_required: g.is_required,
                    options: g.options.map(o => ({
                        menu_item_id: o.menu_item_id,
                        variant_id: o.variant_id,
                        additional_price: o.additional_price,
                        is_default: o.is_default,
                    })),
                })),
            };
            const { data } = await api.patch<Deal>(`/menu/deals/${id}`, payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            queryClient.invalidateQueries({ queryKey: ['deals', data.id] });
        },
    });
};

export interface DealItemsUpdate {
    selection_groups: DealCreate['selection_groups'];
}

export const useUpdateDealItems = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, items }: { id: string; items: DealItemsUpdate }) => {
            const { data } = await api.patch<Deal>(`/menu/deals/${id}/selection-groups`, items);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            queryClient.invalidateQueries({ queryKey: ['deals', data.id] });
        },
    });
};

export const useDeleteDeal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/menu/deals/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
        },
    });
};
