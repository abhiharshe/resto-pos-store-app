import React from "react";
import { motion } from "motion/react";
import { useOrders, useStoreFrontMenuItems, OrderResponse } from "../api/posApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { loadOrder, CartItem, SelectedAddon } from "../slices/cartSlice";
import IconButton from "../../../components/common/IconButton";
import { Button } from "../../../components/common/Button";
import { toast } from "react-hot-toast";
import moment from "moment";

interface DraftOrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DraftOrdersModal: React.FC<DraftOrdersModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const selectedStoreId = useAppSelector((state) => state.cart.selectedStoreId);
    const { data: drafts, isLoading } = useOrders({ store_id: selectedStoreId || 1, status: 'DRAFT' });
    const { data: menuItems } = useStoreFrontMenuItems();

    if (!isOpen) return null;

    const handleResume = (draft: OrderResponse) => {
        if (!menuItems) return;

        try {
            const items: CartItem[] = draft.items.map((item: any) => {
                const menuItem = menuItems.find(m => m.id === item.menu_item_id);
                if (!menuItem) throw new Error(`Menu item ${item.menu_item_id} not found`);

                const selectedAddons: SelectedAddon[] = item.addons.map((a: any) => {
                    // Find addon in menuItem.addon_groups
                    let foundAddon: any = null;
                    menuItem.addon_groups?.forEach(group => {
                        const addon = group.addons.find(ad => ad.id === a.addon_id);
                        if (addon) foundAddon = addon;
                    });
                    return {
                        id: a.addon_id,
                        name: foundAddon?.name || 'Unknown Addon',
                        price: a.price
                    };
                });

                const uniqueId = `${item.menu_item_id}-${selectedAddons.map(a => a.id).sort().join(',')}`;

                return {
                    cartId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    uniqueId,
                    id: item.menu_item_id,
                    name: menuItem.name,
                    variantId: item.variant_id,
                    variantName: item.variant_name,
                    price: item.unit_price,
                    quantity: item.quantity,
                    selectedAddons,
                    totalItemPrice: item.subtotal,
                    originalItem: menuItem,
                    timeStamp: moment().unix()
                };
            });

            dispatch(loadOrder({
                items,
                activeOrderId: draft.id,
                selectedStoreId: draft.store_id || selectedStoreId,
                selectedStore: null,
                customerName: draft.guest_name || '',
                customerPhone: draft.guest_phone || '',
                customerAddress: draft.guest_address || '',
                orderType: draft.order_type as any,
                paymentMode: draft.payment_method as any,
                couponCode: '',
                subtotal: draft.total_amount - (draft.total_amount * 0.05 / 1.05), // Reverse calculation or just simplify
                tax: draft.total_amount * 0.05 / 1.05,
                total: draft.total_amount
            }));

            toast.success("Draft order resumed!");
            onClose();
        } catch (error) {
            console.error("Error resuming draft:", error);
            toast.error("Failed to resume draft. Some items might be unavailable.");
        }
    };

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-400/30 dark:bg-slate-900/30 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-zinc-100 dark:border-zinc-800"
            >
                <div className="p-6 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                    <div>
                        <h2 className="text-xl font-black dark:text-white">Draft Orders</h2>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Saved pending orders</p>
                    </div>
                    <IconButton icon="ri-close-line" variant="ghost" onClick={onClose} />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-semibold text-gray-400 uppercase">Fetching drafts...</p>
                        </div>
                    ) : drafts?.length === 0 ? (
                        <div className="text-center py-12 space-y-4">
                            <i className="ri-draft-line text-6xl text-gray-200 dark:text-gray-700"></i>
                            <p className="text-gray-400 font-semibold uppercase text-sm">No draft orders found</p>
                        </div>
                    ) : (
                        drafts?.map((draft) => (
                            <motion.div
                                key={draft.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-indigo-500 transition-all hover:shadow-lg"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black dark:text-white">#{draft.id}</span>
                                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase">{draft.order_type}</span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500">
                                        {draft.guest_name || 'Walk-in Customer'} • {new Date().toLocaleTimeString()}
                                    </p>
                                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">₹{draft.total_amount.toFixed(2)}</p>
                                </div>
                                <Button
                                    size="sm"
                                    className="rounded-xl px-6 font-black"
                                    onClick={() => handleResume(draft)}
                                >
                                    Resume
                                </Button>
                            </motion.div>
                        ))
                    )}
                </div>
                <div className="absolute bottom-4">
                    <p className="text-xs text-center font-semibold text-zinc-400 uppercase tracking-widest">Powered by restopos POS</p>
                </div>
            </motion.div>
        </div>
    );
};

export default DraftOrdersModal;
