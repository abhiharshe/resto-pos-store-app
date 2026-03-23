import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { MenuCategoryProps, useStoreFrontMenuCategories, useStoreFrontMenuItems, useStoreFrontMenus } from "../api/posApi";
import { Button } from "../../../components/common/Button";
import ItemCard from "./ItemCard";
import { Input } from "../../../components/common/Input";
import { CategorySkeleton, MenuItemSkeleton } from "../../../components/common/Skeletons";

interface MenuItemNavigationProps {
    onNext: () => void;
    onBack: () => void;
}

const MenuItems: React.FC<MenuItemNavigationProps> = ({ onNext, onBack }) => {
    const [selectedMenuId, setSelectedMenuId] = useState<number | undefined>(undefined);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState("");
    const carouselRef = useRef<HTMLDivElement>(null);

    const { data: menusData } = useStoreFrontMenus();
    const { data: categoriesData, isLoading: categoriesLoading } = useStoreFrontMenuCategories();
    const { data: menuItemsData, isLoading: menuItemsLoading } = useStoreFrontMenuItems({
        menu_id: selectedMenuId,
        category_id: selectedCategoryId,
        q: searchQuery || undefined
    });

    const handleMenuClick = (menuId: number) => {
        setSelectedMenuId(prev => prev === menuId ? undefined : menuId);
        // When switching menus, we might want to clear category, but let's keep it flexible
        // or clear it if it doesn't belong to the new menu. 
        // For now, let's just set the menu.
        setSelectedCategoryId(undefined);
    }

    const handleCategoryClick = (categoryId: number) => {
        setSelectedCategoryId(prev => prev === categoryId ? undefined : categoryId);
    }

    const handleAllClick = () => {
        setSelectedMenuId(undefined);
        setSelectedCategoryId(undefined);
        setSearchQuery("");
    }

    return (
        <div className="flex-1">
            {
                menusData && menusData.length > 1 && (
                    <div className="flex items-start gap-2">
                        {
                            menusData?.map((menu, index) => (
                                <button
                                    key={`${menu.id}-${index}`}
                                    onClick={() => handleMenuClick(menu.id)}
                                    className={`flex flex-col items-start border-b-2 px-2 py-1 hover:bg-slate-300 dark:hover:bg-slate-700 ${selectedMenuId === menu.id
                                        ? "bg-slate-300 dark:bg-slate-700 border-primary"
                                        : "bg-slate-200 border-gray-400 dark:border-gray-700"
                                        }`}
                                >
                                    <span>{menu.title}</span>
                                    <span className="text-xs">{menu.serving_from} - {menu.serving_to}</span>
                                </button>
                            ))
                        }
                    </div>
                )
            }
            <div className="relative flex flex-col items-start w-full">
                <div className="sticky top-0 z-10 w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-100 dark:bg-zinc-800 p-3 sm:p-2 border-b dark:border-zinc-700">
                    {
                        categoriesData && categoriesData.length > 0 && (
                            <div className="flex-1 flex flex-row items-center gap-2 overflow-hidden">
                                <div className="flex-shrink-0">
                                    <Button
                                        variant={selectedMenuId === undefined && selectedCategoryId === undefined && searchQuery === "" ? "primary" : "outline"}
                                        key={`clear-all-category`}
                                        onClick={handleAllClick}
                                        size="sm"
                                        className="whitespace-nowrap px-4 py-2 shadow-sm"
                                    >
                                        <span>All</span>
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
                                                        className="whitespace-nowrap px-4 py-2 flex-shrink-0 shadow-sm"
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
                        />
                    </div>
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-3">
                    {
                        menuItemsLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <MenuItemSkeleton key={`item-skeleton-${i}`} />
                            ))
                        ) : menuItemsData && menuItemsData.length > 0 ? (
                            menuItemsData?.map((menuItem, index) => (
                                <ItemCard key={`${menuItem.id}-${index}`} item={menuItem} />
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                                <i className="ri-search-2-line text-4xl mb-2 opacity-20"></i>
                                <p>No items found matching your filters.</p>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default MenuItems;
