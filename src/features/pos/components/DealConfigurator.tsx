import React, { useMemo } from "react";
import { Deal, DealSelectionGroup, DealSelectionOption, MenuItemProps, SelectedAddon } from "../api/posApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addDealToCart, CartDealItem } from "../slices/cartSlice";
import { Button } from "../../../components/common/Button";
import IconButton from "../../../components/common/IconButton";
import moment from "moment";

interface DealConfiguratorProps {
    deal: Deal;
    onBack: () => void;
    onCustomizeItem: (groupId: string, option: DealSelectionOption, currentState: any) => void;
    onComplete: () => void;
    selections: SelectionState;
    setSelections: React.Dispatch<React.SetStateAction<SelectionState>>;
}

export interface SelectionState {
    [groupId: number | string]: {
        [optionId: number | string]: {
            selected: boolean;
            quantity: number;
            optionId: number | string;
            groupId: number | string;
            groupName?: string;
            selectionUpcharge: number;
            variantId: string;
            variantName: string;
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

    const storePrice = deal.store_prices.find(p => String(p.store_id) === String(selectedStoreId))?.price || 0;

    const groupCounts = useMemo(() => {
        const counts: { [groupId: string]: number } = {};
        Object.entries(selections).forEach(([groupId, opts]) => {
            counts[String(groupId)] = Object.values(opts).filter(o => o.selected).reduce((acc, o) => acc + (o.quantity || 1), 0);
        });
        return counts;
    }, [selections]);

    const isGroupValid = (group: DealSelectionGroup) => {
        const count = groupCounts[String(group.id)] || 0;
        return count >= group.min_selection && count <= group.max_selection;
    };

    const isAllValid = deal.selection_groups.every(isGroupValid);

    const { selectionUpchargesTotal, addonsTotal, totalPrice } = useMemo(() => {
        let upcharges = 0;
        let addons = 0;

        Object.entries(selections).forEach(([groupIdStr, opts]) => {
            const group = deal.selection_groups.find(g => String(g.id) === String(groupIdStr));
            Object.entries(opts).forEach(([optIdStr, state]) => {
                if (state.selected) {
                    const option = group?.options.find(o => String(o.id) === String(optIdStr));
                    const upcharge = option ? Number(option.additional_price || 0) : Number(state.selectionUpcharge || 0);
                    const itemAddons = (state.selectedAddons || []).reduce((acc, a) => acc + Number(a.price || 0), 0);
                    const qty = state.quantity || 1;

                    upcharges += upcharge * qty;
                    addons += itemAddons * qty;
                }
            });
        });

        return {
            selectionUpchargesTotal: upcharges,
            addonsTotal: addons,
            totalPrice: storePrice + upcharges + addons
        };
    }, [selections, deal.selection_groups, storePrice]);

    const handleToggleOption = (group: DealSelectionGroup, option: DealSelectionOption) => {
        setSelections(prev => {
            const currentGroup = prev[String(group.id)] || {};
            const isSelected = !!currentGroup[String(option.id)]?.selected;

            if (group.max_selection === 1 && !isSelected) {
                const refreshedGroup: any = {};
                if (option.menu_item) {
                    refreshedGroup[String(option.id)] = {
                        selected: true,
                        quantity: 1,
                        optionId: option.id,
                        groupId: group.id,
                        groupName: group.name,
                        selectionUpcharge: Number(option.additional_price || 0),
                        variantId: option.variant_id,
                        variantName: option.variant?.name || 'Default',
                        selectedAddons: [],
                        originalItem: option.menu_item
                    };
                }
                return { ...prev, [String(group.id)]: refreshedGroup };
            }

            if (isSelected) {
                const newGroup = { ...currentGroup };
                delete newGroup[String(option.id)];
                return { ...prev, [String(group.id)]: newGroup };
            } else {
                if ((groupCounts[String(group.id)] || 0) >= group.max_selection) return prev;
                if (!option.menu_item) return prev;
                return {
                    ...prev,
                    [String(group.id)]: {
                        ...currentGroup,
                        [String(option.id)]: {
                            selected: true,
                            quantity: 1,
                            optionId: option.id,
                            groupId: group.id,
                            groupName: group.name,
                            selectionUpcharge: Number(option.additional_price || 0),
                            variantId: option.variant_id,
                            variantName: option.variant?.name || 'Default',
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

        const cartItems: CartDealItem[] = [];
        Object.entries(selections).forEach(([groupIdStr, opts]) => {
            const group = deal.selection_groups.find(g => String(g.id) === String(groupIdStr));
            Object.entries(opts).forEach(([optIdStr, state]) => {
                if (state.selected) {
                    const upcharge = Number(state.selectionUpcharge || 0);
                    const itemAddons = (state.selectedAddons || []).reduce((acc, a) => acc + Number(a.price || 0), 0);
                    const qty = state.quantity || 1;

                    cartItems.push({
                        cartId: `deal-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        id: String(state.originalItem.id),
                        name: state.originalItem.name,
                        variantId: String(state.variantId),
                        variantName: state.variantName,
                        groupId: groupIdStr,
                        groupName: group?.name,
                        optionId: optIdStr,
                        selectionUpcharge: upcharge,
                        selectedAddons: state.selectedAddons || [],
                        addonsPrice: itemAddons,
                        quantity: qty,
                        totalItemPrice: (upcharge + itemAddons) * qty,
                        originalItem: state.originalItem,
                        deal_selection_group_id: groupIdStr,
                        deal_selection_option_id: optIdStr
                    });
                }
            });
        });

        dispatch(addDealToCart({
            id: String(deal.id),
            name: deal.title,
            price: storePrice,
            quantity: 1,
            items: cartItems,
            selectionUpchargesTotal,
            addonsTotal,
            dealUnitPrice: totalPrice,
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
                            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">{deal.selection_groups.length} Selection Groups</p>
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
                                <p className="text-xs text-zinc-400 font-semibold">
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
                                                    <p className="text-xs font-black text-emerald-600 mt-1 uppercase tracking-tighter self-start">+ ₹{option.additional_price}</p>
                                                )}
                                            </div>
                                            {isSelected ? (
                                                <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-90">
                                                    <i className="ri-check-line text-sm font-semibold"></i>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 border-2 border-zinc-200 dark:border-zinc-700 rounded-full shrink-0" />
                                            )}
                                        </div>

                                        {isSelected && hasCustomization && (
                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-emerald-100 dark:border-emerald-900/20">
                                                <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-tight overflow-hidden">
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
                <div className="flex flex-col items-start gap-1">
                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Deal Price Breakdown</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">₹{totalPrice.toFixed(2)}</span>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                            <span>(Base ₹{storePrice.toFixed(2)}</span>
                            {selectionUpchargesTotal > 0 && (
                                <span className="text-emerald-600 font-semibold">+ Upcharges ₹{selectionUpchargesTotal.toFixed(2)}</span>
                            )}
                            {addonsTotal > 0 && (
                                <span className="text-indigo-600 font-semibold">+ Addons ₹{addonsTotal.toFixed(2)}</span>
                            )}
                            <span>)</span>
                        </div>
                    </div>
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
