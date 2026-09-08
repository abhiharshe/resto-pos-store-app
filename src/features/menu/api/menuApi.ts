import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export interface Asset {
    id: string;
    storage_key: string;
    url?: string;
    status: 'pending' | 'ready' | 'error';
    variants?: {
        thumbnail?: string;
        medium?: string;
        large?: string;
    };
}

export interface Category {
    id: string;
    menu_id: string;
    name: string;
    store_id?: string;
    approval_status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
    is_global?: boolean;
    image?: Asset;
    items?: MenuItem[];
    menu?: Menu;
    is_active: boolean;
}

export interface MenuItemVariant {
    id?: string;
    menu_item_id?: string;
    name: string;
    price: number;
    is_serving: boolean;
    store_prices?: { id?: string; store_id: string; price: number; is_in_store?: boolean; is_website_app?: boolean; }[];
}

export interface MenuItem {
    id: string;
    category_id: string;
    name: string;
    description?: string;
    store_id?: string;
    approval_status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
    is_global?: boolean;
    variants?: MenuItemVariant[];
    is_active: boolean;
    is_pickup: boolean;
    is_dine_in: boolean;
    is_delivery: boolean;
    category?: Category;
    images?: { id: string; image_url: string }[]; // Legacy
    image_urls?: string[];
    gallery?: Asset[];
    featured_image?: Asset;
}

export interface Menu {
    id: string;
    title: string;
    serving_from: string;
    serving_to: string;
    is_active: boolean;
}

export const useMenus = () => {
    return useQuery<Menu[]>({
        queryKey: ['menus'],
        queryFn: async () => {
            const { data } = await api.get<Menu[]>('/menu/');
            return data;
        }
    });
};

export const useCreateMenu = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (menu: Omit<Menu, 'id'>) => {
            const { data } = await api.post<Menu>('/menu/', menu);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menus'] });
        }
    });
};

export const useUpdateMenu = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...menu }: Partial<Menu> & { id: string }) => {
            const { data } = await api.patch<Menu>(`/menu/${id}`, menu);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menus'] });
        }
    });
};

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get<Category[]>('/menu/categories/');
            return data;
        },
    });
};
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...category }: Partial<Category> & { id: string }) => {
            const { data } = await api.patch<Category>(`/menu/categories/${id}`, category);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (category: Partial<Category>) => {
            const { data } = await api.post<Category>('/menu/categories/', category);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUploadImage = () => {
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await api.post<{ url: string }>('/uploads/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        },
    });
};

export const useMenuItems = () => {
    return useQuery({
        queryKey: ['menu-items'],
        queryFn: async () => {
            const { data } = await api.get<MenuItem[]>('/menu/items/');
            return data;
        },
    });
};

export const useCreateMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (item: Partial<MenuItem> & { image_urls?: string[] }) => {
            const { data } = await api.post<MenuItem>('/menu/items/', item);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
        },
    });
};

export const useUpdateMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...item }: Partial<MenuItem> & { id: string; image_urls?: string[]; addon_group_ids?: string[] }) => {
            const { data } = await api.patch<MenuItem>(`/menu/items/${id}`, item);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
        },
    });
};
export interface Addon {
    id?: string;
    group_id?: string;
    name: string;
    price: number;
    is_default?: boolean;
}

export interface AddonGroup {
    id: string;
    name: string;
    min_selection: number;
    max_selection: number;
    max_quantity_per_addon?: number;
    addons: Addon[];
}

export const useAddonGroups = () => {
    return useQuery<AddonGroup[]>({
        queryKey: ['addon-groups'],
        queryFn: async () => {
            const { data } = await api.get<AddonGroup[]>('/menu/addon-groups');
            return data;
        },
    });
};

export const useCreateAddonGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (group: Partial<AddonGroup>) => {
            const { data } = await api.post<AddonGroup>('/menu/addon-groups', group);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
        },
    });
};

export const useUpdateAddonGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...group }: Partial<AddonGroup> & { id: string }) => {
            const { data } = await api.patch<AddonGroup>(`/menu/addon-groups/${id}`, group);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
        },
    });
};

export const useAddAddonToGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ groupId, addon }: { groupId: string; addon: Omit<Addon, 'id' | 'group_id'> }) => {
            const { data } = await api.post<Addon>(`/menu/addon-groups/${groupId}/addons`, addon);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
        },
    });
};

export const useUpdateAddon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...addon }: Partial<Addon> & { id: string }) => {
            const { data } = await api.patch<Addon>(`/menu/addons/${id}`, addon);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
        },
    });
};

export const useDeleteAddon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete<{ detail: string }>(`/menu/addons/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
        },
    });
};

export const useDeleteAddonGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete<{ detail: string }>(`/menu/addon-groups/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
        },
    });
};

export const useDeleteMenu = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete<{ detail: string }>(`/menu/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menus'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete<{ detail: string }>(`/menu/categories/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useDeleteMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete<{ detail: string }>(`/menu/items/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
        },
    });
};
