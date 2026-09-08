import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export interface PermissionModule {
    key: string;
    name: string;
    category: string;
    description: string;
}

export interface RolePermission {
    role: string;
    permissions: string[];
    updated_at?: string;
}

export interface UserEffectivePermissions {
    user_id: string;
    role: string;
    permissions: string[];
    custom_permissions?: string[] | null;
}

export const usePermissionModules = () => {
    return useQuery({
        queryKey: ['permissions', 'modules'],
        queryFn: async () => {
            const { data } = await api.get<PermissionModule[]>('/permissions/modules');
            return data;
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
};

export const useRolePermissions = () => {
    return useQuery({
        queryKey: ['permissions', 'roles'],
        queryFn: async () => {
            const { data } = await api.get<RolePermission[]>('/permissions/roles');
            return data;
        },
    });
};

export const useUpdateRolePermissions = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ role, permissions }: { role: string; permissions: string[] }) => {
            const { data } = await api.put<RolePermission>(`/permissions/roles/${role}`, { permissions });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions', 'roles'] });
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        },
    });
};

export const useUserPermissions = (userId: string) => {
    return useQuery({
        queryKey: ['permissions', 'users', userId],
        queryFn: async () => {
            const { data } = await api.get<UserEffectivePermissions>(`/permissions/users/${userId}`);
            return data;
        },
        enabled: !!userId,
    });
};

export const useUpdateUserCustomPermissions = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, custom_permissions }: { userId: string; custom_permissions: string[] | null }) => {
            const { data } = await api.put<UserEffectivePermissions>(`/permissions/users/${userId}`, {
                custom_permissions,
            });
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['permissions', 'users', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        },
    });
};
