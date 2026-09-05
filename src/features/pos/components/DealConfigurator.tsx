import React, { useState, useMemo } from "react";
import { Deal, DealSelectionGroup, DealSelectionOption, MenuItemProps, SelectedAddon } from "../api/posApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addDealToCart, CartItem } from "../slices/cartSlice";
import { Button } from "../../../components/common/Button";
import IconButton from "../../../components/common/IconButton";
import moment from "moment";

interface DealConfiguratorProps {
    deal: Deal;
    onBack: () => void;
    onCustomizeItem: (groupId: number, option: DealSelectionOption, currentState: any) => void;
    onComplete: () => void;
    selections: SelectionState;
    setSelections: React.Dispatch<React.SetStateAction<SelectionState>>;
}

export interface SelectionState {
    [groupId: number]: {
        [optionId: number]: {
            selected: boolean;
            quantity: number;
            variantId: string;
            variantName: string;
            price: number;
            selectedAddons: SelectedAddon[];
            originalItem: MenuItemProps;
        }
    }
}

const DealConfigurator: React.FC<DealConfiguratorProps> = ({
    deal,
    onBack,
    onCustomizeItem,
    onComplete,
    selections,
    setSelections
}) => {
    const dispatch = useAppDispatch();
    const selectedStoreId = useAppSelector((state) => state.cart.selectedStoreId);

    const storePrice = deal.store_prices.find(p => p.store_id === selectedStoreId)?.price || 0;

    const groupCounts = useMemo(() => {
        const counts: { [groupId: number]: number } = {};
        Object.entries(selections).forEach(([groupId, opts]) => {
            counts[Number(groupId)] = Object.values(opts).filter(o => o.selected).reduce((acc, o) => acc + o.quantity, 0);
        });
        return counts;
    }, [selections]);

    const isGroupValid = (group: DealSelectionGroup) => {
        const count = groupCounts[group.id] || 0;
        return count >= group.min_selection && count <= group.max_selection;
    };

    const isAllValid = deal.selection_groups.every(isGroupValid);

    const totalPrice = useMemo(() => {
        let extra = 0;
        Object.entries(selections).forEach(([groupIdStr, opts]) => {
            const groupId = Number(groupIdStr);
            const group = deal.selection_groups.find(g => g.id === groupId);
            Object.entries(opts).forEach(([optIdStr, state]) => {
                if (state.selected) {
                    const option = group?.options.find(o => o.id === Number(optIdStr));
                    if (option) {
                        extra += (option.additional_price + state.selectedAddons.reduce((acc, a) => acc + a.price, 0)) * state.quantity;
                    }
                }
            });
        });
        return storePrice + extra;
    }, [selections, deal.selection_groups, storePrice]);

    const handleToggleOption = (group: DealSelectionGroup, option: DealSelectionOption) => {
        setSelections(prev => {
            const currentGroup = prev[group.id] || {};
            const isSelected = !!currentGroup[option.id]?.selected;

            if (group.max_selection === 1 && !isSelected) {
                const refreshedGroup: any = {};
                if (option.menu_item) {
                    refreshedGroup[option.id] = {
                        selected: true,
                        quantity: 1,
                        variantId: option.variant_id,
                        variantName: option.variant?.name || 'Default',
                        price: option.variant?.price || 0,
                        selectedAddons: [],
                        originalItem: option.menu_item
                    };
                }
                return { ...prev, [group.id]: refreshedGroup };
            }

            if (isSelected) {
                const newGroup = { ...currentGroup };
                delete newGroup[option.id];
                return { ...prev, [group.id]: newGroup };
            } else {
                if (groupCounts[group.id] >= group.max_selection) return prev;
                if (!option.menu_item) return prev;
                return {
                    ...prev,
                    [group.id]: {
                        ...currentGroup,
                        [option.id]: {
                            selected: true,
                            quantity: 1,
                            variantId: option.variant_id,
                            variantName: option.variant?.name || 'Default',
                            price: option.variant?.price || 0,
                            selectedAddons: [],
                            originalItem: option.menu_item
                        }
                    }
                };
            }
        });
    };

    const handleAddToCart = () => {
        if (!isAllValid) return;

        const cartItems: CartItem[] = [];
        Object.entries(selections).forEach(([groupIdStr, opts]) => {
            const groupId = Number(groupIdStr);
            Object.entries(opts).forEach(([optIdStr, state]) => {
                if (state.selected) {
                    cartItems.push({
                        cartId: `deal-item-${Date.now()}-${Math.random()}`,
                        uniqueId: `deal-${deal.id}-item-${state.originalItem.id}-group-${groupId}`,
                        id: state.originalItem.id,
                        name: state.originalItem.name,
                        variantId: state.variantId,
                        variantName: state.variantName,
                        price: state.price,
                        quantity: state.quantity,
                        selectedAddons: state.selectedAddons,
                        totalItemPrice: 0,
                        originalItem: state.originalItem,
                        timeStamp: moment().unix(),
                        order_deal_id: deal.id,
                        deal_selection_group_id: groupId
                    });
                }
            });
        });

        dispatch(addDealToCart({
            id: deal.id,
            name: deal.title,
            price: storePrice,
            quantity: 1,
            items: cartItems,
            timeStamp: moment().unix()
        }));

        onComplete();
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800">
            {/* Header */}
            <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <IconButton
                        icon="ri-arrow-left-line"
                        onClick={onBack}
                        variant="ghost"
                        className="hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    />
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-xl">
                            <i className="ri-magic-line text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{deal.title}</h3>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{deal.selection_groups.length} Selection Groups</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-8">
                {deal.selection_groups.map((group) => (
                    <div key={group.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    {group.name}
                                    {group.is_required && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black">REQUIRED</span>}
                                </h4>
                                <p className="text-xs text-zinc-400 font-bold">
                                    Choose between {group.min_selection} and {group.max_selection} items
                                </p>
                            </div>
                            <div className={`text-xs font-black px-3 py-1 rounded-lg ${isGroupValid(group) ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                {groupCounts[group.id] || 0} / {group.max_selection}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {group.options.map((option) => {
                                const isSelected = !!selections[group.id]?.[option.id]?.selected;
                                const optState = selections[group.id]?.[option.id];
                                const hasCustomization = (option.menu_item?.addon_groups?.length || 0) > 0 || (option.menu_item?.variants?.length || 0) > 1;

                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => handleToggleOption(group, option)}
                                        className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative group flex flex-col gap-3 ${isSelected
                                            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 shadow-md shadow-emerald-500/10'
                                            : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="font-black text-sm text-zinc-900 dark:text-white truncate">
                                                    {option.menu_item?.name}
                                                    {isSelected && optState && optState.variantName !== 'Default' && (
                                                        <span className="ml-1 text-xs text-emerald-600">({optState.variantName})</span>
                                                    )}
                                                </p>
                                                {option.additional_price > 0 && (
                                                    <p className="text-xs font-black text-emerald-600 mt-1 uppercase tracking-tighter self-start">+ Rs.{option.additional_price}</p>
                                                )}
                                            </div>
                                            {isSelected ? (
                                                <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-90">
                                                    <i className="ri-check-line text-sm font-bold"></i>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 border-2 border-zinc-200 dark:border-zinc-700 rounded-full shrink-0" />
                                            )}
                                        </div>

                                        {isSelected && hasCustomization && (
                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-emerald-100 dark:border-emerald-900/20">
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight overflow-hidden">
                                                    {optState?.selectedAddons.length ? `${optState.selectedAddons.length} addons` : 'Base Item'}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCustomizeItem(group.id, option, optState);
                                                    }}
                                                    className="px-3 py-1 rounded-lg bg-emerald-100 text-[10px] font-black text-emerald-700 hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-tighter flex items-center gap-1"
                                                >
                                                    <i className="ri-equalizer-line"></i>
                                                    Customize
                                                </button>
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
            <div className="p-4 flex flex-row items-center justify-between border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/20">
                <div className="flex flex-col items-start justify-between gap-2">
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Incredible Bundle Price</p>
                    <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Rs.{totalPrice.toFixed(2)}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <p className={`text-xs text-amber-600 font-black flex items-center gap-1 uppercase tracking-tighter ${!isAllValid ? 'animate-pulse' : 'text-green-500'}`}>
                        <i className="ri-error-warning-line"></i>
                        {isAllValid ? 'All Selections Complete' : 'Finish all selections'}
                    </p>
                    <Button
                        variant="primary"
                        className="rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 dark:shadow-none transition-all scale-100 active:scale-95 disabled:opacity-50 disabled:grayscale"
                        onClick={handleAddToCart}
                        disabled={!isAllValid}
                    >
                        <i className="ri-shopping-cart-2-line mr-2 text-xl"></i>
                        ADD DEAL TO CART
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DealConfigurator;
