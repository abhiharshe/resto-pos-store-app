import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    decrementQuantity,
    incrementQuantity,
    removeFromCart,
    setOrderType,
    setPaymentMode,
    clearCart,
    CartItem,
    removeCoupon,
    removeDealFromCart,
    incrementDealQuantity,
    decrementDealQuantity,
} from "../slices/cartSlice";
import { Button } from "../../../components/common/Button";
import IconButton from "../../../components/common/IconButton";

import { motion, AnimatePresence, useAnimation } from "motion/react";
import CheckoutModal from "./CheckoutModal";
import DraftOrdersModal from "./DraftOrdersModal";
import { useCreateOrder } from "../api/posApi";
import { toast } from "react-hot-toast";


interface CartItemCardProps {
    item: CartItem;
    onEdit: (item: CartItem) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, onEdit }) => {
    const dispatch = useAppDispatch();
    const controls = useAnimation();

    // Trigger entry/update animation
    useEffect(() => {
        controls.start({
            opacity: 1,
            y: 0,
            scale: 1,
            x: 0,
            transition: { type: "spring", stiffness: 300, damping: 20 }
        });
    }, [controls, item.uniqueId, item.quantity]);

    const handleEditClick = () => {
        onEdit(item);
        // Reset position smoothly
        controls.start({
            x: 0,
            transition: { type: "spring", bounce: 0, duration: 0.3 }
        });
    };

    const handleResetPosition = () => {
        controls.start({
            x: 0,
            transition: { type: "spring", bounce: 0, duration: 0.3 }
        });
    };

    return (
        <div className="relative group overflow-hidden rounded-xl">
            {/* Action Buttons (Behind) */}
            <div className="absolute inset-0 flex justify-end items-center bg-indigo-600 dark:bg-indigo-500 rounded-xl">
                <button
                    onClick={handleEditClick}
                    className="flex flex-col items-center justify-center text-white p-2 h-full min-w-[60px] hover:bg-white/10 transition-colors"
                >
                    <i className="ri-edit-line text-lg"></i>
                    <span className="text-[10px] font-bold">Edit</span>
                </button>
            </div>

            <motion.div
                animate={controls}
                drag={item.isPromoItem ? false : "x"}
                dragConstraints={{ left: -80, right: 0 }}
                dragElastic={0.05}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileDrag={{ cursor: "grabbing" }}
                onDragEnd={(_, info) => {
                    if (info.offset.x > -40) {
                        controls.start({ x: 0 });
                    } else {
                        controls.start({ x: -80 });
                    }
                }}
                exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                className={`relative cursor-grab bg-white dark:bg-gray-700 rounded-xl p-2 shadow-sm border z-10 touch-pan-y ${item.isPromoItem ? 'border-dashed border-indigo-300 dark:border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-gray-100 dark:border-gray-600'}`}
                onClick={handleResetPosition}
            >
                <div className="flex justify-between items-start gap-2 text-gray-800 dark:text-gray-100">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm truncate">{item.name} <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">({item.variantName})</span></h3>
                            {item.isPromoItem && (
                                <span className="text-[9px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Promo</span>
                            )}
                        </div>
                        {item.selectedAddons.length > 0 && (
                            <div className="mt-0.5 flex flex-wrap gap-1">
                                {item.selectedAddons.map(addon => (
                                    <span key={addon.id} className="text-[9px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1 py-0.5 rounded leading-none">
                                        +{addon.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-sm font-bold">Rs.{item.totalItemPrice}</p>
                        {item.discountedPrice !== undefined && (
                            <p className="text-[10px] text-gray-400 line-through">Rs.{item.price * item.quantity}</p>
                        )}
                    </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 rounded-lg p-1 border ${item.isPromoItem ? 'bg-indigo-100/50 dark:bg-indigo-900/30 border-indigo-200/50' : 'bg-gray-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}>
                            <button
                                onClick={() => !item.isPromoItem && dispatch(decrementQuantity(item.cartId))}
                                disabled={item.isPromoItem}
                                className={`w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-zinc-900 shadow-sm text-indigo-600 dark:text-indigo-400 transition-colors ${item.isPromoItem ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                            >
                                <i className="ri-subtract-line text-xs"></i>
                            </button>
                            <span className="text-xs font-bold min-w-6 text-center text-indigo-600 dark:text-indigo-400">{item.quantity}</span>
                            <button
                                onClick={() => !item.isPromoItem && dispatch(incrementQuantity(item.cartId))}
                                disabled={item.isPromoItem}
                                className={`w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-zinc-900 shadow-sm text-indigo-600 dark:text-indigo-400 transition-colors ${item.isPromoItem ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                            >
                                <i className="ri-add-line text-xs"></i>
                            </button>
                        </div>
                        {!item.isPromoItem && (
                            <button
                                onClick={() => dispatch(removeFromCart(item.cartId))}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                title="Remove item"
                            >
                                <i className="ri-delete-bin-line text-sm"></i>
                            </button>
                        )}
                    </div>
                    <span className="text-[10px] text-gray-400 italic">
                        {item.isPromoItem ? 'Complimentary' : `Rs.${item.discountedPrice ?? item.price + item.selectedAddons.reduce((a, b) => a + b.price, 0)} each`}
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

const CartDealCard: React.FC<{ deal: any }> = ({ deal }) => {
    const dispatch = useAppDispatch();
    return (
        <div className="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/20 space-y-2">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm text-emerald-700 dark:text-emerald-400 truncate flex items-center gap-2">
                        <i className="ri-magic-line text-xs"></i>
                        {deal.name}
                    </h3>
                    <div className="mt-1 space-y-1">
                        {deal.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex flex-col text-[11px] text-zinc-600 dark:text-zinc-300">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-black opacity-40">•</span>
                                    <span className="font-semibold">{item.quantity}x {item.name} {item.variantName && item.variantName !== 'Default' ? `(${item.variantName})` : ''}</span>
                                    {Number(item.selectionUpcharge) > 0 && (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">+Rs.{item.selectionUpcharge}</span>
                                    )}
                                </div>
                                {item.selectedAddons?.length > 0 && (
                                    <div className="ml-3.5 flex flex-wrap gap-1 text-[10px] text-zinc-500">
                                        {item.selectedAddons.map((addon: any, aIdx: number) => (
                                            <span key={aIdx} className="bg-white/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                                                +{addon.name} (+Rs.{addon.price})
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">Rs.{Number(deal.totalDealPrice || 0).toFixed(2)}</p>
                    <p className="text-[10px] text-zinc-400">Rs.{Number(deal.price || 0).toFixed(2)} base</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-lg p-1 bg-white/50 dark:bg-zinc-800 border border-emerald-100 dark:border-emerald-900/30">
                    <button
                        onClick={() => dispatch(decrementDealQuantity(deal.cartId))}
                        className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-zinc-900 shadow-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 transition-colors"
                    >
                        <i className="ri-subtract-line text-xs"></i>
                    </button>
                    <span className="text-xs font-black min-w-6 text-center text-emerald-600 dark:text-emerald-400">{deal.quantity}</span>
                    <button
                        onClick={() => dispatch(incrementDealQuantity(deal.cartId))}
                        className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-zinc-900 shadow-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 transition-colors"
                    >
                        <i className="ri-add-line text-xs"></i>
                    </button>
                </div>
                <button
                    onClick={() => dispatch(removeDealFromCart(deal.cartId))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                    <i className="ri-delete-bin-line text-sm"></i>
                </button>
            </div>
        </div>
    );
};

const OrderCart: React.FC<{ setIsCartOpen: (open: boolean) => void, onCustomerClick?: () => void, onEditItem?: (item: CartItem) => void }> = ({ setIsCartOpen, onCustomerClick, onEditItem }) => {
    const dispatch = useAppDispatch();
    const {
        items,
        deals,
        customerName,
        customerPhone,
        customerAddress,
        orderType,
        paymentMode,
        subtotal,
        tax,
        total,
        discountAmount,
        couponCode,
        selectedStoreId
    } = useAppSelector((state) => state.cart);

    const cartCount = items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0) + 
                      deals.reduce((acc: number, deal: any) => acc + deal.quantity, 0);


    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);


    const { mutateAsync: createOrder, isPending: isSavingDraft } = useCreateOrder();

    const handleSaveAsDraft = async () => {
        if (items.length === 0 && deals.length === 0) {
            toast.error("Cart is empty!");
            return;
        }

        try {
            const orderData = {
                store_id: selectedStoreId || 1,
                order_type: orderType,
                payment_method: paymentMode,
                status: 'DRAFT' as const,
                guest_name: customerName,
                guest_phone: customerPhone,
                guest_address: customerAddress,
                subtotal: subtotal,
                sub_total: subtotal,
                tax_amount: tax,
                total_amount: total,
                items: items.map(item => ({
                    menu_item_id: item.id,
                    variant_id: item.variantId,
                    quantity: item.quantity,
                    addons: item.selectedAddons.map(a => ({ addon_id: a.id }))
                })),
                deals: deals.map(deal => ({
                    deal_id: deal.id,
                    items: deal.items.map(item => ({
                        menu_item_id: item.id,
                        variant_id: item.variantId,
                        quantity: item.quantity,
                        addons: item.selectedAddons.map(a => ({ addon_id: a.id })),
                        deal_selection_group_id: item.groupId || item.deal_selection_group_id,
                        deal_selection_option_id: item.optionId || item.deal_selection_option_id,
                    }))
                }))
            };

            await createOrder(orderData);
            toast.success("Order saved as draft!");
            dispatch(clearCart());
        } catch (error) {
            console.error("Save Draft Error:", error);
            toast.error("Failed to save draft");
        }
    };

    const handleCheckout = () => {
        if (items.length === 0 && deals.length === 0) return;
        setIsCheckoutModalOpen(true);
    };



    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center justify-between p-2">
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-8 h-8 hover:bg-gray-100 dark:hover:bg-zinc-800 md:hidden rounded-full"
                    >
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-300">Your Order ({cartCount})</h3>
                </div>
                <div className="flex items-center gap-1">
                    <IconButton
                        variant="ghost"
                        size="md"
                        icon={`ri-user-settings-line ${customerName || customerPhone ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
                        title="Customer Details"
                        onClick={() => onCustomerClick?.()}
                        className={customerName || customerPhone ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}
                    />
                    <div className="flex items-center gap-1 border-l dark:border-gray-700 ml-1 pl-1">
                        <IconButton
                            icon="ri-draft-line"
                            variant="ghost"
                            size="md"
                            onClick={() => setIsDraftModalOpen(true)}
                            title="View Drafts"
                        />
                        <IconButton
                            icon="ri-save-line"
                            variant="ghost"
                            size="md"
                            onClick={handleSaveAsDraft}
                            disabled={isSavingDraft || items.length === 0}
                            title="Save as Draft"
                        />
                    </div>
                    <IconButton
                        icon="ri-delete-bin-line"
                        variant="danger"
                        size="md"
                        onClick={() => dispatch(clearCart())}
                        title="Clear All Cart and Current Order"
                    />
                </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2">
                <AnimatePresence initial={false}>
                    {items.length > 0 || deals.length > 0 ? (
                        <>
                            {[...items].sort((a, b) => b.timeStamp - a.timeStamp).map((item) => (
                                <CartItemCard
                                    key={item.cartId}
                                    item={item}
                                    onEdit={(item) => onEditItem?.(item)}
                                />
                            ))}
                            {[...deals].sort((a, b) => b.timeStamp - a.timeStamp).map((deal) => (
                                <CartDealCard
                                    key={deal.cartId}
                                    deal={deal}
                                />
                            ))}
                        </>
                    ) : (
                        <motion.div
                            key="empty-cart"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center p-4"
                        >
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <i className="ri-shopping-cart-2-line text-2xl text-gray-400"></i>
                            </div>
                            <p className="text-sm text-gray-500">Your cart is empty</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Order Settings & Summary */}
            <div className="mt-2 pt-2 border-t dark:border-gray-700 space-y-2">
                {/* Compact Customer Summary */}
                {(customerName || customerPhone) && (
                    <div
                        onClick={() => onCustomerClick?.()}
                        className="flex items-center justify-between px-3 py-2 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all group"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <i className="ri-user-star-line text-indigo-600 dark:text-indigo-400"></i>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                                    {customerName || 'Guest Customer'}
                                </p>
                                {customerPhone && (
                                    <p className="text-[10px] text-gray-500 truncate">{customerPhone}</p>
                                )}
                            </div>
                        </div>
                        <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-indigo-500 transition-colors"></i>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest ml-1">Order Type</h3>
                        <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl border dark:border-zinc-700">
                            {(['DINE_IN', 'PICKUP', 'DELIVERY'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => dispatch(setOrderType(type))}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${orderType === type
                                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border dark:border-zinc-700'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {type === 'DINE_IN' ? 'Dine In' : type === 'PICKUP' ? 'Pickup' : 'Delivery'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest ml-1">Payment</h3>
                        <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl border dark:border-zinc-700">
                            {(['CASH', 'ONLINE', 'CARD'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => dispatch(setPaymentMode(mode))}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${paymentMode === mode
                                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border dark:border-zinc-700'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {mode.toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl space-y-1.5 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between text-md text-gray-500 font-medium">
                        <span>Subtotal</span>
                        <span className="text-zinc-900 dark:text-zinc-300">Rs.{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-md text-gray-500 font-medium">
                        <span>Tax (5%)</span>
                        <span className="text-zinc-900 dark:text-zinc-300">Rs.{tax.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-md text-emerald-600 font-bold italic group relative">
                            <span className="flex items-center gap-1">
                                Discount ({couponCode})
                                <button 
                                    onClick={() => dispatch(removeCoupon())}
                                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                    title="Remove Coupon"
                                >
                                    <i className="ri-close-circle-fill"></i>
                                </button>
                            </span>
                            <span>- Rs.{discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-black text-lg text-zinc-900 dark:text-white pt-1.5 mt-1 border-t border-zinc-200 dark:border-zinc-700">
                        <span>Total</span>
                        <span className="text-indigo-600 dark:text-indigo-400">Rs.{total.toFixed(2)}</span>
                    </div>
                </div>

                <Button
                    variant="primary"
                    className="w-full py-2 text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none rounded-2xl"
                    disabled={items.length === 0 && deals.length === 0}
                    onClick={handleCheckout}
                >
                    Checkout
                    <i className="ri-arrow-right-line ms-2"></i>
                </Button>
            </div>




            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
            />
            <DraftOrdersModal
                isOpen={isDraftModalOpen}
                onClose={() => setIsDraftModalOpen(false)}
            />
        </div>
    );
};

export default OrderCart;
