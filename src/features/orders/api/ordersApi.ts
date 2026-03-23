import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { Store } from '../../stores/api/storesApi';

export interface OrderItem {
    id: number;
    menu_item_id: number;
    name: string;
    variant_name?: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    status: string;
    addons: { id: number; addon_id: number; price: number; name: string }[];
}

export interface Order {
    id: number;
    order_number?: string;
    total_amount: number;
    tax_amount: number;
    service_charge: number;
    discount_amount: number;
    status: string;
    order_type: string;
    payment_method: string;
    payment_status: string;
    created_at: string;
    guest_name?: string;
    guest_phone?: string;
    guest_address?: string;
    customer?: { full_name: string };
    items: OrderItem[];
    store: Store;
}

export interface OrderFilters {
    store_id?: number;
    status?: string;
    order_type?: string;
    payment_method?: string;
    from_date?: string;
    to_date?: string;
}

export const useOrders = (filters: OrderFilters) => {
    return useQuery({
        queryKey: ['orders', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.store_id) params.append('store_id', filters.store_id.toString());
            if (filters.status) params.append('status', filters.status);
            if (filters.order_type) params.append('order_type', filters.order_type);
            if (filters.payment_method) params.append('payment_method', filters.payment_method);
            if (filters.from_date) params.append('from_date', filters.from_date);
            if (filters.to_date) params.append('to_date', filters.to_date);

            const { data } = await api.get<Order[]>(`/orders/?${params.toString()}`);
            return data;
        },
        enabled: !!filters.store_id,
        // refetchInterval: 10000, // Poll every 10 seconds for new orders
    });
};

export const useOrder = (id: number) => {
    return useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const { data } = await api.get<Order>(`/orders/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const { data } = await api.patch<Order>(`/orders/${id}`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['store-stats'] });
        },
    });
};

export const useDeleteOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await api.delete(`/orders/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['store-stats'] });
        },
    });
};
