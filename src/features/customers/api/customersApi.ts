import { useQuery } from '@tanstack/react-query';
import api from '../../../utils/api';
import { Order } from '../../orders/api/ordersApi';

export interface Customer {
    id: string;
    phone: string;
    full_name: string | null;
    email: string | null;
    is_active: boolean;
    created_at: string;
}

export interface TopProduct {
    menu_item_id: string;
    name: string;
    quantity: number;
    total_revenue: number;
}

export interface CustomerStats {
    total_orders: number;
    current_month_orders: number;
    last_month_orders: number;
    current_month_aov: number;
    last_month_aov: number;
    top_products: TopProduct[];
}

export const useCustomers = (skip = 0, limit = 100, filters: { full_name?: string, email?: string, phone?: string } = {}) => {
    return useQuery({
        queryKey: ['customers', skip, limit, filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('skip', skip.toString());
            params.append('limit', limit.toString());
            if (filters.full_name) params.append('full_name', filters.full_name);
            if (filters.email) params.append('email', filters.email);
            if (filters.phone) params.append('phone', filters.phone);

            const { data } = await api.get<Customer[]>(`/customers/?${params.toString()}`);
            return data;
        },
    });
};

export const useCustomer = (id: number) => {
    return useQuery({
        queryKey: ['customers', id],
        queryFn: async () => {
            const { data } = await api.get<Customer>(`/customers/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCustomerStats = (id: number) => {
    return useQuery({
        queryKey: ['customers', id, 'stats'],
        queryFn: async () => {
            const { data } = await api.get<CustomerStats>(`/customers/${id}/stats`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCustomerOrders = (id: number, skip = 0, limit = 10) => {
    return useQuery({
        queryKey: ['customers', id, 'orders', skip, limit],
        queryFn: async () => {
            const { data } = await api.get<Order[]>(`/customers/${id}/orders?skip=${skip}&limit=${limit}`);
            return data;
        },
        enabled: !!id,
    });
};
