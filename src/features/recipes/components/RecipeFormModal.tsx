import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe, MenuItemRecipeSummary, IngredientItem, RecipeCreatePayload, RecipeUpdatePayload } from '../api/recipesApi';

interface RecipeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuItem: MenuItemRecipeSummary | null;
    recipeToEdit: Recipe | null;
    userRole?: string;
    onSubmitCreate: (payload: RecipeCreatePayload) => void;
    onSubmitUpdate: (id: string, payload: RecipeUpdatePayload) => void;
    isSubmitting?: boolean;
}

const COMMON_ALLERGENS = [
    'Dairy',
    'Gluten',
    'Eggs',
    'Nuts',
    'Peanuts',
    'Soy',
    'Fish',
    'Shellfish',
    'Sesame',
    'Mustard',
    'Celery',
    'Sulfites',
];

const COMMON_UOMS = [
    'piece',
    'gram (g)',
    'kg',
    'ml',
    'liter (L)',
    'slice',
    'tbsp',
    'tsp',
    'cup',
    'oz',
    'portion',
];

export const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
    isOpen,
    onClose,
    menuItem,
    recipeToEdit,
    userRole,
    onSubmitCreate,
    onSubmitUpdate,
    isSubmitting = false,
}) => {
    const isAdmin = ['SUPER_ADMIN', 'STORE_ADMIN', 'MANAGER'].includes(userRole || '');

    const [recipeName, setRecipeName] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [prepTime, setPrepTime] = useState<number | ''>('');
    const [cookTime, setCookTime] = useState<number | ''>('');
    const [servings, setServings] = useState<number | ''>(1);
    const [allergens, setAllergens] = useState<string[]>([]);
    const [customAllergen, setCustomAllergen] = useState('');
    const [ingredients, setIngredients] = useState<IngredientItem[]>([
        { ingredient_id: '', name: '', quantity: 1, uom: 'piece', notes: '' },
    ]);

    useEffect(() => {
        if (recipeToEdit) {
            setRecipeName(recipeToEdit.recipe_name || '');
            setDescription(recipeToEdit.description || '');
            setInstructions(recipeToEdit.instructions || '');
            setPrepTime(recipeToEdit.prep_time_minutes ?? '');
            setCookTime(recipeToEdit.cook_time_minutes ?? '');
            setServings(recipeToEdit.servings ?? 1);
            setAllergens(recipeToEdit.allergens || []);
            setIngredients(
                recipeToEdit.ingredients && recipeToEdit.ingredients.length > 0
                    ? recipeToEdit.ingredients.map((ing) => ({ ...ing }))
                    : [{ ingredient_id: '', name: '', quantity: 1, uom: 'piece', notes: '' }]
            );
        } else if (menuItem) {
            setRecipeName(menuItem.name ? `${menuItem.name} Recipe` : '');
            setDescription(menuItem.description || '');
            setInstructions('');
            setPrepTime('');
            setCookTime('');
            setServings(1);
            setAllergens([]);
            setIngredients([{ ingredient_id: '', name: '', quantity: 1, uom: 'piece', notes: '' }]);
        }
    }, [recipeToEdit, menuItem, isOpen]);

    if (!isOpen || (!menuItem && !recipeToEdit)) return null;

    const handleToggleAllergen = (allergen: string) => {
        if (allergens.includes(allergen)) {
            setAllergens(allergens.filter((a) => a !== allergen));
        } else {
            setAllergens([...allergens, allergen]);
        }
    };

    const handleAddCustomAllergen = (e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && 'key' in e && e.key !== 'Enter' && e.key !== ',') return;
        if (e) e.preventDefault();
        const trimmed = customAllergen.trim().replace(/,$/, '');
        if (trimmed && !allergens.includes(trimmed)) {
            setAllergens([...allergens, trimmed]);
            setCustomAllergen('');
        }
    };

    const handleAddIngredientRow = () => {
        setIngredients([
            ...ingredients,
            { ingredient_id: '', name: '', quantity: 1, uom: 'piece', notes: '' },
        ]);
    };

    const handleRemoveIngredientRow = (index: number) => {
        if (ingredients.length === 1) {
            setIngredients([{ ingredient_id: '', name: '', quantity: 1, uom: 'piece', notes: '' }]);
            return;
        }
        setIngredients(ingredients.filter((_, idx) => idx !== index));
    };

    const handleIngredientChange = (index: number, field: keyof IngredientItem, value: any) => {
        const updated = [...ingredients];
        updated[index] = { ...updated[index], [field]: value };
        setIngredients(updated);
    };

    const handleSubmit = (publishNow: boolean) => {
        const cleanIngredients = ingredients.filter(
            (i) => (i.name && i.name.trim().length > 0) || (i.ingredient_id && i.ingredient_id.trim().length > 0)
        );

        if (recipeToEdit) {
            const payload: RecipeUpdatePayload = {
                recipe_name: recipeName.trim(),
                description: description.trim() || undefined,
                instructions: instructions.trim() || undefined,
                prep_time_minutes: prepTime !== '' ? Number(prepTime) : undefined,
                cook_time_minutes: cookTime !== '' ? Number(cookTime) : undefined,
                servings: servings !== '' ? Number(servings) : 1,
                allergens,
                ingredients: cleanIngredients,
                publish_now: isAdmin ? publishNow : false,
            };
            onSubmitUpdate(recipeToEdit.id, payload);
        } else if (menuItem) {
            const payload: RecipeCreatePayload = {
                menu_item_id: menuItem.id,
                recipe_name: recipeName.trim(),
                description: description.trim() || undefined,
                instructions: instructions.trim() || undefined,
                prep_time_minutes: prepTime !== '' ? Number(prepTime) : undefined,
                cook_time_minutes: cookTime !== '' ? Number(cookTime) : undefined,
                servings: servings !== '' ? Number(servings) : 1,
                allergens,
                ingredients: cleanIngredients,
                publish_now: isAdmin ? publishNow : false,
            };
            onSubmitCreate(payload);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800/50">
                        <div>
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                {recipeToEdit ? 'Modify Recipe' : 'New Recipe'}
                            </span>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                {recipeToEdit ? `Edit: ${recipeToEdit.recipe_name}` : `Create Recipe for: ${menuItem?.name}`}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <i className="ri-close-line text-xl" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Notice for Kitchen Staff */}
                        {!isAdmin && (
                            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 flex items-start gap-3 text-indigo-900 dark:text-indigo-200">
                                <i className="ri-information-line text-xl text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                <div className="text-xs space-y-0.5">
                                    <h4 className="font-bold">Kitchen Role Submission</h4>
                                    <p className="text-indigo-700 dark:text-indigo-300">
                                        Submitting or updating this recipe will send it directly to store management for review & approval before being published.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                    Recipe Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={recipeName}
                                    onChange={(e) => setRecipeName(e.target.value)}
                                    placeholder="e.g. Classic Cheese Burger Recipe"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                    Brief Description / Notes
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief overview or standard plating notes..."
                                    rows={2}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Preparation Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <i className="ri-time-line text-indigo-500" /> Prep Time (mins)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={prepTime}
                                    onChange={(e) => setPrepTime(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="e.g. 10"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <i className="ri-fire-line text-amber-500" /> Cook Time (mins)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={cookTime}
                                    onChange={(e) => setCookTime(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="e.g. 5"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <i className="ri-user-smile-line text-emerald-500" /> Servings Yield
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={servings}
                                    onChange={(e) => setServings(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="e.g. 1"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Allergen & Dietary Tag Selection */}
                        <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <i className="ri-shield-cross-line text-rose-500" />
                                    Allergens & Dietary Tags ({allergens.length})
                                </label>
                                {allergens.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setAllergens([])}
                                        className="text-[11px] text-zinc-400 hover:text-rose-500 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Active Tags Display */}
                            {allergens.length > 0 ? (
                                <div className="flex flex-wrap gap-2 p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                    {allergens.map((allergen) => (
                                        <span
                                            key={allergen}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-sm"
                                        >
                                            <i className="ri-error-warning-line text-rose-500 text-xs" />
                                            <span>{allergen}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleAllergen(allergen)}
                                                className="ml-0.5 hover:bg-rose-200 dark:hover:bg-rose-900/50 p-0.5 rounded-full text-rose-500 dark:text-rose-400 hover:text-rose-700 transition-colors"
                                                title={`Remove ${allergen}`}
                                            >
                                                <i className="ri-close-line text-xs font-bold" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-400 italic">No allergens or tags selected yet.</p>
                            )}

                            {/* Quick Presets */}
                            <div>
                                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                                    Quick Presets:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {COMMON_ALLERGENS.map((preset) => {
                                        const isSelected = allergens.includes(preset);
                                        return (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => handleToggleAllergen(preset)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 border ${
                                                    isSelected
                                                        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-700'
                                                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                                }`}
                                            >
                                                {isSelected ? <i className="ri-check-line text-rose-600 dark:text-rose-400" /> : <i className="ri-add-line text-zinc-400" />}
                                                {preset}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Add Custom Tag Input */}
                            <div className="flex items-center gap-2 pt-1">
                                <div className="relative flex-1 max-w-sm">
                                    <i className="ri-price-tag-3-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
                                    <input
                                        type="text"
                                        value={customAllergen}
                                        onChange={(e) => setCustomAllergen(e.target.value)}
                                        onKeyDown={handleAddCustomAllergen}
                                        placeholder="Type custom tag (e.g. Vegan, Spicy) & press Enter..."
                                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddCustomAllergen}
                                    disabled={!customAllergen.trim()}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition-all"
                                >
                                    + Add Tag
                                </button>
                            </div>
                        </div>

                        {/* Ingredients Table */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <i className="ri-shopping-basket-line text-indigo-500" />
                                    Recipe Ingredients
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddIngredientRow}
                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    <i className="ri-add-line" /> Add Ingredient Row
                                </button>
                            </div>

                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-50 dark:bg-zinc-800/75 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-3 py-2 font-semibold">Ingredient Name *</th>
                                            <th className="px-3 py-2 font-semibold">Inventory ID</th>
                                            <th className="px-3 py-2 font-semibold w-24">Qty *</th>
                                            <th className="px-3 py-2 font-semibold w-32">Unit (UOM)</th>
                                            <th className="px-3 py-2 font-semibold">Notes</th>
                                            <th className="px-3 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {ingredients.map((ing, idx) => (
                                            <tr key={idx} className="bg-white dark:bg-zinc-900">
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={ing.name || ''}
                                                        onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                                                        placeholder="e.g. Beef Patty"
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={ing.ingredient_id || ''}
                                                        onChange={(e) => handleIngredientChange(idx, 'ingredient_id', e.target.value)}
                                                        placeholder="e.g. inv_001"
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        value={ing.quantity}
                                                        onChange={(e) =>
                                                            handleIngredientChange(
                                                                idx,
                                                                'quantity',
                                                                e.target.value === '' ? '' : Number(e.target.value)
                                                            )
                                                        }
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        list={`uom-list-${idx}`}
                                                        value={ing.uom}
                                                        onChange={(e) => handleIngredientChange(idx, 'uom', e.target.value)}
                                                        placeholder="piece"
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                    <datalist id={`uom-list-${idx}`}>
                                                        {COMMON_UOMS.map((u) => (
                                                            <option key={u} value={u} />
                                                        ))}
                                                    </datalist>
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={ing.notes || ''}
                                                        onChange={(e) => handleIngredientChange(idx, 'notes', e.target.value)}
                                                        placeholder="e.g. freshly grated"
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveIngredientRow(idx)}
                                                        className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                                    >
                                                        <i className="ri-delete-bin-line text-sm" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Step-by-Step Instructions */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                                <i className="ri-file-list-3-line text-indigo-500" />
                                Step-by-Step Instructions
                            </label>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="1. Toast bun on flat top for 1 minute.&#10;2. Grill burger patty for 4 minutes each side.&#10;3. Melt cheddar cheese slice over patty.&#10;4. Assemble with special sauce and serve immediately."
                                rows={5}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="p-4 px-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>

                        <div className="flex items-center gap-2">
                            {isAdmin ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(false)}
                                        disabled={isSubmitting || !recipeName.trim()}
                                        className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
                                    >
                                        Save as Draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(true)}
                                        disabled={isSubmitting || !recipeName.trim()}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <i className="ri-loader-4-line animate-spin" />
                                        ) : (
                                            <i className="ri-checkbox-circle-line" />
                                        )}
                                        Save & Publish
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleSubmit(false)}
                                    disabled={isSubmitting || !recipeName.trim()}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <i className="ri-loader-4-line animate-spin" />
                                    ) : (
                                        <i className="ri-send-plane-fill" />
                                    )}
                                    Submit for Admin Approval
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
