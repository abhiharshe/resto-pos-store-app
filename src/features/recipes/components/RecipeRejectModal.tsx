import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe } from '../api/recipesApi';

interface RecipeRejectModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipe: Recipe | null;
    onConfirm: (recipeId: string, reason: string) => void;
    isLoading?: boolean;
}

export const RecipeRejectModal: React.FC<RecipeRejectModalProps> = ({
    isOpen,
    onClose,
    recipe,
    onConfirm,
    isLoading = false,
}) => {
    const [reason, setReason] = useState('');

    if (!isOpen || !recipe) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(recipe.id, reason);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl">
                                <i className="ri-error-warning-line" />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                    Reject Recipe Submission
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    Rejecting <strong className="text-zinc-700 dark:text-zinc-200">{recipe.recipe_name}</strong>. Provide feedback or instructions for the kitchen staff.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                    Rejection Reason / Feedback (Optional)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g. Please adjust cook time, clarify missing ingredient quantities..."
                                    rows={3}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 px-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {isLoading ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-close-circle-line" />}
                                Confirm Rejection
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
