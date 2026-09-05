import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    store_id?: string | null;
    avatar?: {
        id: string;
        storage_key: string;
        url?: string;
        variants?: {
            thumbnail?: string;
            medium?: string;
            large?: string;
        };
    } | null;
}

export interface UserCreate {
    email: string;
    full_name: string;
    password?: string;
    role: string;
    store_id?: string | null;
}

export interface UserUpdate {
    email?: string;
    full_name?: string;
    password?: string;
    role?: string;
    store_id?: string | null;
    is_active?: boolean;
}

export interface UserUpdateMe {
    full_name?: string;
    email?: string;
}

export interface ChangePassword {
    current_password: string;
    new_password: string;
}

export interface UserFilters {
    full_name?: string;
    role?: string;
    store_id?: string | string;
}

export const useUsers = (filters?: UserFilters) => {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: async () => {
            const params = filters ? Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
            ) : {};

            const { data } = await api.get<User[]>('/users/', { params });
            return data;
        },
    });
};

export const useMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const { data } = await api.get<User>('/users/me');
            return data;
        },
    });
};

export const useUpdateMe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: UserUpdateMe) => {
            const { data } = await api.put<User>('/users/me', user);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: async (passwords: ChangePassword) => {
            const { data } = await api.post('/users/me/change-password', passwords);
            return data;
        },
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: UserCreate) => {
            const { data } = await api.post<User>('/users/', user);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...user }: UserUpdate & { id: string }) => {
            const { data } = await api.put<User>(`/users/${id}`, user);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete<User>(`/users/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export interface PasswordResetRequest {
    id: string;
    user_id: string;
    user?: User;
    store_id?: string | null;
    store?: {
        id: string;
        name: string;
    };
    status: 'PENDING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
    reason?: string | null;
    admin_id?: string | null;
    admin?: User;
    resolved_at?: string | null;
    created_at: string;
    updated_at?: string | null;
}

export interface PasswordResetRequestCreate {
    email: string;
    reason?: string;
}

export interface PasswordResetRequestFulfill {
    new_password: string;
    send_email: boolean;
}

export interface AdminDirectResetPassword {
    new_password: string;
    send_email: boolean;
}

export interface ResetPasswordResponse {
    message: string;
    temporary_password?: string;
    email_sent: boolean;
}

export const usePasswordResetRequests = (status?: string) => {
    return useQuery({
        queryKey: ['password-reset-requests', status],
        queryFn: async () => {
            const params = status ? { status } : {};
            const { data } = await api.get<PasswordResetRequest[]>('/users/password-reset-requests', { params });
            return data;
        },
    });
};

export const useFulfillPasswordResetRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestId, ...payload }: PasswordResetRequestFulfill & { requestId: string }) => {
            const { data } = await api.post<ResetPasswordResponse>(`/users/password-reset-requests/${requestId}/fulfill`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['password-reset-requests'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useRejectPasswordResetRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (requestId: string) => {
            const { data } = await api.post<PasswordResetRequest>(`/users/password-reset-requests/${requestId}/reject`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['password-reset-requests'] });
        },
    });
};

export const useAdminDirectResetPassword = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, ...payload }: AdminDirectResetPassword & { userId: string }) => {
            const { data } = await api.post<ResetPasswordResponse>(`/users/${userId}/admin-reset-password`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['password-reset-requests'] });
        },
    });
};

export const useRequestAdminReset = () => {
    return useMutation({
        mutationFn: async (payload: PasswordResetRequestCreate) => {
            const { data } = await api.post<{ message: string }>('/auth/request-admin-reset', payload);
            return data;
        },
    });
};

