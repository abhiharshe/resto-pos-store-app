import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../utils/api";

export interface SelectedAddon {
    id: string;
    name: string;
    price: number;
    quantity?: number;
}

export interface MenuItemVariant {
    id: string;
    name: string;
    price: number;
    is_serving: boolean;
    store_prices?: { id: string; store_id: string; price: number }[];
}

export interface MenuItemProps {
    id: string;
    category_id: string;
    name: string;
    description?: string;
    variants: MenuItemVariant[];
    is_active: boolean;
    images?: { id: string; image_url: string; menu_item_id: number }[],
    addon_groups?: { id: string; name: string; min_selection: number; max_selection: number; max_quantity_per_addon?: number; addons: { id: string; name: string; price: number }[] }[],
    category?: {
        id: string;
        menu_id: string;
        name: string;
        image_url?: string;
        is_active: boolean;
        menu?: {
            id: string;
            title: string;
            serving_from: string;
            serving_to: string;
            is_active: boolean;
        };
    };
}

export interface MenuCategoryProps {
    id: string;
    menu_id: string;
    name: string;
    image_url?: string;
    is_active: boolean;
    items?: {
        id: string;
        name: string;
        category_id: string;
        description?: string;
        images?: { id: string; image_url: string; menu_item_id: number }[],
        addon_groups?: { id: string; name: string; min_selection: number; max_selection: number; max_quantity_per_addon?: number; addons: { id: string; name: string; price: number }[] }[],
    }[];
}

export interface MenuProps {
    id: string;
    title: string;
    serving_from: string;
    serving_to: string;
    is_active: boolean;
    categories?: MenuCategoryProps[];
}

export interface DealSelectionOption {
    id: string;
    group_id: string;
    menu_item_id: string;
    variant_id: string;
    additional_price: number;
    is_default: boolean;
    menu_item?: MenuItemProps;
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

export interface Deal {
    id: string;
    title: string;
    description?: string;
    is_active: boolean;
    images: { id: string; image_url: string }[];
    store_prices: { id: string; store_id: string; price: number }[];
    selection_groups: DealSelectionGroup[];
}

export interface OrderItemCreate {
    menu_item_id?: string;
    variant_id?: string;
    quantity: number;
    addons: { addon_id: string }[];
    order_deal_id?: string;
    deal_selection_group_id?: string | number;
    deal_selection_option_id?: string | number;
}

export interface OrderDealCreate {
    deal_id: string;
    items: OrderItemCreate[];
}

export interface OrderCreate {
    store_id: string;
    order_type: 'DINE_IN' | 'PICKUP' | 'DELIVERY';
    payment_method: 'CASH' | 'CARD' | 'ONLINE';
    status?: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
    customer_id?: number | null;
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
    items: OrderItemCreate[];
    deals?: OrderDealCreate[];
    coupon_code?: string;
}

export interface OrderResponse {
    id: string;
    store_id: string;
    subtotal?: number;
    sub_total?: number;
    tax_amount?: number;
    total_amount: number;
    cash_received?: number;
    change_amount?: number;
    change?: number;
    status: string;
    order_type: string;
    payment_method: string;
    guest_name?: string;
    guest_phone?: string;
    guest_address?: string;
    items: any[];
}

export interface StoreResponse {
    id: string;
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

export const useStoreFrontMenuItems = (params?: { menu_id?: string; category_id?: string; q?: string }) => {
    return useQuery({
        queryKey: ['store-front-menu-items', params],
        queryFn: async () => {
            const { data } = await api.get<MenuItemProps[]>('store-front/menu/items/', { params });
            return data;
        },
    });
};

export const useStoreFrontDeals = (params?: { store_id?: string; q?: string }) => {
    return useQuery({
        queryKey: ['store-front-deals', params],
        queryFn: async () => {
            const { data } = await api.get<Deal[]>('menu/deals/', { params });
            return data;
        },
    });
};

export const useOrders = (params: { store_id: string; status?: string }) => {
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
        mutationFn: async ({ orderId, status, paymentStatus }: { orderId: string; status: string; paymentStatus?: string }) => {
            const { data } = await api.patch<OrderResponse>(`orders/${orderId}`, { status, payment_status: paymentStatus });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};