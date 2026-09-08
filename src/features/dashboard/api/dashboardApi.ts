import { useQuery } from '@tanstack/react-query';
import api from '../../../utils/api';

export interface RevenueBreakdown {
    subtotal: number;
    tax_amount: number;
    service_charge: number;
    discount_amount: number;
    delivery_charge: number;
    packaging_charge: number;
    total_amount: number;
}

export interface OrderStatusCount {
    status: string;
    count: number;
    revenue: number;
}

export interface SuperAdminDashboardSummary {
    total_revenue: number;
    revenue_growth_pct: number;
    total_orders: number;
    orders_growth_pct: number;
    average_ticket: number;
    average_ticket_growth_pct: number;
    total_stores: number;
    active_stores: number;
    total_customers: number;
    customers_growth_pct: number;
    orders_by_status: OrderStatusCount[];
    revenue_breakdown: RevenueBreakdown;
}

export interface RevenueTrendPoint {
    date: string;
    revenue: number;
    order_count: number;
    average_ticket: number;
}

export interface TopStoreStat {
    store_id: string;
    store_name: string;
    store_prefix: string;
    order_count: number;
    total_revenue: number;
    contribution_pct: number;
}

export interface SalesByOrderTypeStat {
    order_type: string;
    count: number;
    revenue: number;
    percentage: number;
}

export interface SalesByPaymentMethodStat {
    payment_method: string;
    count: number;
    revenue: number;
    percentage: number;
}

export interface SalesByItemStat {
    menu_item_id: string;
    menu_item_name: string;
    category_name?: string | null;
    quantity_sold: number;
    total_revenue: number;
}

export interface RecentOrderStat {
    id: string;
    order_number: string;
    store_id: string;
    store_name: string;
    guest_name?: string | null;
    total_amount: number;
    status: string;
    order_type: string;
    payment_method: string;
    created_at: string;
}

export interface ConfigurationStepStatus {
    id: string;
    name: string;
    category: string;
    description: string;
    is_configured: boolean;
    count: number;
    redirect_url: string;
    details?: string | null;
}

export interface SystemConfigurationStatusResponse {
    overall_progress_pct: number;
    total_steps: number;
    completed_steps: number;
    steps: ConfigurationStepStatus[];
}

export interface SuperAdminDashboardResponse {
    start_date: string;
    end_date: string;
    store_id?: string | null;
    summary: SuperAdminDashboardSummary;
    configuration_status?: SystemConfigurationStatusResponse | null;
    revenue_trend: RevenueTrendPoint[];
    top_stores: TopStoreStat[];
    sales_by_order_type: SalesByOrderTypeStat[];
    sales_by_payment_method: SalesByPaymentMethodStat[];
    top_selling_items: SalesByItemStat[];
    recent_orders: RecentOrderStat[];
}

export interface DashboardFilterParams {
    startDate?: string | null;
    endDate?: string | null;
    storeId?: string | null;
}

export const useSuperAdminDashboard = (params?: DashboardFilterParams) => {
    return useQuery({
        queryKey: ['superadmin-dashboard', params?.startDate, params?.endDate, params?.storeId],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params?.startDate) {
                searchParams.append('start_date', params.startDate);
            }
            if (params?.endDate) {
                searchParams.append('end_date', params.endDate);
            }
            if (params?.storeId && params.storeId !== 'all') {
                searchParams.append('store_id', params.storeId);
            }

            const qs = searchParams.toString();
            const url = `/dashboard/superadmin${qs ? `?${qs}` : ''}`;
            const { data } = await api.get<SuperAdminDashboardResponse>(url);
            return data;
        },
        refetchInterval: 60000, // Background poll every 60s
    });
};

export interface StoreStats {
    total_revenue: number;
    total_orders: number;
    pending_orders: number;
    date: string;
}

export const useStoreStats = (storeId?: string | number) => {
    return useQuery({
        queryKey: ['store-stats', storeId],
        queryFn: async () => {
            if (!storeId) return null;
            const { data } = await api.get<StoreStats>(`/orders/stats/today?store_id=${storeId}`);
            return data;
        },
        enabled: !!storeId,
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};
