import React, { useState, useEffect } from "react";
import { MenuItemProps, SelectedAddon } from "../api/posApi";
import { Button } from "../../../components/common/Button";
import IconButton from "../../../components/common/IconButton";
import { useAppSelector } from "../../../app/hooks";

interface ItemCustomizerProps {
    item: MenuItemProps;
    onSave: (variant: any, addons: SelectedAddon[], quantity: number) => void;
    onBack: () => void;
    initialVariant?: any;
    initialAddons?: SelectedAddon[];
    initialQuantity?: number;
    title?: string;
    isDealItem?: boolean;
    dealGroupOptions?: any[];
}

const DEFAULT_ADDONS: SelectedAddon[] = [];

const ItemCustomizer: React.FC<ItemCustomizerProps> = ({
    item,
    onSave,
    onBack,
    initialVariant,
    initialAddons = DEFAULT_ADDONS,
    initialQuantity = 1,
    title = "Customize Item",
    isDealItem = false,
    dealGroupOptions = [],
}) => {
    const [selectedVariant, setSelectedVariant] = useState<any>(() => {
        if (initialVariant) {
            if (typeof initialVariant === 'object' && initialVariant !== null) {
                return initialVariant;
            }
            const found = item.variants?.find((v: any) => v.id === initialVariant || v.id === Number(initialVariant));
            if (found) return found;
        }
        return item.variants?.[0] || null;
    });
    const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>(() => {
        if (initialAddons && initialAddons.length > 0) return initialAddons;

        const defaults: SelectedAddon[] = [];
        item.addon_groups?.forEach((group: any) => {
            group.addons?.forEach((addon: any) => {
                if (addon.is_default) {
                    defaults.push({ id: addon.id, name: addon.name, price: addon.price, quantity: 1 });
                }
            });
        });
        return defaults;
    });
    const [quantity, setQuantity] = useState(initialQuantity);
    const [totalPrice, setTotalPrice] = useState(0);

    const selectedStoreId = useAppSelector((state) => state.cart.selectedStoreId);

    const getVariantPriceInfo = (variant: any) => {
        const regularPrice = (() => {
            if (!selectedStoreId) return variant.price;
            const storePrice = variant.store_prices?.find((sp: any) => String(sp.store_id) === String(selectedStoreId));
            return storePrice ? storePrice.price : variant.price;
        })();

        if (!isDealItem) {
            return {
                effectivePrice: regularPrice,
                displayLabel: `₹${regularPrice}`,
                isDealOption: false
            };
        }

        // Inside a Deal: check if this variant is explicitly configured in this deal's options
        const matchingDealOpt = dealGroupOptions?.find(
            (opt: any) => String(opt.menu_item_id) === String(item.id) && String(opt.variant_id) === String(variant.id)
        );

        if (matchingDealOpt) {
            const upcharge = Number(matchingDealOpt.additional_price || 0);
            return {
                effectivePrice: upcharge,
                displayLabel: upcharge > 0 ? `+ ₹${upcharge}` : "INCLUDED",
                isDealOption: true
            };
        } else {
            // Unlisted variant in deal -> actual variant price applies as upcharge
            return {
                effectivePrice: regularPrice,
                displayLabel: `+ ₹${regularPrice}`,
                isDealOption: false
            };
        }
    };

    useEffect(() => {
        const addonsPrice = selectedAddons.reduce((acc, addon) => acc + (addon.price * (addon.quantity || 1)), 0);
        const variantPrice = selectedVariant ? getVariantPriceInfo(selectedVariant).effectivePrice : 0;
        setTotalPrice((variantPrice + addonsPrice) * quantity);
    }, [selectedVariant, selectedAddons, quantity, selectedStoreId, isDealItem, dealGroupOptions]);

    const handleAddonToggle = (addon: { id: string, name: string, price: number }, group: any) => {
        const isSelected = selectedAddons.find(a => a.id === addon.id);

        if (isSelected) {
            setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
        } else {
            const currentGroupAddons = selectedAddons.filter(a =>
                group.addons.find((ga: any) => ga.id === a.id)
            );

            if (currentGroupAddons.length < group.max_selection) {
                setSelectedAddons(prev => [...prev, { id: addon.id, name: addon.name, price: addon.price, quantity: 1 }]);
            } else if (group.max_selection === 1) {
                const otherAddons = selectedAddons.filter(a =>
                    !group.addons.find((ga: any) => ga.id === a.id)
                );
                setSelectedAddons([...otherAddons, { id: addon.id, name: addon.name, price: addon.price, quantity: 1 }]);
            }
        }
    };

    const handleAddonQuantityChange = (addonId: string, delta: number, maxQty: number) => {
        setSelectedAddons(prev => prev.map(a => {
            if (a.id === addonId) {
                const newQty = Math.max(1, Math.min(maxQty, (a.quantity || 1) + delta));
                return { ...a, quantity: newQty };
            }
            return a;
        }));
    };

    const isGroupValid = (group: any) => {
        const count = selectedAddons.filter(a =>
            group.addons.find((ga: any) => ga.id === a.id)
        ).length;
        return count >= group.min_selection && count <= group.max_selection;
    };

    const allGroupsValid = item.addon_groups?.every(isGroupValid) ?? true;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                    <IconButton
                        icon="ri-arrow-left-line"
                        onClick={onBack}
                        variant="ghost"
                        className="hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    />
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{item.name}</h2>
                        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">{title}</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Variants Section */}
                {item.variants && item.variants.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Select Variant/Size</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-black">REQUIRED</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {item.variants.map((variant) => {
                                const isSelected = selectedVariant?.id === variant.id;
                                const priceInfo = getVariantPriceInfo(variant);
                                return (
                                    <label
                                        key={variant.id}
                                        className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${isSelected
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                            : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                checked={isSelected}
                                                onChange={() => setSelectedVariant(variant)}
                                                className="w-4 h-4 text-indigo-600 border-zinc-300 focus:ring-indigo-500"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm block truncate w-32">{variant.name}</span>
                                                {isDealItem && !priceInfo.isDealOption && (
                                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Standard Variant</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`font-black text-sm ${priceInfo.displayLabel === 'INCLUDED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                            {priceInfo.displayLabel}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Addon Groups Section */}
                {item.addon_groups?.map((group) => (
                    <div key={group.id} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">{group.name}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isGroupValid(group) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {group.min_selection > 0 ? `Required: ${group.min_selection}` : 'Optional'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {group.addons.map((addon) => {
                                const isSelected = selectedAddons.find(a => a.id === addon.id);
                                return (
                                    <div
                                        key={addon.id}
                                        className={`flex flex-col p-4 border-2 rounded-2xl transition-all duration-200 ${isSelected
                                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600'
                                            : 'border-zinc-100 dark:border-zinc-800 shadow-sm'
                                            }`}
                                    >
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type={group.max_selection === 1 ? "radio" : "checkbox"}
                                                    checked={!!isSelected}
                                                    onChange={() => handleAddonToggle(addon, group)}
                                                    className="w-4 h-4 text-emerald-600 border-zinc-300 focus:ring-emerald-500"
                                                />
                                                <span className="font-semibold text-sm block truncate w-32">{addon.name}</span>
                                            </div>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs">
                                                {addon.price > 0 ? `+ ₹${addon.price}` : 'FREE'}
                                            </span>
                                        </label>

                                        {isSelected && group.max_quantity_per_addon && group.max_quantity_per_addon > 1 && (
                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/50">
                                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Quantity</span>
                                                <div className="flex items-center gap-3 bg-white dark:bg-emerald-900/30 rounded-lg px-2 py-1 shadow-sm">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); handleAddonQuantityChange(addon.id, -1, group.max_quantity_per_addon || 1); }}
                                                        className="w-6 h-6 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded-md transition-colors"
                                                    >
                                                        <i className="ri-subtract-line text-sm font-semibold"></i>
                                                    </button>
                                                    <span className="font-black text-sm min-w-4 text-center">{isSelected.quantity || 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); handleAddonQuantityChange(addon.id, 1, group.max_quantity_per_addon || 1); }}
                                                        className="w-6 h-6 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded-md transition-colors"
                                                    >
                                                        <i className="ri-add-line text-sm font-semibold"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-3 py-2 shadow-inner">
                        <button
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="w-10 h-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                        >
                            <i className="ri-subtract-line text-xl font-semibold"></i>
                        </button>
                        <span className="font-black text-xl min-w-8 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(q => q + 1)}
                            className="w-10 h-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                        >
                            <i className="ri-add-line text-xl font-semibold"></i>
                        </button>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest leading-none">
                            {isDealItem ? "Customization Upcharge" : "Total Item Price"}
                        </p>
                        <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                            {isDealItem && totalPrice === 0 ? "INCLUDED" : `₹${totalPrice}`}
                        </p>
                    </div>
                </div>
                <Button
                    disabled={!allGroupsValid || !selectedVariant}
                    onClick={() => onSave(selectedVariant, selectedAddons, quantity)}
                    className="w-full py-2 text-lg font-black rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none translate-y-0 active:translate-y-1 transition-all"
                >
                    <i className="ri-check-double-line mr-2 text-xl"></i>
                    CONFIRM SELECTION
                </Button>
            </div>
        </div>
    );
};

export default ItemCustomizer;
