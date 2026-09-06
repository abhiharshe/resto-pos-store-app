import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../utils/api";

export type DeliveryChargeType = 'FIXED' | 'PER_KM';
export type ChargeSource = 'STORE' | 'GLOBAL' | 'NONE';

export interface DeliveryConfigResponse {
    source: ChargeSource;
    is_override: boolean;
    store_id?: string | null;
    charge_type: DeliveryChargeType;
    fixed_charge?: number;
    charge_per_km?: number;
    minimum_charge?: number;
    free_delivery_min_value?: number | null;
    is_active: boolean;
}

export interface DeliveryConfigPayload {
    charge_type: DeliveryChargeType;
    fixed_charge?: number;
    charge_per_km?: number;
    minimum_charge?: number;
    free_delivery_min_value?: number | null;
    is_active: boolean;
}

export interface PackagingRule {
    id?: string;
    min_order_value: number;
    max_order_value?: number | null;
    charge: number;
}

export interface PackagingConfigResponse {
    source: ChargeSource;
    is_override: boolean;
    store_id?: string | null;
    is_active: boolean;
    rules: PackagingRule[];
}

export interface PackagingConfigPayload {
    is_active: boolean;
    rules: PackagingRule[];
}

export interface OrderCalculationRequest {
    store_id: string;
    order_type: 'DINE_IN' | 'PICKUP' | 'DELIVERY';
    subtotal?: number;
    discount_amount?: number;
    distance_km?: number;
    coupon_code?: string;
}

export interface OrderCalculationResponse {
    subtotal: number;
    discount_amount: number;
    net_food_value: number;
    packaging_charge: number;
    packaging_charge_source: string;
    delivery_charge: number;
    delivery_charge_source: string;
    service_charge: number;
    tax_amount: number;
    total_amount: number;
}

// ==========================================
// GLOBAL CHARGES HOOKS
// ==========================================

export const useGetGlobalDeliveryConfig = () => {
    return useQuery({
        queryKey: ['charges', 'delivery', 'global'],
        queryFn: async () => {
            const { data } = await api.get<DeliveryConfigResponse>('charges/delivery/global');
            return data;
        },
    });
};

export const useUpdateGlobalDeliveryConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: DeliveryConfigPayload) => {
            const { data } = await api.put('charges/delivery/global', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['charges', 'delivery'] });
        },
    });
};

export const useGetGlobalPackagingConfig = () => {
    return useQuery({
        queryKey: ['charges', 'packaging', 'global'],
        queryFn: async () => {
            const { data } = await api.get<PackagingConfigResponse>('charges/packaging/global');
            return data;
        },
    });
};

export const useUpdateGlobalPackagingConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: PackagingConfigPayload) => {
            const { data } = await api.put('charges/packaging/global', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['charges', 'packaging'] });
        },
    });
};

// ==========================================
// STORE-SPECIFIC CHARGES HOOKS
// ==========================================

export const useGetStoreDeliveryConfig = (storeId?: string) => {
    return useQuery({
        queryKey: ['charges', 'delivery', 'store', storeId],
        queryFn: async () => {
            if (!storeId) return null;
            const { data } = await api.get<DeliveryConfigResponse>(`stores/${storeId}/delivery-charge`);
            return data;
        },
        enabled: Boolean(storeId),
    });
};

export const useUpdateStoreDeliveryConfig = (storeId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: DeliveryConfigPayload) => {
            if (!storeId) throw new Error("Store ID is required");
            const { data } = await api.put(`stores/${storeId}/delivery-charge`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['charges', 'delivery'] });
        },
    });
};

export const useDeleteStoreDeliveryConfig = (storeId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            if (!storeId) throw new Error("Store ID is required");
            const { data } = await api.delete(`stores/${storeId}/delivery-charge`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['charges', 'delivery'] });
        },
    });
};

export const useGetStorePackagingConfig = (storeId?: string) => {
    return useQuery({
        queryKey: ['charges', 'packaging', 'store', storeId],
        queryFn: async () => {
            if (!storeId) return null;
            const { data } = await api.get<PackagingConfigResponse>(`stores/${storeId}/packaging-charge`);
            return data;
        },
        enabled: Boolean(storeId),
    });
};

export const useUpdateStorePackagingConfig = (storeId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: PackagingConfigPayload) => {
            if (!storeId) throw new Error("Store ID is required");
            const { data } = await api.put(`stores/${storeId}/packaging-charge`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['charges', 'packaging'] });
        },
    });
};

export const useDeleteStorePackagingConfig = (storeId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            if (!storeId) throw new Error("Store ID is required");
            const { data } = await api.delete(`stores/${storeId}/packaging-charge`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['charges', 'packaging'] });
        },
    });
};

// ==========================================
// ORDER CALCULATION PREVIEW HOOK
// ==========================================

export const useCalculateOrderPreview = () => {
    return useMutation({
        mutationFn: async (payload: OrderCalculationRequest) => {
            const { data } = await api.post<OrderCalculationResponse>('charges/calculate', payload);
            return data;
        },
    });
};
