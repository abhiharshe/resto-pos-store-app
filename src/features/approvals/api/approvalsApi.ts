import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export type ApprovalEntityType = 'MENU_ITEM' | 'CATEGORY' | 'COUPON' | 'PROMOTION' | 'DEAL';
export type ApprovalAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequest {
    id: string;
    entity_type: ApprovalEntityType;
    entity_id?: string;
    store_id: string;
    action: ApprovalAction;
    status: ApprovalStatus;
    proposed_changes: Record<string, any>;
    current_data?: Record<string, any>;
    submitted_by: string;
    reviewed_by?: string;
    reviewed_at?: string;
    rejection_reason?: string;
    created_at?: string;
    updated_at?: string;
    store_name?: string;
    submitter_name?: string;
    reviewer_name?: string;
    entity_name?: string;
}

export interface ApprovalStats {
    total_pending: number;
    menu_items_pending: number;
    categories_pending: number;
    coupons_pending: number;
    promotions_pending: number;
    deals_pending: number;
}

export interface ApprovalReviewPayload {
    rejection_reason?: string;
}

export const useApprovalStats = (store_id?: string) => {
    return useQuery<ApprovalStats>({
        queryKey: ['approval-stats', store_id],
        queryFn: async () => {
            const { data } = await api.get<ApprovalStats>('/approvals/stats', {
                params: store_id ? { store_id } : undefined,
            });
            return data;
        },
        refetchInterval: 30000,
    });
};

export const useApprovals = (params?: {
    store_id?: string;
    entity_type?: string;
    status?: string;
    skip?: number;
    limit?: number;
}) => {
    return useQuery<ApprovalRequest[]>({
        queryKey: ['approvals', params],
        queryFn: async () => {
            const { data } = await api.get<ApprovalRequest[]>('/approvals/', { params });
            return data;
        },
    });
};

export const useApproval = (id: string) => {
    return useQuery<ApprovalRequest>({
        queryKey: ['approval', id],
        queryFn: async () => {
            const { data } = await api.get<ApprovalRequest>(`/approvals/${id}`);
            return data;
        },
        enabled: Boolean(id),
    });
};

export const useApproveRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.post<ApprovalRequest>(`/approvals/${id}/approve`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
            queryClient.invalidateQueries({ queryKey: ['approval-stats'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            queryClient.invalidateQueries({ queryKey: ['deals'] });
        },
    });
};

export const useRejectRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, rejection_reason }: { id: string; rejection_reason?: string }) => {
            const { data } = await api.post<ApprovalRequest>(`/approvals/${id}/reject`, {
                status: 'REJECTED',
                rejection_reason,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
            queryClient.invalidateQueries({ queryKey: ['approval-stats'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            queryClient.invalidateQueries({ queryKey: ['deals'] });
        },
    });
};
