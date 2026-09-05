import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Deal, DealSelectionOption, MenuCategoryProps, MenuItemProps, useStoreFrontMenuCategories, useStoreFrontMenuItems, useStoreFrontMenus } from "../api/posApi";
import { Button } from "../../../components/common/Button";
import ItemCard from "./ItemCard";
import { Input } from "../../../components/common/Input";
import { CategorySkeleton, MenuItemSkeleton } from "../../../components/common/Skeletons";
import { useStoreFrontDeals } from "../api/posApi";
import DealCard from "./DealCard";
import { addToCart, updateCartItem, CartItem, SelectedAddon } from "../slices/cartSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import moment from "moment";
import DealConfigurator, { SelectionState } from "./DealConfigurator";
import ItemCustomizer from "./ItemCustomizer";


const DEALS_CATEGORY_ID = -1;

type ActiveView = 'GRID' | 'DEAL_CONFIG' | 'ITEM_CUSTOMIZE';

interface MenuItemNavigationProps {
    onNext: () => void;
    onBack: () => void;
    editingCartItem?: CartItem | null;
    onEditComplete?: () => void;
}

const MenuItems: React.FC<MenuItemNavigationProps> = ({ editingCartItem, onEditComplete }) => {
    const dispatch = useAppDispatch();
    const [view, setView] = useState<ActiveView>('GRID');
    const [selectedMenuId, setSelectedMenuId] = useState<number | undefined>(undefined);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState("");
    const carouselRef = useRef<HTMLDivElement>(null);

    // Configuration State
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [dealSelections, setDealSelections] = useState<SelectionState>({});
    const [customizingItem, setCustomizingItem] = useState<{ groupId?: number, option?: DealSelectionOption, item: MenuItemProps } | null>(null);
    const [standaloneItem, setStandaloneItem] = useState<MenuItemProps | null>(null);

    const selectedStoreId = useAppSelector((state) => state.cart.selectedStoreId);

    useEffect(() => {
        if (editingCartItem) {
            setStandaloneItem(editingCartItem.originalItem);
            setView('ITEM_CUSTOMIZE');
        } else {
            setStandaloneItem(null);
            setView('GRID');
        }
    }, [editingCartItem]);

    const { data: menusData } = useStoreFrontMenus();
    const { data: categoriesData, isLoading: categoriesLoading } = useStoreFrontMenuCategories();

    const { data: menuItemsData, isLoading: menuItemsLoading } = useStoreFrontMenuItems({
        menu_id: selectedMenuId,
        category_id: selectedCategoryId === DEALS_CATEGORY_ID ? undefined : selectedCategoryId,
        q: searchQuery || undefined
    });

    const { data: dealsData, isLoading: dealsLoading } = useStoreFrontDeals({
        store_id: selectedStoreId || undefined,
        q: searchQuery || undefined
    });

    const handleMenuClick = (menuId: number) => {
        setSelectedMenuId(prev => prev === menuId ? undefined : menuId);
        setSelectedCategoryId(undefined);
    }

    const handleCategoryClick = (categoryId: number) => {
        setSelectedCategoryId(prev => prev === categoryId ? undefined : categoryId);
        if (categoryId === DEALS_CATEGORY_ID) {
            setSelectedMenuId(undefined);
        }
    }

    const handleAllClick = () => {
        setSelectedMenuId(undefined);
        setSelectedCategoryId(undefined);
        setSearchQuery("");
    }

    // Handlers for Transitions
    const handleSelectDeal = (deal: Deal) => {
        // Initialize selections with defaults
        const initial: SelectionState = {};
        deal.selection_groups.forEach(group => {
            initial[group.id as number] = {};
            group.options.forEach(opt => {
                if (opt.is_default && opt.menu_item) {
                    initial[group.id as number][opt.id as number] = {
                        selected: true,
                        quantity: 1,
                        variantId: opt.variant_id,
                        variantName: opt.variant?.name || 'Default',
                        price: opt.variant?.price || 0,
                        selectedAddons: [],
                        originalItem: opt.menu_item
                    };
                }
            });
        });
        setDealSelections(initial);
        setSelectedDeal(deal);
        setView('DEAL_CONFIG');
    };

    const handleSelectItem = (item: MenuItemProps) => {
        setStandaloneItem(item);
        setView('ITEM_CUSTOMIZE');
    };

    const handleCustomizeDealItem = (groupId: number, option: DealSelectionOption, currentState: any) => {
        if (!option.menu_item) return;
        setCustomizingItem({ groupId, option, item: option.menu_item });
        setView('ITEM_CUSTOMIZE');
    };

    const handleBack = () => {
        if (view === 'ITEM_CUSTOMIZE') {
            if (standaloneItem) {
                setStandaloneItem(null);
                setView('GRID');
                if (editingCartItem) {
                    onEditComplete?.();
                }
            } else {
                setCustomizingItem(null);
                setView('DEAL_CONFIG');
            }
        } else if (view === 'DEAL_CONFIG') {
            setSelectedDeal(null);
            setView('GRID');
        }
    };

    const handleItemSave = (variant: any, addons: SelectedAddon[], quantity: number) => {
        if (standaloneItem) {
            const addonsId = addons.map(a => a.id).sort().join('-');
            const uniqueId = `item-${standaloneItem.id}-var-${variant.id}${addonsId ? `-${addonsId}` : ''}`;

            if (editingCartItem) {
                dispatch(updateCartItem({
                    cartId: editingCartItem.cartId,
                    newItem: {
                        uniqueId,
                        id: standaloneItem.id,
                        name: standaloneItem.name,
                        variantId: variant.id,
                        variantName: variant.name,
                        price: variant.price,
                        quantity,
                        selectedAddons: addons,
                        originalItem: standaloneItem,
                        timeStamp: editingCartItem.timeStamp
                    }
                }));
                onEditComplete?.();
            } else {
                dispatch(addToCart({
                    uniqueId,
                    id: standaloneItem.id,
                    name: standaloneItem.name,
                    variantId: variant.id,
                    variantName: variant.name,
                    price: variant.price,
                    quantity,
                    selectedAddons: addons,
                    originalItem: standaloneItem,
                    timeStamp: moment().unix()
                }));
            }
            setStandaloneItem(null);
            setView('GRID');
        } else if (customizingItem) {
            const { groupId, option } = customizingItem;
            setDealSelections(prev => ({
                ...prev,
                [groupId! as number]: {
                    ...prev[groupId! as number],
                    [option!.id as number]: {
                        ...prev[groupId! as number][option!.id as number],
                        variantId: variant.id,
                        variantName: variant.name,
                        price: variant.price,
                        selectedAddons: addons,
                        quantity
                    }
                }
            }));
            setCustomizingItem(null);
            setView('DEAL_CONFIG');
        }
    };

    return (
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950">
            <AnimatePresence mode="wait">
                {view === 'GRID' && (
                    <motion.div
                        key="grid-view"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col min-h-0"
                    >
                        {
                            menusData && menusData.length > 1 && (
                                <div className="flex items-start gap-2 bg-white dark:bg-zinc-900 p-2 border-b border-zinc-100 dark:border-zinc-800">
                                    {
                                        menusData?.map((menu, index) => (
                                            <button
                                                key={`${menu.id}-${index}`}
                                                onClick={() => handleMenuClick(menu.id)}
                                                className={`flex flex-col items-start border-b-2 px-4 py-2 transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${selectedMenuId === menu.id
                                                    ? "bg-zinc-100 dark:bg-zinc-800 border-indigo-600 dark:border-indigo-500 font-black"
                                                    : "bg-transparent border-transparent text-zinc-400 font-bold"
                                                    }`}
                                            >
                                                <span className="text-sm">{menu.title}</span>
                                                <span className="text-[10px] opacity-60 uppercase tracking-tighter">{menu.serving_from} - {menu.serving_to}</span>
                                            </button>
                                        ))
                                    }
                                </div>
                            )
                        }
                        <div className="relative flex-1 flex flex-col w-full min-h-0 transition-all">
                            <div className="sticky top-0 z-10 w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/50 backdrop-blur-md p-3 sm:p-2 border-b border-zinc-200 dark:border-zinc-800">
                                {
                                    categoriesData && categoriesData.length > 0 && (
                                        <div className="flex-1 flex flex-row items-center gap-2 overflow-hidden">
                                            <div className="shrink-0 text-zinc-400 dark:text-zinc-600 px-2">
                                                <i className="ri-filter-3-line text-lg"></i>
                                            </div>
                                            <div className="shrink-0 text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-600 mr-2 border-r border-zinc-200 dark:border-zinc-800 pr-3">Filter</div>
                                            <div className="shrink-0">
                                                <Button
                                                    variant={selectedMenuId === undefined && selectedCategoryId === undefined && searchQuery === "" ? "primary" : "outline"}
                                                    key={`clear-all-category`}
                                                    onClick={handleAllClick}
                                                    size="sm"
                                                    className="whitespace-nowrap px-6 py-2 shadow-sm rounded-xl font-black transition-all"
                                                >
                                                    <span>All</span>
                                                </Button>
                                            </div>
                                            <div className="shrink-0">
                                                <Button
                                                    variant={selectedCategoryId === DEALS_CATEGORY_ID ? "primary" : "outline"}
                                                    key={`deals-category`}
                                                    onClick={() => handleCategoryClick(DEALS_CATEGORY_ID)}
                                                    size="sm"
                                                    className="whitespace-nowrap px-6 py-2 shadow-sm border-emerald-200 dark:border-emerald-900/30 font-black rounded-xl transition-all"
                                                >
                                                    <i className="ri-magic-line mr-1 text-emerald-500"></i>
                                                    <span>Deals</span>
                                                </Button>
                                            </div>
                                            <div ref={carouselRef} className="flex-1 overflow-hidden">
                                                <motion.div
                                                    drag="x"
                                                    dragConstraints={carouselRef}
                                                    className="flex flex-row gap-2 w-max px-1 cursor-grab active:cursor-grabbing"
                                                >
                                                    {
                                                        categoriesLoading ? (
                                                            Array.from({ length: 5 }).map((_, i) => (
                                                                <CategorySkeleton key={`cat-skeleton-${i}`} />
                                                            ))
                                                        ) : (
                                                            categoriesData?.map((category: MenuCategoryProps, index) => (
                                                                <Button
                                                                    variant={selectedCategoryId === category.id ? "primary" : "outline"}
                                                                    key={`${category.id}-${index}`}
                                                                    onClick={() => handleCategoryClick(category.id)}
                                                                    size="sm"
                                                                    className="whitespace-nowrap px-6 py-2 flex-shrink-0 shadow-sm rounded-xl font-black transition-all"
                                                                >
                                                                    <span>{category.name}</span>
                                                                </Button>
                                                            ))
                                                        )
                                                    }
                                                </motion.div>
                                            </div>
                                        </div>
                                    )
                                }
                                <div className="w-full sm:w-64">
                                    <Input
                                        id="search-menu-items"
                                        placeholder="Search Menu Items/Dishes"
                                        icon="ri-search-line"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 transition-all focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="w-full flex-1 min-h-0 overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-2 p-2 ">
                                    {
                                        selectedCategoryId === DEALS_CATEGORY_ID ? (
                                            dealsLoading ? (
                                                Array.from({ length: 4 }).map((_, i) => (
                                                    <MenuItemSkeleton key={`deal-skeleton-${i}`} />
                                                ))
                                            ) : dealsData && dealsData.length > 0 ? (
                                                dealsData.map((deal, index) => (
                                                    <DealCard key={`${deal.id}-${index}`} deal={deal} onSelect={() => handleSelectDeal(deal)} />
                                                ))
                                            ) : (
                                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 shadow-inner">
                                                    <i className="ri-magic-line text-5xl mb-3 opacity-10"></i>
                                                    <p className="font-black uppercase tracking-widest text-xs">No active deals found</p>
                                                    <p className="text-[10px] mt-1">Try another category or store</p>
                                                </div>
                                            )
                                        ) : (
                                            menuItemsLoading ? (
                                                Array.from({ length: 8 }).map((_, i) => (
                                                    <MenuItemSkeleton key={`item-skeleton-${i}`} />
                                                ))
                                            ) : menuItemsData && menuItemsData.length > 0 ? (
                                                menuItemsData?.map((menuItem, index) => (
                                                    <ItemCard key={`${menuItem.id}-${index}`} item={menuItem} onSelect={() => handleSelectItem(menuItem)} />
                                                ))
                                            ) : (
                                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 shadow-inner">
                                                    <i className="ri-search-2-line text-5xl mb-3 opacity-10"></i>
                                                    <p className="font-black uppercase tracking-widest text-xs">No items found</p>
                                                    <p className="text-[10px] mt-1">Try searching for something else</p>
                                                </div>
                                            )
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'DEAL_CONFIG' && selectedDeal && (
                    <motion.div
                        key="deal-config-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex-1 h-full"
                    >
                        <DealConfigurator
                            deal={selectedDeal}
                            onBack={handleBack}
                            onCustomizeItem={handleCustomizeDealItem}
                            onComplete={() => setView('GRID')}
                            selections={dealSelections}
                            setSelections={setDealSelections}
                        />
                    </motion.div>
                )}

                {view === 'ITEM_CUSTOMIZE' && (standaloneItem || customizingItem) && (
                    <motion.div
                        key="item-customize-view"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex-1 h-full"
                    >
                        <ItemCustomizer
                            item={standaloneItem || customizingItem!.item}
                            onBack={handleBack}
                            onSave={handleItemSave}
                            title={customizingItem ? "Customize Deal Item" : "Configure Customizations"}
                            initialVariant={customizingItem ? dealSelections[customizingItem.groupId! as number][customizingItem.option!.id as number].variantId : (editingCartItem ? editingCartItem.variantId : undefined)}
                            initialAddons={customizingItem ? dealSelections[customizingItem.groupId! as number][customizingItem.option!.id as number].selectedAddons : (editingCartItem ? editingCartItem.selectedAddons : undefined)}
                            initialQuantity={customizingItem ? dealSelections[customizingItem.groupId! as number][customizingItem.option!.id as number].quantity : (editingCartItem ? editingCartItem.quantity : undefined)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MenuItems;
