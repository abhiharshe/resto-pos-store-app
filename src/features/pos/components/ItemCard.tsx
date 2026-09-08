import { MenuItemProps } from "../api/posApi";
import defaultMenuItemImage from "../../../assets/img/default/menu-item.png";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addToCart, decrementQuantity, incrementQuantity } from "../slices/cartSlice";
import moment from "moment";
import { getMediaURL } from "../../../utils/api";

interface ItemCardProps {
    item: MenuItemProps;
    onSelect: () => void;
}

const ItemCard = ({ item, onSelect }: ItemCardProps) => {
    const dispatch = useAppDispatch();

    // For items WITHOUT addons AND exactly 1 variant, we can find them in the cart easily by ID
    const { items, selectedStoreId } = useAppSelector((state) => state.cart);
    const hasAddons = item.addon_groups && item.addon_groups.length > 0;
    const hasMultipleVariants = item.variants && item.variants.length > 1;
    const requiresModal = hasAddons || hasMultipleVariants;

    // Find if this item (without specific addons) is in cart
    const cartItem = !requiresModal ? items.find((i: any) => i.id === item.id) : null;

    const menuItemImage = item.images && item.images.length > 0 ? getMediaURL(item.images[0].image_url) : defaultMenuItemImage;

    const getVariantPrice = (variant: any) => {
        if (!selectedStoreId) return variant.price;
        const storePrice = variant.store_prices?.find((sp: any) => sp.store_id === selectedStoreId);
        return storePrice ? storePrice.price : variant.price;
    };

    const handleAddClick = () => {
        if (!selectedStoreId) {
            alert("Please select a store first!");
            return;
        }
        if (requiresModal) {
            onSelect();
        } else {
            const variant = item.variants[0];
            dispatch(addToCart({
                uniqueId: `item-${item.id}-var-${variant.id}`,
                id: item.id,
                name: item.name,
                variantId: variant.id,
                variantName: variant.name,
                price: getVariantPrice(variant),
                quantity: 1,
                selectedAddons: [],
                originalItem: item,
                timeStamp: moment().unix()
            }));
        }
    };

    return (
        <div
            onClick={handleAddClick}
            className="group border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 flex flex-col gap-3 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-50 dark:hover:shadow-none bg-white dark:bg-zinc-900 border-opacity-60 relative overflow-hidden"
        >
            <div className="flex flex-row gap-4">
                <div className="w-24 h-24 rounded-2xl p-2 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-100 dark:border-zinc-800">
                    <img
                        src={menuItemImage}
                        alt={item.name}
                        onError={(e) => {
                            e.currentTarget.src = defaultMenuItemImage;
                        }}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h2 className="font-semibold text-md text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.name}</h2>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-2 leading-tight font-medium">
                        {item.description || "Freshly prepared with the finest ingredients for your satisfaction."}
                    </p>
                    <div className="mt-2 text-indigo-600 dark:text-indigo-400 font-black text-lg tracking-tighter">
                        {!item.variants || item.variants.length === 0 ? '-' :
                            item.variants.length === 1 ? `₹${getVariantPrice(item.variants[0])}` :
                                `₹${Math.min(...item.variants.map(v => getVariantPrice(v)))}+`
                        }
                    </div>
                </div>
            </div>

            <div className="flex flex-row items-center justify-between mt-auto pt-1">
                {requiresModal ? (
                    <div className="flex items-center gap-1 text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                        <i className="ri-equalizer-line"></i>
                        Customizable
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-[8px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        <i className="ri-check-line"></i>
                        Standard Item
                    </div>
                )}

                <div className="ml-auto">
                    {!requiresModal && cartItem ? (
                        <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl px-1 py-1 shadow-sm border border-indigo-100 dark:border-indigo-800">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(decrementQuantity(cartItem.cartId));
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm hover:bg-indigo-600 hover:text-white transition-all transform active:scale-90"
                            >
                                <i className="ri-subtract-line font-black"></i>
                            </button>
                            <span className="font-black text-zinc-900 dark:text-white min-w-4 text-center">{cartItem.quantity}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(incrementQuantity(cartItem.cartId))
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm hover:bg-indigo-600 hover:text-white transition-all transform active:scale-90"
                            >
                                <i className="ri-add-line font-black"></i>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddClick();
                            }}
                            className={`flex items-center gap-2 rounded-xl px-4 py-1.5 font-black text-xs transition-all shadow-sm border-2 border-indigo-100 dark:border-indigo-900 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 group-active:scale-95`}
                        >
                            <i className={requiresModal ? "ri-equalizer-line" : "ri-add-line"}></i>
                            <span>{requiresModal ? "CONFIGURE" : "ADD"}</span>
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ItemCard;
