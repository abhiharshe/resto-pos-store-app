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
    updateCartItem
} from "../slices/cartSlice";
import { Button } from "../../../components/common/Button";
import IconButton from "../../../components/common/IconButton";

import { motion, AnimatePresence, useAnimation } from "motion/react";
import CustomizationModal from "./CustomizationModal";
import CheckoutModal from "./CheckoutModal";
import DraftOrdersModal from "./DraftOrdersModal";
import { useCreateOrder } from "../api/posApi";
import { toast } from "react-hot-toast";
import moment from "moment";

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
                drag="x"
                dragConstraints={{ left: -80, right: 0 }}
                dragElastic={0.05}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileDrag={{ cursor: "grabbing" }}
                onDragEnd={(_, info) => {
                    // Snap back if not dragged far enough, or keep open
                    if (info.offset.x > -40) {
                        controls.start({ x: 0 });
                    } else {
                        controls.start({ x: -80 });
                    }
                }}
                exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                className="relative cursor-grab bg-white dark:bg-gray-700 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-600 z-10 touch-pan-y"
                onClick={handleResetPosition}
            >
                <div className="flex justify-between items-start gap-2 text-gray-800 dark:text-gray-100">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{item.name} <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">({item.variantName})</span></h3>
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
                    </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 border dark:border-zinc-700">
                            <button
                                onClick={() => {
                                    console.log("cart-decrement", item);
                                    dispatch(decrementQuantity(item.cartId))
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-zinc-900 shadow-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <i className="ri-subtract-line text-xs"></i>
                            </button>
                            <span className="text-xs font-bold min-w-6 text-center text-indigo-600 dark:text-indigo-400">{item.quantity}</span>
                            <button
                                onClick={() => {
                                    console.log("cart-increment", item);
                                    dispatch(incrementQuantity(item.cartId))
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-zinc-900 shadow-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <i className="ri-add-line text-xs"></i>
                            </button>
                        </div>
                        <button
                            onClick={() => dispatch(removeFromCart(item.cartId))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Remove item"
                        >
                            <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                    </div>
                    <span className="text-[10px] text-gray-400 italic">Rs.{item.price + item.selectedAddons.reduce((a, b) => a + b.price, 0)} each</span>
                </div>
            </motion.div>
        </div>
    );
};

const OrderCart: React.FC<{ setIsCartOpen: (open: boolean) => void, onCustomerClick?: () => void }> = ({ setIsCartOpen, onCustomerClick }) => {
    const dispatch = useAppDispatch();
    const {
        items,
        customerName,
        customerPhone,
        customerAddress,
        orderType,
        paymentMode,
        subtotal,
        tax,
        total,
        selectedStoreId
    } = useAppSelector((state) => state.cart);

    const cartItems = useAppSelector((state) => state.cart.items);
    const cartCount = cartItems.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);


    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);

    const { mutateAsync: createOrder, isPending: isSavingDraft } = useCreateOrder();

    const handleSaveAsDraft = async () => {
        if (items.length === 0) {
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
                items: items.map(item => ({
                    menu_item_id: item.id,
                    variant_id: item.variantId,
                    quantity: item.quantity,
                    addons: item.selectedAddons.map(a => ({ addon_id: a.id }))
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
        if (items.length === 0) return;
        setIsCheckoutModalOpen(true);
    };

    const handleUpdateItem = (variant: any, addons: any[], quantity: number) => {
        if (editingItem) {
            dispatch(updateCartItem({
                cartId: editingItem.cartId,
                newItem: {
                    ...editingItem,
                    variantId: variant.id,
                    variantName: variant.name,
                    price: variant.price,
                    quantity,
                    selectedAddons: addons,
                    uniqueId: `item-${editingItem.id}-var-${variant.id}${addons.map(a => a.id).sort().join('-') ? `-${addons.map(a => a.id).sort().join('-')}` : ''}`,
                    timeStamp: moment().unix()
                }
            }));
            setEditingItem(null);
        }
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
                    {items.length > 0 ? (
                        [...items].sort((a, b) => b.timeStamp - a.timeStamp).map((item) => (
                            <CartItemCard
                                key={item.cartId}
                                item={item}
                                onEdit={setEditingItem}
                            />
                        ))
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
                    <div className="flex justify-between font-black text-lg text-zinc-900 dark:text-white pt-1.5 mt-1 border-t border-zinc-200 dark:border-zinc-700">
                        <span>Total</span>
                        <span className="text-indigo-600 dark:text-indigo-400">Rs.{total.toFixed(2)}</span>
                    </div>
                </div>

                <Button
                    variant="primary"
                    className="w-full py-2 text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none rounded-2xl"
                    disabled={items.length === 0}
                    onClick={handleCheckout}
                >
                    Checkout
                    <i className="ri-arrow-right-line ms-2"></i>
                </Button>
            </div>


            {editingItem && (
                <CustomizationModal
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    item={editingItem.originalItem}
                    initialVariant={{ id: editingItem.variantId, name: editingItem.variantName, price: editingItem.price }}
                    initialAddons={editingItem.selectedAddons}
                    initialQuantity={editingItem.quantity}
                    onAddToCart={handleUpdateItem}
                    mode="edit"
                />
            )}

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
