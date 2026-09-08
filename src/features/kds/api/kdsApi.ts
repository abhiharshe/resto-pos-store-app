import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { OrderItem } from '../../orders/api/ordersApi';

export type OrderItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';

export interface UpdateItemStatusParams {
    orderItemId: string;
    status: OrderItemStatus;
}

export const useUpdateOrderItemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderItemId, status }: UpdateItemStatusParams) => {
            const { data } = await api.patch<OrderItem>(`/orders/items/${orderItemId}/status?status=${status}`);
            return data;
        },
        onSuccess: () => {
            // Invalidate orders and kds related queries
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            // Optionally update cache directly if we had a specific KDS query
        },
    });
};
