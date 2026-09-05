import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { Store } from '../../stores/api/storesApi';

export interface OrderItem {
    id: string;
    menu_item_id: string;
    name: string;
    variant_name?: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    status: string;
    addons: { id: string; addon_id: string; price: number; name: string }[];
    order_deal_id?: string;
    deal_selection_group_id?: string;
}

export interface OrderDeal {
    id: string;
    deal_id: string;
    deal_name: string;
    base_price: number;
    total_price: number;
    items: OrderItem[];
}

export interface Order {
    id: string;
    order_number?: string;
    subtotal?: number;
    sub_total?: number;
    total_amount: number;
    tax_amount: number;
    service_charge: number;
    discount_amount: number;
    cash_received?: number;
    change_amount?: number;
    change?: number;
    applied_coupon_code?: string;
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
    deals: OrderDeal[];
    store: Store;
}

export interface OrderFilters {
    store_id?: string;
    status?: string;
    order_type?: string;
    payment_method?: string;
    payment_status?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
}

export const useOrders = (filters: OrderFilters) => {
    return useQuery({
        queryKey: ['orders', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.store_id) params.append('store_id', filters.store_id);
            if (filters.status) params.append('status', filters.status);
            if (filters.order_type) params.append('order_type', filters.order_type);
            if (filters.payment_method) params.append('payment_method', filters.payment_method);
            if (filters.payment_status) params.append('payment_status', filters.payment_status);
            if (filters.search) params.append('search', filters.search);
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);

            const { data } = await api.get<Order[]>(`/orders/?${params.toString()}`);
            return data;
        },
        // refetchInterval: 10000, // Poll every 10 seconds for new orders
    });
};

export const useOrder = (id: string) => {
    return useQuery({
        queryKey: ['orders', id],
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
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
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
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/orders/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['store-stats'] });
        },
    });
};

export interface OrderCreateData {
    store_id: string;
    order_type: string;
    payment_method: string;
    status: string;
    customer_id?: number;
    guest_name?: string;
    guest_phone?: string;
    guest_address?: string;
    subtotal?: number;
    sub_total?: number;
    tax_amount?: number;
    total_amount?: number;
    cash_received?: number;
    change_amount?: number;
    change?: number;
    items: {
        menu_item_id: string;
        variant_id: string;
        quantity: number;
        addons: { addon_id: string }[];
    }[];
    deals: {
        deal_id: string;
        items: {
            menu_item_id: string;
            variant_id: string;
            quantity: number;
            addons: { addon_id: string }[];
            deal_selection_group_id?: string;
        }[];
    }[];
    coupon_code?: string;
}

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (orderData: OrderCreateData) => {
            const { data } = await api.post<Order>('/orders/', orderData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['store-stats'] });
        },
    });
};
