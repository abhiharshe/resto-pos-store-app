import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export interface Category {
    id: number;
    menu_id: number;
    name: string;
    image_url?: string;
    items?: MenuItem[];
    menu?: Menu;
    is_active: boolean;
}

export interface MenuItemVariant {
    id?: number;
    menu_item_id?: number;
    name: string;
    price: number;
    is_serving: boolean;
}

export interface MenuItem {
    id: number;
    category_id: number;
    name: string;
    description?: string;
    variants: MenuItemVariant[];
    is_active: boolean;
    category?: Category;
    images?: { id: number; image_url: string }[];
}

export interface Menu {
    id: number;
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
        mutationFn: async ({ id, ...menu }: Partial<Menu> & { id: number }) => {
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
        mutationFn: async ({ id, ...category }: Partial<Category> & { id: number }) => {
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
        mutationFn: async ({ id, ...item }: Partial<MenuItem> & { id: number; image_urls?: string[] }) => {
            const { data } = await api.patch<MenuItem>(`/menu/items/${id}`, item);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
        },
    });
};
export interface Addon {
    id: number;
    group_id: number;
    name: string;
    price: number;
}

export interface AddonGroup {
    id: number;
    name: string;
    min_selection: number;
    max_selection: number;
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
        mutationFn: async ({ id, ...group }: Partial<AddonGroup> & { id: number }) => {
            const { data } = await api.patch<AddonGroup>(`/menu/addon-groups/${id}`, group);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
        },
    });
};

export const useAddAddonToGroup = (groupId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (addon: Omit<Addon, 'id' | 'group_id'>) => {
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
        mutationFn: async ({ id, ...addon }: Partial<Addon> & { id: number }) => {
            const { data } = await api.patch<Addon>(`/menu/addons/${id}`, addon);
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
        mutationFn: async (id: number) => {
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
        mutationFn: async (id: number) => {
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
        mutationFn: async (id: number) => {
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
        mutationFn: async (id: number) => {
            const { data } = await api.delete<{ detail: string }>(`/menu/items/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
        },
    });
};
