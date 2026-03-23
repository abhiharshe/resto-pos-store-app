import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../utils/api";

export interface SelectedAddon {
    id: number;
    name: string;
    price: number;
}

export interface MenuItemVariant {
    id: number;
    name: string;
    price: number;
    is_serving: boolean;
}

export interface MenuItemProps {
    id: number;
    category_id: number;
    name: string;
    description?: string;
    variants: MenuItemVariant[];
    is_active: boolean;
    images?: { id: number; image_url: string; menu_item_id: number }[],
    addon_groups?: { id: number; name: string; min_selection: number; max_selection: number; addons: { id: number; name: string; price: number }[] }[],
    category?: {
        id: number;
        menu_id: number;
        name: string;
        image_url?: string;
        is_active: boolean;
        menu?: {
            id: number;
            title: string;
            serving_from: string;
            serving_to: string;
            is_active: boolean;
        };
    };
}

export interface MenuCategoryProps {
    id: number;
    menu_id: number;
    name: string;
    image_url?: string;
    is_active: boolean;
    items?: {
        id: number;
        name: string;
        category_id: number;
        description?: string;
        images?: { id: number; image_url: string; menu_item_id: number }[],
        addon_groups?: { id: number; name: string; min_selection: number; max_selection: number; addons: { id: number; name: string; price: number }[] }[],
    }[];
}

export interface MenuProps {
    id: number;
    title: string;
    serving_from: string;
    serving_to: string;
    is_active: boolean;
    categories?: MenuCategoryProps[];
}

export interface OrderItemCreate {
    menu_item_id: number;
    variant_id: number;
    quantity: number;
    addons: { addon_id: number }[];
}

export interface OrderCreate {
    store_id: number;
    order_type: 'DINE_IN' | 'PICKUP' | 'DELIVERY';
    payment_method: 'CASH' | 'CARD' | 'ONLINE';
    status?: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
    customer_id?: number | null;
    guest_name?: string;
    guest_phone?: string;
    guest_address?: string;
    items: OrderItemCreate[];
}

export interface OrderResponse {
    id: number;
    store_id: number;
    total_amount: number;
    status: string;
    order_type: string;
    payment_method: string;
    guest_name?: string;
    guest_phone?: string;
    guest_address?: string;
    items: any[];
}

export interface StoreResponse {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    is_active: boolean;
}

export const useStoreFrontMenus = () => {
    return useQuery({
        queryKey: ['store-front-menus'],
        queryFn: async () => {
            const { data } = await api.get<MenuProps[]>('store-front/menu/');
            return data;
        },
    });
};

export const useStoreFrontMenuCategories = (params?: { q?: string }) => {
    return useQuery({
        queryKey: ['store-front-menu-categories', params],
        queryFn: async () => {
            const { data } = await api.get<MenuCategoryProps[]>('store-front/menu/categories', { params });
            return data;
        },
    });
};

export const useStoreFrontMenuItems = (params?: { menu_id?: number; category_id?: number; q?: string }) => {
    return useQuery({
        queryKey: ['store-front-menu-items', params],
        queryFn: async () => {
            const { data } = await api.get<MenuItemProps[]>('store-front/menu/items/', { params });
            return data;
        },
    });
};

export const useOrders = (params: { store_id: number; status?: string }) => {
    return useQuery({
        queryKey: ['orders', params],
        queryFn: async () => {
            const { data } = await api.get<OrderResponse[]>('orders/', { params });
            return data;
        },
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (order: OrderCreate) => {
            const { data } = await api.post<OrderResponse>('orders/', order);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};

export const useStores = () => {
    return useQuery({
        queryKey: ['stores'],
        queryFn: async () => {
            const { data } = await api.get<StoreResponse[]>('stores/');
            return data;
        },
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ orderId, status, paymentStatus }: { orderId: number; status: string; paymentStatus?: string }) => {
            const { data } = await api.patch<OrderResponse>(`orders/${orderId}`, { status, payment_status: paymentStatus });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};