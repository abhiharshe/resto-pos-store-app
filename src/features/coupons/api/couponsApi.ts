import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export type DiscountType = 'FLAT' | 'PERCENTAGE';

export interface Coupon {
    id: string;
    code: string;
    description?: string;
    discount_type: DiscountType;
    discount_value: number;
    max_discount_amount?: number;
    min_order_amount: number;
    is_first_order_only: boolean;
    usage_limit_per_user: number;
    total_usage_limit?: number;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    store_id?: string;
    approval_status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
    is_global?: boolean;
    created_at: string;
}

export interface CouponCreate {
    code: string;
    description?: string;
    discount_type: DiscountType;
    discount_value: number;
    max_discount_amount?: number;
    min_order_amount?: number;
    is_first_order_only?: boolean;
    usage_limit_per_user?: number;
    total_usage_limit?: number;
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
    store_id?: string;
}

export interface CouponValidateRequest {
    code: string;
    store_id: string;
    subtotal: number;
    customer_phone?: string;
}

export interface CouponValidateResponse {
    is_valid: boolean;
    discount_amount: number;
    message: string;
    coupon?: Coupon;
}

export const useCoupons = (params?: { store_id?: number; skip?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['coupons', params],
        queryFn: async () => {
            const { data } = await api.get<Coupon[]>('/coupons/', { params });
            return data;
        },
    });
};

export const useCoupon = (id: number) => {
    return useQuery({
        queryKey: ['coupons', id],
        queryFn: async () => {
            const { data } = await api.get<Coupon>(`/coupons/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCreateCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (coupon: CouponCreate) => {
            const { data } = await api.post<Coupon>('/coupons/', coupon);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
        },
    });
};

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...coupon }: Partial<Coupon> & { id: number }) => {
            const { data } = await api.patch<Coupon>(`/coupons/${id}`, coupon);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            queryClient.invalidateQueries({ queryKey: ['coupons', data.id] });
        },
    });
};

export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/coupons/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
        },
    });
};

export const useValidateCoupon = () => {
    return useMutation({
        mutationFn: async (params: CouponValidateRequest) => {
            const { data } = await api.post<CouponValidateResponse>('/coupons/validate', params);
            return data;
        },
    });
};
