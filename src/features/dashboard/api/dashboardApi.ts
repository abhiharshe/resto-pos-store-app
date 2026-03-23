import { useQuery } from '@tanstack/react-query';
import api from '../../../utils/api';

export interface StoreStats {
    total_revenue: number;
    total_orders: number;
    pending_orders: number;
    date: string;
}

export const useStoreStats = (storeId?: number) => {
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
