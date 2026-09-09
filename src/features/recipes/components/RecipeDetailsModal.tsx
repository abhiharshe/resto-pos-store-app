import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import moment from 'moment';
import { Recipe, RecipeStatus } from '../api/recipesApi';

interface RecipeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipe: Recipe | null;
    userRole?: string;
    onEdit: (recipe: Recipe) => void;
    onApprove?: (recipeId: string) => void;
    onReject?: (recipe: Recipe) => void;
    onDelete?: (recipeId: string) => void;
    isApproving?: boolean;
}

const statusBadges: Record<RecipeStatus, { label: string; bg: string; text: string; icon: string }> = {
    PUBLISHED: {
        label: 'Published',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-700 dark:text-emerald-300',
        icon: 'ri-checkbox-circle-line',
    },
    PENDING_APPROVAL: {
        label: 'Pending Approval',
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        text: 'text-amber-700 dark:text-amber-300',
        icon: 'ri-time-line',
    },
    DRAFT: {
        label: 'Draft',
        bg: 'bg-neutral-100 dark:bg-neutral-800 border-mauve-200 dark:border-zinc-700',
        text: 'text-zinc-700 dark:text-zinc-300',
        icon: 'ri-draft-line',
    },
    REJECTED: {
        label: 'Rejected',
        bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
        text: 'text-rose-700 dark:text-rose-300',
        icon: 'ri-close-circle-line',
    },
};

