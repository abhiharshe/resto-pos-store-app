import React from "react";
import Card from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useCreateOrder, OrderCreateData } from "../../orders/api/ordersApi";
import { clearCart } from "../slices/cartSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface CheckoutProps {
    onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onBack }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const createOrder = useCreateOrder();

    const {
        items, deals, subtotal, tax, total,
        customerName, customerPhone, customerAddress,
        orderType, paymentMode, couponCode, selectedStoreId
    } = useAppSelector((state) => state.cart);

    const handlePlaceOrder = async () => {
        if (!selectedStoreId) {
            toast.error("Please select a store first");
            return;
        }

        const orderData: OrderCreateData = {
            store_id: selectedStoreId,
            order_type: orderType,
            payment_method: paymentMode,
            status: 'PENDING',
            guest_name: customerName,
            guest_phone: customerPhone,
            guest_address: customerAddress,
            coupon_code: couponCode || undefined,
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
                    deal_selection_group_id: (item as any).deal_selection_group_id
                }))
            }))
        };

        try {
            const result = await createOrder.mutateAsync(orderData);
            toast.success(`Order #${result.id} placed successfully!`);
            dispatch(clearCart());
            navigate(`/orders/${result.id}`);
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || "Failed to place order";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 h-full overflow-y-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                    <i className="ri-arrow-left-line text-xl"></i>
                </Button>
                <h2 className="text-2xl font-semibold dark:text-white">Order Summary</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Items Summary */}
                <Card className="md:col-span-2 overflow-hidden">
                    <div className="p-4 border-b dark:border-zinc-700 bg-gray-50 dark:bg-neutral-800">
                        <h3 className="font-semibold">Items</h3>
                    </div>
                    <div className="divide-y dark:divide-zinc-700 bg-white dark:bg-mauve-900">
                        {/* Deals */}
                        {deals.map((deal) => (
                            <div key={deal.cartId} className="p-4 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/10 dark:bg-emerald-900/10">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center">
                                            <i className="ri-magic-line"></i>
                                        </div>
                                        <div>
                                            <p className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter leading-none">{deal.name}</p>
                                            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest mt-1">Deal Bundle</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-neutral-900 dark:text-white">₹{deal.totalDealPrice.toFixed(2)}</p>
                                </div>
                                <div className="pl-10 space-y-2">
                                    {deal.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-xs">
                                            <span className="text-zinc-500 font-medium">{item.quantity}x {item.name}</span>
                                            {item.variantName !== 'Default' && (
                                                <span className="text-zinc-400">({item.variantName})</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Standalone Items */}
                        {items.map((item) => (
                            <div key={item.uniqueId} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{item.name} <span className="text-sm text-zinc-400 font-medium">x{item.quantity}</span></p>
                                    <div className="flex gap-2 items-center mt-1">
                                        {item.variantName !== 'Default' && (
                                            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">{item.variantName}</span>
                                        )}
                                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest">
                                            {item.selectedAddons.map(a => a.name).join(", ")}
                                        </p>
                                    </div>
                                </div>
                                <p className="font-black text-neutral-900 dark:text-white">₹{item.totalItemPrice.toFixed(2)}</p>
                            </div>
                        ))}

                        {items.length === 0 && deals.length === 0 && (
                            <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-2">
                                <i className="ri-shopping-basket-line text-4xl opacity-20"></i>
                                <p className="font-semibold uppercase tracking-widest text-xs">No items in cart</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Final Bill */}
                <div className="space-y-4">
                    <Card className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800">
                        <h3 className="text-lg font-semibold mb-4">Final Bill</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Tax (5%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t dark:border-zinc-700 pt-3 flex justify-between font-semibold text-xl text-indigo-600 dark:text-indigo-400">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>

                    <Button
                        onClick={handlePlaceOrder}
                        variant="primary"
                        size="lg"
                        className="w-full py-6 text-lg shadow-xl shadow-indigo-200 dark:shadow-none font-black tracking-tighter rounded-2xl transition-all scale-100 active:scale-95"
                        disabled={items.length === 0 && deals.length === 0}
                        isLoading={createOrder.isPending}
                    >
                        Confirm & Place Order
                        <i className="ri-check-double-line ms-2"></i>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
