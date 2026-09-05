import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export type RecipeStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED';

export interface IngredientItem {
    ingredient_id?: string;
    name?: string;
    quantity: number;
    uom: string;
    notes?: string;
}

export interface Recipe {
    id: string;
    menu_item_id: string;
    recipe_name: string;
    description?: string;
    instructions?: string;
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    servings?: number;
    allergens: string[];
    ingredients: IngredientItem[];
    status: RecipeStatus;
    version: number;
    rejection_reason?: string;
    created_by_id?: string;
    approved_by_id?: string;
    approved_at?: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    menu_item_name?: string;
    created_by_name?: string;
    approved_by_name?: string;
}

export interface MenuItemRecipeSummary {
    id: string;
    name: string;
    description?: string;
    category_id?: string;
    category_name?: string;
    is_active: boolean;
    recipe?: Recipe;
}

export interface RecipeCreatePayload {
    menu_item_id: string;
    recipe_name: string;
    description?: string;
    instructions?: string;
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    servings?: number;
    allergens: string[];
    ingredients: IngredientItem[];
    publish_now?: boolean;
    is_active?: boolean;
}

export interface RecipeUpdatePayload {
    recipe_name?: string;
    description?: string;
    instructions?: string;
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    servings?: number;
    allergens?: string[];
    ingredients?: IngredientItem[];
    publish_now?: boolean;
    is_active?: boolean;
}

export const useMenuItemRecipes = () => {
    return useQuery({
        queryKey: ['menu-item-recipes'],
        queryFn: async () => {
            const { data } = await api.get<MenuItemRecipeSummary[]>('/recipes/menu-items');
            return data;
        },
    });
};

export const useRecipeByMenuItem = (menuItemId?: string) => {
    return useQuery({
        queryKey: ['recipes', 'by-item', menuItemId],
        queryFn: async () => {
            const { data } = await api.get<Recipe>(`/recipes/item/${menuItemId}`);
            return data;
        },
        enabled: !!menuItemId,
    });
};

export const useRecipe = (recipeId?: string) => {
    return useQuery({
        queryKey: ['recipes', recipeId],
        queryFn: async () => {
            const { data } = await api.get<Recipe>(`/recipes/${recipeId}`);
            return data;
        },
        enabled: !!recipeId,
    });
};

export const useCreateRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: RecipeCreatePayload) => {
            const { data } = await api.post<Recipe>('/recipes/', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-item-recipes'] });
        },
    });
};

export const useUpdateRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: RecipeUpdatePayload }) => {
            const { data } = await api.put<Recipe>(`/recipes/${id}`, payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['menu-item-recipes'] });
            queryClient.invalidateQueries({ queryKey: ['recipes', data.id] });
            queryClient.invalidateQueries({ queryKey: ['recipes', 'by-item', data.menu_item_id] });
        },
    });
};

export const useApproveRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.post<Recipe>(`/recipes/${id}/approve`);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['menu-item-recipes'] });
            queryClient.invalidateQueries({ queryKey: ['recipes', data.id] });
            queryClient.invalidateQueries({ queryKey: ['recipes', 'by-item', data.menu_item_id] });
        },
    });
};

export const useRejectRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
            const { data } = await api.post<Recipe>(`/recipes/${id}/reject`, { reason });
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['menu-item-recipes'] });
            queryClient.invalidateQueries({ queryKey: ['recipes', data.id] });
            queryClient.invalidateQueries({ queryKey: ['recipes', 'by-item', data.menu_item_id] });
        },
    });
};

export const useDeleteRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/recipes/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-item-recipes'] });
        },
    });
};
