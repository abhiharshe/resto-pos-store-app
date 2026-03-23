import { useState } from "react";
import { MenuItemProps, SelectedAddon } from "../api/posApi";
import defaultMenuItemImage from "../../../assets/img/default/menu-item.png";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addToCart, decrementQuantity, incrementQuantity } from "../slices/cartSlice";
import CustomizationModal from "./CustomizationModal";
import moment from "moment";

interface ItemCardProps {
    item: MenuItemProps;
}

const ItemCard = ({ item }: ItemCardProps) => {
    const dispatch = useAppDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // For items WITHOUT addons AND exactly 1 variant, we can find them in the cart easily by ID
    const { items, selectedStoreId } = useAppSelector((state) => state.cart);
    const hasAddons = item.addon_groups && item.addon_groups.length > 0;
    const hasMultipleVariants = item.variants && item.variants.length > 1;
    const requiresModal = hasAddons || hasMultipleVariants;

    // Find if this item (without specific addons) is in cart
    // This only applies correctly to items without addons and only 1 variant.
    const cartItem = !requiresModal ? items.find((i: any) => i.id === item.id) : null;

    const menuItemImage = item.images && item.images.length > 0 ? item.images[0].image_url : defaultMenuItemImage;

    const handleAddClick = () => {
        if (!selectedStoreId) {
            alert("Please select a store first!");
            return;
        }
        if (requiresModal) {
            setIsModalOpen(true);
        } else {
            const variant = item.variants[0];
            dispatch(addToCart({
                uniqueId: `item-${item.id}-var-${variant.id}`,
                id: item.id,
                name: item.name,
                variantId: variant.id,
                variantName: variant.name,
                price: variant.price,
                quantity: 1,
                selectedAddons: [],
                originalItem: item,
                timeStamp: moment().unix()
            }));
        }
    };

    const handleModalAddToCart = (variant: any, selectedAddons: SelectedAddon[], quantity: number) => {
        if (!selectedStoreId) {
            alert("Please select a store first!");
            return;
        }
        // Create a unique ID based on item ID and selected addons + variant
        const addonsId = selectedAddons.map(a => a.id).sort().join('-');
        const uniqueId = `item-${item.id}-var-${variant.id}${addonsId ? `-${addonsId}` : ''}`;

        dispatch(addToCart({
            uniqueId,
            id: item.id,
            name: item.name,
            variantId: variant.id,
            variantName: variant.name,
            price: variant.price,
            quantity,
            selectedAddons,
            originalItem: item,
            timeStamp: moment().unix()
        }));
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="border border-gray-200 dark:border-gray-500 rounded-2xl p-3 flex flex-col gap-3 cursor-pointer transition-all duration-300 hover:shadow hover:shadow-indigo-300 bg-white dark:bg-gray-800 border-opacity-60">
                <div className="flex flex-row gap-3">
                    <div className="w-24 h-24 rounded-xl p-2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border dark:border-gray-700">
                        <img
                            src={menuItemImage}
                            alt={item.name}
                            onError={(e) => {
                                e.currentTarget.src = defaultMenuItemImage;
                            }}
                            className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-md text-gray-800 dark:text-gray-100 truncate">{item.name}</h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description || "No description available for this delicious item."}
                        </p>
                        <div className="mt-2 text-indigo-600 dark:text-indigo-400 font-bold">
                            {!item.variants || item.variants.length === 0 ? '-' :
                                item.variants.length === 1 ? `Rs.${item.variants[0].price}` :
                                    `Rs.${Math.min(...item.variants.map(v => v.price))} - Rs.${Math.max(...item.variants.map(v => v.price))}`
                            }
                        </div>
                    </div>
                </div>

                <div className="flex flex-row items-center justify-between mt-auto pt-1">
                    {requiresModal && (
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">
                            Customizable
                        </span>
                    )}

                    <div className="ml-auto">
                        {!requiresModal && cartItem ? (
                            <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-2 py-1">
                                <button
                                    onClick={() => {
                                        console.log("card-decrement", cartItem.cartId);
                                        dispatch(decrementQuantity(cartItem.cartId));
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-500 hover:text-white transition-colors"
                                >
                                    <i className="ri-subtract-line font-bold"></i>
                                </button>
                                <span className="font-bold text-gray-800 dark:text-white min-w-4 text-center">{cartItem.quantity}</span>
                                <button
                                    onClick={() => {
                                        console.log("card-increment", cartItem.cartId);
                                        dispatch(incrementQuantity(cartItem.cartId))
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-500 hover:text-white transition-colors"
                                >
                                    <i className="ri-add-line font-bold"></i>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleAddClick}
                                className={`flex items-center gap-2 rounded-lg px-2 py-1 font-bold transition-all shadow-md border border-gray-200 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 hover:border-gray-400 dark:hover:border-gray-600`}
                            >
                                {requiresModal ? (
                                    <>
                                        <i className="ri-equalizer-line"></i>
                                        <span>Add</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-add-line"></i>
                                        <span>Add</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div >

            <CustomizationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={item}
                onAddToCart={handleModalAddToCart}
            />
        </>
    );
};

export default ItemCard;
