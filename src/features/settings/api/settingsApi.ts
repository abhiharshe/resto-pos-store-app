import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../utils/api";

export interface SettingResponse {
    id: number;
    logo_url?: string;
    favicon_url?: string;
    meta_info?: Record<string, any>;
    social_links?: Record<string, any>;
    receipt_logo_url?: string;
    receipt_header?: string;
    receipt_footer?: string;
    order_prefix?: string;
    order_success_email?: string;
    maintenance_mode?: boolean;
    pagination_records?: number;
}

export interface EmailSettingResponse {
    id: number;
    smtp_host?: string;
    smtp_port?: string;
    smtp_encryption?: string;
    smtp_username?: string;
    smtp_password?: string;
    smtp_from_email?: string;
}

export const useGetSettingsQuery = () => {
    return useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const { data } = await api.get<SettingResponse>('settings/');
            return data;
        },
    });
};

export const useUpdateSettingsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (settingsData: Partial<SettingResponse>) => {
            const { data } = await api.put<SettingResponse>('settings/', settingsData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });
};

export const useUpdateGeneralSettingsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (settingsData: Partial<SettingResponse>) => {
            const { data } = await api.put<SettingResponse>('settings/general', settingsData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });
};

export const useUpdateOrderSettingsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (settingsData: Partial<SettingResponse>) => {
            const { data } = await api.put<SettingResponse>('settings/order', settingsData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });
};

export const useUpdateSystemSettingsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (settingsData: Partial<SettingResponse>) => {
            const { data } = await api.put<SettingResponse>('settings/system', settingsData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });
};

export const useGetEmailSettingsQuery = () => {
    return useQuery({
        queryKey: ['email-settings'],
        queryFn: async () => {
            const { data } = await api.get<EmailSettingResponse>('settings/email');
            return data;
        },
    });
};

export const useUpdateEmailSettingsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (emailData: Partial<EmailSettingResponse>) => {
            const { data } = await api.put<EmailSettingResponse>('settings/email', emailData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['email-settings'] });
        },
    });
};

export const useTestEmailMutation = () => {
    return useMutation({
        mutationFn: async (to_email: string) => {
            const { data } = await api.post<{ message: string }>(`settings/test-email?to_email=${encodeURIComponent(to_email)}`);
            return data;
        },
    });
};

export const useUploadSettingImageMutation = () => {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await api.post<{ url: string }>('uploads/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        },
    });
};
