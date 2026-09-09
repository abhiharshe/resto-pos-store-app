import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../../app/hooks';
import {
    useMenuItemRecipes,
    useCreateRecipe,
    useUpdateRecipe,
    useApproveRecipe,
    useRejectRecipe,
    useDeleteRecipe,
    MenuItemRecipeSummary,
    Recipe,
    RecipeCreatePayload,
    RecipeUpdatePayload,
} from '../api/recipesApi';
import { RecipeDetailsModal } from '../components/RecipeDetailsModal';
import { RecipeFormModal } from '../components/RecipeFormModal';
import { RecipeRejectModal } from '../components/RecipeRejectModal';

type FilterTab = 'ALL' | 'PUBLISHED' | 'PENDING_APPROVAL' | 'DRAFT' | 'NEEDS_RECIPE';

export const RecipeList: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role;
    const isAdmin = ['SUPER_ADMIN', 'STORE_ADMIN', 'MANAGER'].includes(userRole || '');

    const { data: menuItems = [], isLoading, refetch } = useMenuItemRecipes();
    const createRecipeMutation = useCreateRecipe();
    const updateRecipeMutation = useUpdateRecipe();
    const approveRecipeMutation = useApproveRecipe();
    const rejectRecipeMutation = useRejectRecipe();
    const deleteRecipeMutation = useDeleteRecipe();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

    // Modals state
    const [selectedItemForView, setSelectedItemForView] = useState<Recipe | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [selectedItemForForm, setSelectedItemForForm] = useState<MenuItemRecipeSummary | null>(null);
    const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    const [recipeToReject, setRecipeToReject] = useState<Recipe | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    // Extract unique categories
    const categories = useMemo(() => {
        const set = new Set<string>();
        menuItems.forEach((item) => {
            if (item.category_name) set.add(item.category_name);
        });
        return Array.from(set);
    }, [menuItems]);

    // Counts for tabs
    const counts = useMemo(() => {
        return {
            ALL: menuItems.length,
            PUBLISHED: menuItems.filter((i) => i.recipe?.status === 'PUBLISHED').length,
            PENDING_APPROVAL: menuItems.filter((i) => i.recipe?.status === 'PENDING_APPROVAL').length,
            DRAFT: menuItems.filter((i) => i.recipe?.status === 'DRAFT' || i.recipe?.status === 'REJECTED').length,
            NEEDS_RECIPE: menuItems.filter((i) => !i.recipe).length,
        };
    }, [menuItems]);

    // Filtered items
    const filteredItems = useMemo(() => {
        return menuItems.filter((item) => {
            // Category filter
            if (selectedCategory !== 'ALL' && item.category_name !== selectedCategory) {
                return false;
            }

            // Tab filter
            if (activeTab === 'PUBLISHED' && item.recipe?.status !== 'PUBLISHED') return false;
            if (activeTab === 'PENDING_APPROVAL' && item.recipe?.status !== 'PENDING_APPROVAL') return false;
            if (activeTab === 'DRAFT' && !(item.recipe?.status === 'DRAFT' || item.recipe?.status === 'REJECTED')) return false;
            if (activeTab === 'NEEDS_RECIPE' && item.recipe) return false;

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = item.name.toLowerCase().includes(q);
                const matchCategory = item.category_name?.toLowerCase().includes(q);
                const matchRecipe = item.recipe?.recipe_name.toLowerCase().includes(q);
                if (!matchName && !matchCategory && !matchRecipe) return false;
            }

            return true;
        });
    }, [menuItems, selectedCategory, activeTab, searchQuery]);

    // Action Handlers
    const handleOpenView = (recipe: Recipe) => {
        setSelectedItemForView(recipe);
        setIsViewModalOpen(true);
    };

    const handleOpenCreate = (item: MenuItemRecipeSummary) => {
        setSelectedItemForForm(item);
        setRecipeToEdit(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (recipe: Recipe) => {
        const item = menuItems.find((i) => i.id === recipe.menu_item_id) || null;
        setSelectedItemForForm(item);
        setRecipeToEdit(recipe);
        setIsViewModalOpen(false);
        setIsFormModalOpen(true);
    };

    const handleCreateSubmit = async (payload: RecipeCreatePayload) => {
        try {
            await createRecipeMutation.mutateAsync(payload);
            toast.success(
                isAdmin && payload.publish_now
                    ? 'Recipe published successfully!'
                    : isAdmin
                        ? 'Recipe draft saved!'
                        : 'Recipe submitted for Admin approval!'
            );
            setIsFormModalOpen(false);
            setSelectedItemForForm(null);
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to create recipe.');
        }
    };

    const handleUpdateSubmit = async (id: string, payload: RecipeUpdatePayload) => {
        try {
            await updateRecipeMutation.mutateAsync({ id, payload });
            toast.success(
                isAdmin && payload.publish_now
                    ? 'Recipe updated & published!'
                    : isAdmin
                        ? 'Recipe updated!'
                        : 'Changes submitted for Admin approval!'
            );
            setIsFormModalOpen(false);
            setRecipeToEdit(null);
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to update recipe.');
        }
    };

    const handleApprove = async (recipeId: string) => {
        try {
            await approveRecipeMutation.mutateAsync(recipeId);
            toast.success('Recipe approved and published!');
            if (selectedItemForView?.id === recipeId) {
                setIsViewModalOpen(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to approve recipe.');
        }
    };

    const handleOpenReject = (recipe: Recipe) => {
        setRecipeToReject(recipe);
        setIsRejectModalOpen(true);
    };

    const handleConfirmReject = async (recipeId: string, reason: string) => {
        try {
            await rejectRecipeMutation.mutateAsync({ id: recipeId, reason: reason || undefined });
            toast.success('Recipe rejected and sent back to kitchen.');
            setIsRejectModalOpen(false);
            setRecipeToReject(null);
            if (selectedItemForView?.id === recipeId) {
                setIsViewModalOpen(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to reject recipe.');
        }
    };

    const handleDelete = async (recipeId: string) => {
        if (!window.confirm('Are you sure you want to delete this recipe?')) return;
        try {
            await deleteRecipeMutation.mutateAsync(recipeId);
            toast.success('Recipe deleted.');
            if (selectedItemForView?.id === recipeId) {
                setIsViewModalOpen(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to delete recipe.');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Top Banner / Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-mauve-200 dark:border-zinc-700">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
                            <i className="ri-book-open-line" />
                        </div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-zinc-100">
                            Recipe Management
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-700 text-zinc-600 dark:text-zinc-300">
                            {isAdmin ? 'Admin View' : 'Kitchen View'}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {isAdmin
                            ? 'Create, modify, and approve recipes for all active menu items.'
                            : 'View preparation instructions and submit recipe updates for management approval.'}
                    </p>
                </div>

                {counts.PENDING_APPROVAL > 0 && isAdmin && (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                        <i className="ri-alarm-warning-line text-xl text-amber-600 dark:text-amber-400 animate-pulse" />
                        <div className="text-xs">
                            <span className="font-semibold">{counts.PENDING_APPROVAL} Pending Approvals</span>
                            <p className="text-amber-700 dark:text-amber-300">Kitchen staff submitted recipe changes</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                    { key: 'ALL', label: 'All Items', count: counts.ALL, icon: 'ri-list-check' },
                    { key: 'PUBLISHED', label: 'Published', count: counts.PUBLISHED, icon: 'ri-checkbox-circle-line' },
                    { key: 'PENDING_APPROVAL', label: 'Pending Approval', count: counts.PENDING_APPROVAL, icon: 'ri-time-line' },
                    { key: 'DRAFT', label: 'Drafts & Rejected', count: counts.DRAFT, icon: 'ri-draft-line' },
                    { key: 'NEEDS_RECIPE', label: 'Needs Recipe', count: counts.NEEDS_RECIPE, icon: 'ri-add-circle-line' },
                ].map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as FilterTab)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border ${isActive
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white dark:bg-neutral-800 text-zinc-600 dark:text-zinc-300 border-mauve-200 dark:border-zinc-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
                                }`}
                        >
                            <i className={tab.icon} />
                            <span>{tab.label}</span>
                            <span
                                className={`text-xs px-2 py-0.5 rounded-full ${isActive
                                    ? 'bg-white/20 text-white'
                                    : tab.key === 'PENDING_APPROVAL' && tab.count > 0
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 font-semibold'
                                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                                    }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search and Category Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-lg" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by menu item or recipe name..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-mauve-200 dark:border-zinc-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl border border-mauve-200 dark:border-zinc-700 bg-white dark:bg-neutral-800 text-sm font-medium text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm w-full sm:w-48"
                    >
                        <option value="ALL">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => refetch()}
                        title="Refresh List"
                        className="p-2.5 rounded-xl border border-mauve-200 dark:border-zinc-700 bg-white dark:bg-neutral-800 text-zinc-600 dark:text-zinc-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
                    >
                        <i className="ri-refresh-line text-lg" />
                    </button>
                </div>
            </div>

            {/* Menu Items & Recipes List */}
            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-3">
                    <i className="ri-loader-4-line text-3xl animate-spin text-indigo-500" />
                    <p className="text-sm">Loading recipe directory...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-neutral-800 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 text-zinc-400 flex items-center justify-center text-2xl mx-auto mb-3">
                        <i className="ri-book-open-line" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-zinc-100">No items match your criteria</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                        Try clearing your search filters or add a new recipe to get started.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-mauve-200 dark:border-zinc-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50/80 dark:bg-mauve-900/50 text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider border-b border-mauve-200 dark:border-zinc-700">
                                <tr>
                                    <th className="px-6 py-3.5 font-semibold">Menu Item & Category</th>
                                    <th className="px-6 py-3.5 font-semibold">Recipe Details</th>
                                    <th className="px-6 py-3.5 font-semibold">Status</th>
                                    <th className="px-6 py-3.5 font-semibold">Timing & Yield</th>
                                    <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/60">
                                {filteredItems.map((item) => {
                                    const recipe = item.recipe;
                                    return (
                                        <tr key={item.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-750/30 transition-colors">
                                            {/* Item name & category */}
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-neutral-900 dark:text-zinc-100 text-base">
                                                    {item.name}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {item.category_name && (
                                                        <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-700 text-zinc-600 dark:text-zinc-300 font-medium">
                                                            {item.category_name}
                                                        </span>
                                                    )}
                                                    {!item.is_active && (
                                                        <span className="text-[10px] uppercase font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                                                            Inactive Item
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Recipe details */}
                                            <td className="px-6 py-4">
                                                {recipe ? (
                                                    <div className="space-y-1">
                                                        <div className="font-semibold text-neutral-900 dark:text-zinc-100 flex items-center gap-1.5">
                                                            <span>{recipe.recipe_name}</span>
                                                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
                                                                v{recipe.version}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-3">
                                                            <span>{recipe.ingredients?.length || 0} ingredients</span>
                                                            {recipe.allergens && recipe.allergens.length > 0 && (
                                                                <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                                                    <i className="ri-shield-cross-line text-xs" />
                                                                    {recipe.allergens.length} allergen{recipe.allergens.length > 1 ? 's' : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-medium text-zinc-400 italic">
                                                        No recipe created yet
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                {recipe ? (
                                                    <div className="space-y-1">
                                                        {recipe.status === 'PUBLISHED' && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                                <i className="ri-checkbox-circle-line" />
                                                                Published
                                                            </span>
                                                        )}
                                                        {recipe.status === 'PENDING_APPROVAL' && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                                                                <i className="ri-time-line" />
                                                                Pending Approval
                                                            </span>
                                                        )}
                                                        {recipe.status === 'DRAFT' && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-zinc-700 dark:bg-neutral-700 dark:text-zinc-300 border border-mauve-200 dark:border-zinc-600">
                                                                <i className="ri-draft-line" />
                                                                Draft
                                                            </span>
                                                        )}
                                                        {recipe.status === 'REJECTED' && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                                                <i className="ri-close-circle-line" />
                                                                Rejected
                                                            </span>
                                                        )}
                                                        <div className="text-[11px] text-zinc-400">
                                                            by {recipe.created_by_name || 'Staff'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-zinc-400">
                                                        Unconfigured
                                                    </span>
                                                )}
                                            </td>

                                            {/* Timing & Yield */}
                                            <td className="px-6 py-4 text-xs text-zinc-600 dark:text-zinc-300">
                                                {recipe ? (
                                                    <div className="space-y-0.5">
                                                        <div>
                                                            <strong className="text-zinc-800 dark:text-zinc-200">Prep:</strong>{' '}
                                                            {recipe.prep_time_minutes ? `${recipe.prep_time_minutes}m` : '—'} |{' '}
                                                            <strong className="text-zinc-800 dark:text-zinc-200">Cook:</strong>{' '}
                                                            {recipe.cook_time_minutes ? `${recipe.cook_time_minutes}m` : '—'}
                                                        </div>
                                                        <div className="text-zinc-400">Yield: {recipe.servings || 1} serv.</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-400">—</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {recipe ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenView(recipe)}
                                                                className="px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors flex items-center gap-1"
                                                            >
                                                                <i className="ri-eye-line" />
                                                                View
                                                            </button>

                                                            {isAdmin && recipe.status === 'PENDING_APPROVAL' ? (
                                                                <button
                                                                    onClick={() => handleOpenView(recipe)}
                                                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all active:scale-[0.98] flex items-center gap-1"
                                                                >
                                                                    <i className="ri-checkbox-circle-line" />
                                                                    Review
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleOpenEdit(recipe)}
                                                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all active:scale-[0.98] flex items-center gap-1"
                                                                >
                                                                    <i className="ri-edit-line" />
                                                                    Edit
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleOpenCreate(item)}
                                                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all active:scale-[0.98] flex items-center gap-1"
                                                        >
                                                            <i className="ri-add-line" />
                                                            Add Recipe
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View Recipe Modal */}
            <RecipeDetailsModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedItemForView(null);
                }}
                recipe={selectedItemForView}
                userRole={userRole}
                onEdit={handleOpenEdit}
                onApprove={handleApprove}
                onReject={handleOpenReject}
                onDelete={handleDelete}
                isApproving={approveRecipeMutation.isPending}
            />

            {/* Create / Edit Recipe Modal */}
            <RecipeFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedItemForForm(null);
                    setRecipeToEdit(null);
                }}
                menuItem={selectedItemForForm}
                recipeToEdit={recipeToEdit}
                userRole={userRole}
                onSubmitCreate={handleCreateSubmit}
                onSubmitUpdate={handleUpdateSubmit}
                isSubmitting={createRecipeMutation.isPending || updateRecipeMutation.isPending}
            />

            {/* Reject Modal */}
            <RecipeRejectModal
                isOpen={isRejectModalOpen}
                onClose={() => {
                    setIsRejectModalOpen(false);
                    setRecipeToReject(null);
                }}
                recipe={recipeToReject}
                onConfirm={handleConfirmReject}
                isLoading={rejectRecipeMutation.isPending}
            />
        </div>
    );
};

export default RecipeList;
