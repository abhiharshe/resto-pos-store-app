import React, { useState, useEffect } from "react";
import { MenuItemProps, SelectedAddon } from "../api/posApi";
import { Button } from "../../../components/common/Button";

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: MenuItemProps;
    onAddToCart: (variant: any, addons: SelectedAddon[], quantity: number) => void;
    initialVariant?: any;
    initialAddons?: SelectedAddon[];
    initialQuantity?: number;
    mode?: 'add' | 'edit';
}

const DEFAULT_ADDONS: SelectedAddon[] = [];

const CustomizationModal: React.FC<CustomizationModalProps> = ({
    isOpen,
    onClose,
    item,
    onAddToCart,
    initialVariant,
    initialAddons = DEFAULT_ADDONS,
    initialQuantity = 1,
    mode = 'add'
}) => {
    const [selectedVariant, setSelectedVariant] = useState<any>(initialVariant || item.variants?.[0] || null);
    const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>(initialAddons);
    const [quantity, setQuantity] = useState(initialQuantity);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setSelectedVariant(initialVariant || item.variants?.[0] || null);
            setSelectedAddons(initialAddons);
            setQuantity(initialQuantity);
        }
        // We only want to reset the internal state when the modal opens.
        // If we included initialAddons/initialQuantity in the dependencies,
        // any re-render from the parent (passing new array refs) would reset the user's progress.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        const addonsPrice = selectedAddons.reduce((acc, addon) => acc + addon.price, 0);
        const variantPrice = selectedVariant ? selectedVariant.price : 0;
        setTotalPrice((variantPrice + addonsPrice) * quantity);
    }, [selectedVariant, selectedAddons, quantity]);

    if (!isOpen) return null;

    const handleAddonToggle = (addon: { id: number, name: string, price: number }, group: any) => {
        const isSelected = selectedAddons.find(a => a.id === addon.id);

        if (isSelected) {
            setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
        } else {
            // Check max selection for the group
            const currentGroupAddons = selectedAddons.filter(a =>
                group.addons.find((ga: any) => ga.id === a.id)
            );

            if (currentGroupAddons.length < group.max_selection) {
                setSelectedAddons(prev => [...prev, { id: addon.id, name: addon.name, price: addon.price }]);
            } else if (group.max_selection === 1) {
                // If max is 1, swap selection
                const otherAddons = selectedAddons.filter(a =>
                    !group.addons.find((ga: any) => ga.id === a.id)
                );
                setSelectedAddons([...otherAddons, { id: addon.id, name: addon.name, price: addon.price }]);
            }
        }
    };

    const isGroupValid = (group: any) => {
        const count = selectedAddons.filter(a =>
            group.addons.find((ga: any) => ga.id === a.id)
        ).length;
        return count >= group.min_selection && count <= group.max_selection;
    };

    const allGroupsValid = item.addon_groups?.every(isGroupValid) ?? true;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-indigo-50 dark:bg-gray-900">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{item.name}</h2>
                        <p className="text-sm text-gray-500">Customize your order</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2">
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Variants Section */}
                    {item.variants && item.variants.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Select Variant/Size</h3>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Required: 1</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {item.variants.map((variant) => {
                                    const isSelected = selectedVariant?.id === variant.id;
                                    return (
                                        <label
                                            key={variant.id}
                                            className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    checked={isSelected}
                                                    onChange={() => setSelectedVariant(variant)}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-gray-700 dark:text-gray-200">{variant.name}</span>
                                            </div>
                                            <span className="text-gray-500 font-medium">
                                                Rs.{variant.price}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {item.addon_groups?.map((group) => (
                        <div key={group.id} className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-700 dark:text-gray-200">{group.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${isGroupValid(group) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {group.min_selection > 0 ? `Required: ${group.min_selection}` : 'Optional'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {group.addons.map((addon) => {
                                    const isSelected = selectedAddons.find(a => a.id === addon.id);
                                    return (
                                        <label
                                            key={addon.id}
                                            className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type={group.max_selection === 1 ? "radio" : "checkbox"}
                                                    checked={!!isSelected}
                                                    onChange={() => handleAddonToggle(addon, group)}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-gray-700 dark:text-gray-200">{addon.name}</span>
                                            </div>
                                            <span className="text-gray-500 font-medium">
                                                {addon.price > 0 ? `+ Rs.${addon.price}` : 'Free'}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-2 py-1 shadow-sm">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="p-2 text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                                <i className="ri-subtract-line"></i>
                            </button>
                            <span className="font-bold text-lg min-w-8 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="p-2 text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                                <i className="ri-add-line"></i>
                            </button>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Amount</p>
                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Rs.{totalPrice}</p>
                        </div>
                    </div>
                    <Button
                        disabled={!allGroupsValid || !selectedVariant}
                        onClick={() => onAddToCart(selectedVariant, selectedAddons, quantity)}
                        className="w-full py-4 text-lg font-bold shadow-lg"
                    >
                        {mode === 'edit' ? 'Update Item' : 'Add to Cart'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CustomizationModal;