export const RecipeDetailsModal: React.FC<RecipeDetailsModalProps> = ({
    isOpen,
    onClose,
    recipe,
    userRole,
    onEdit,
    onApprove,
    onReject,
    onDelete,
    isApproving = false,
}) => {
    if (!isOpen || !recipe) return null;

    const isAdmin = ['SUPER_ADMIN', 'STORE_ADMIN', 'MANAGER'].includes(userRole || '');
    const badge = statusBadges[recipe.status] || statusBadges.DRAFT;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-mauve-900 rounded-2xl shadow-2xl border border-mauve-200 dark:border-mauve-800 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-zinc-100 dark:border-mauve-800 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800/50">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text}`}>
                                    <i className={badge.icon} />
                                    {badge.label}
                                </span>
                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-zinc-600 dark:text-zinc-400">
                                    v{recipe.version}
                                </span>
                            </div>
                            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-zinc-100">
                                {recipe.recipe_name}
                            </h2>
                            {recipe.menu_item_name && (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                                    <i className="ri-restaurant-line text-indigo-500" />
                                    Menu Item: <strong className="text-zinc-700 dark:text-zinc-200">{recipe.menu_item_name}</strong>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <i className="ri-close-line text-xl" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Rejection Alert */}
                        {recipe.status === 'REJECTED' && recipe.rejection_reason && (
                            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-800 dark:text-rose-200">
                                <i className="ri-alert-line text-xl mt-0.5 text-rose-600 dark:text-rose-400" />
                                <div>
                                    <h4 className="text-sm font-semibold">Changes Requested / Rejection Reason</h4>
                                    <p className="text-sm mt-0.5 text-rose-700 dark:text-rose-300">{recipe.rejection_reason}</p>
                                </div>
                            </div>
                        )}

                        {/* Pending Approval Notice */}
                        {recipe.status === 'PENDING_APPROVAL' && (
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-3 text-amber-800 dark:text-amber-200">
                                <i className="ri-information-line text-xl mt-0.5 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <h4 className="text-sm font-semibold">Pending Administrator Review</h4>
                                    <p className="text-sm mt-0.5 text-amber-700 dark:text-amber-300">
                                        This recipe or its latest modifications are waiting for approval by a store manager or administrator.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {recipe.description && (
                            <div>
                                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/40 p-3.5 rounded-xl border border-zinc-100 dark:border-mauve-800">
                                    {recipe.description}
                                </p>
                            </div>
                        )}

                        {/* Prep / Cook / Servings Metrics */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-zinc-100 dark:border-mauve-800 text-center">
                                <div className="flex items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400 text-xs mb-1">
                                    <i className="ri-time-line text-indigo-500" />
                                    Prep Time
                                </div>
                                <span className="text-base font-semibold text-neutral-900 dark:text-zinc-100">
                                    {recipe.prep_time_minutes ? `${recipe.prep_time_minutes} mins` : '—'}
                                </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-zinc-100 dark:border-mauve-800 text-center">
                                <div className="flex items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400 text-xs mb-1">
                                    <i className="ri-fire-line text-amber-500" />
                                    Cook Time
                                </div>
                                <span className="text-base font-semibold text-neutral-900 dark:text-zinc-100">
                                    {recipe.cook_time_minutes ? `${recipe.cook_time_minutes} mins` : '—'}
                                </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-zinc-100 dark:border-mauve-800 text-center">
                                <div className="flex items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400 text-xs mb-1">
                                    <i className="ri-user-smile-line text-emerald-500" />
                                    Servings
                                </div>
                                <span className="text-base font-semibold text-neutral-900 dark:text-zinc-100">
                                    {recipe.servings || 1}
                                </span>
                            </div>
                        </div>

                        {/* Allergens */}
                        {recipe.allergens && recipe.allergens.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <i className="ri-shield-cross-line text-rose-500" />
                                    Allergen Warnings
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {recipe.allergens.map((allergen, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1"
                                        >
                                            <i className="ri-error-warning-line text-rose-500 text-xs" />
                                            {allergen}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ingredients Table */}
                        <div>
                            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <i className="ri-shopping-basket-line text-indigo-500" />
                                Ingredients & Quantities
                            </h3>
                            {recipe.ingredients && recipe.ingredients.length > 0 ? (
                                <div className="border border-mauve-200 dark:border-mauve-800 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-neutral-50 dark:bg-neutral-800/75 text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="px-4 py-2.5 font-semibold">Ingredient</th>
                                                <th className="px-4 py-2.5 font-semibold">Inventory ID</th>
                                                <th className="px-4 py-2.5 font-semibold">Quantity</th>
                                                <th className="px-4 py-2.5 font-semibold">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {recipe.ingredients.map((ing, idx) => (
                                                <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                                                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-zinc-100">
                                                        {ing.name || '—'}
                                                    </td>
                                                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                                                        {ing.ingredient_id || '—'}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{ing.quantity}</span> {ing.uom}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-xs text-neutral-500 dark:text-neutral-400">
                                                        {ing.notes || '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-400 italic">No ingredients specified.</p>
                            )}
                        </div>

                        {/* Instructions */}
                        {recipe.instructions && (
                            <div>
                                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <i className="ri-file-list-3-line text-indigo-500" />
                                    Preparation & Cooking Instructions
                                </h3>
                                <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-zinc-100 dark:border-mauve-800 text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed font-sans">
                                    {recipe.instructions}
                                </div>
                            </div>
                        )}

                        {/* Audit Log Footer */}
                        <div className="pt-4 border-t border-zinc-100 dark:border-mauve-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                            <div>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">Created by: </span>
                                {recipe.created_by_name || 'Staff'} ({moment(recipe.created_at).format('MMM D, YYYY h:mm A')})
                            </div>
                            {recipe.approved_by_name && (
                                <div>
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Approved by: </span>
                                    {recipe.approved_by_name} {recipe.approved_at ? `(${moment(recipe.approved_at).format('MMM D, YYYY h:mm A')})` : ''}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Actions Footer */}
                    <div className="p-4 px-6 border-t border-zinc-100 dark:border-mauve-800 bg-neutral-50 dark:bg-mauve-900 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            {isAdmin && onDelete && (
                                <button
                                    type="button"
                                    onClick={() => onDelete(recipe.id)}
                                    className="px-3.5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors flex items-center gap-1.5"
                                >
                                    <i className="ri-delete-bin-line" />
                                    Delete
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                            >
                                Close
                            </button>

                            {/* Admin specific action buttons */}
                            {isAdmin && recipe.status === 'PENDING_APPROVAL' && onReject && (
                                <button
                                    type="button"
                                    onClick={() => onReject(recipe)}
                                    className="px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors flex items-center gap-1.5"
                                >
                                    <i className="ri-close-line" />
                                    Reject
                                </button>
                            )}

                            {isAdmin && recipe.status === 'PENDING_APPROVAL' && onApprove && (
                                <button
                                    type="button"
                                    onClick={() => onApprove(recipe.id)}
                                    disabled={isApproving}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {isApproving ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-checkbox-circle-line" />}
                                    Approve & Publish
                                </button>
                            )}

                            {/* Edit Button */}
                            <button
                                type="button"
                                onClick={() => onEdit(recipe)}
                                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
                            >
                                <i className="ri-edit-line" />
                                {isAdmin ? 'Edit Recipe' : 'Edit / Update Recipe'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
