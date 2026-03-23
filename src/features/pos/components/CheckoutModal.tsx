import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { clearCart, setOrderType, setPaymentMode, updateCustomerDetails } from "../slices/cartSlice";
import { Button } from "../../../components/common/Button";
import IconButton from "../../../components/common/IconButton";
import { useCreateOrder, useUpdateOrderStatus } from "../api/posApi";
import { toast } from "react-hot-toast";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const createOrderMutation = useCreateOrder();
    const updateOrderStatusMutation = useUpdateOrderStatus();

    const {
        items,
        activeOrderId,
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

    const [cashReceived, setCashReceived] = useState<string>("");
    const [change, setChange] = useState<number>(0);
    const [couponCode, setCouponCode] = useState<string>("");
    const [touched, setTouched] = useState({ name: false, phone: false, address: false });
    const [showErrors, setShowErrors] = useState(false);

    const errors = {
        name: !customerName.trim() ? "Customer name is required" : null,
        phone: !customerPhone.trim() ? "Phone number is required" : null,
        address: orderType === 'DELIVERY' && !customerAddress?.trim() ? "Delivery address is required" : null,
    };

    const isFormValid = !errors.name && !errors.phone && !errors.address;

    useEffect(() => {
        const received = parseFloat(cashReceived) || 0;
        setChange(Math.max(0, received - total));
    }, [cashReceived, total]);

    if (!isOpen) return null;

    const handlePlaceOrder = async () => {
        setShowErrors(true);
        setTouched({ name: true, phone: true, address: true });

        if (!isFormValid) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (paymentMode === 'CASH' && (parseFloat(cashReceived) || 0) < total) {
            toast.error("Insufficient cash received");
            return;
        }

        try {
            const orderData = {
                store_id: selectedStoreId || 1,
                order_type: orderType,
                payment_method: paymentMode,
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

            await createOrderMutation.mutateAsync(orderData);

            // If we were editing a draft, mark it as CANCELLED or COMPLETED
            // Since we created a new order (with potentially new items), we cancel the old draft
            if (activeOrderId) {
                await updateOrderStatusMutation.mutateAsync({
                    orderId: activeOrderId,
                    status: 'CANCELLED'
                });
            }

            toast.success("Order placed successfully!");
            dispatch(clearCart());
            onClose();
        } catch (error) {
            toast.error("Failed to place order. Please try again.");
            console.error("Order placement error:", error);
        }
    };

    const isInsufficientCash = paymentMode === 'CASH' && (parseFloat(cashReceived) || 0) < total;
    const isPayDisabled = (showErrors && !isFormValid) || (paymentMode === 'CASH' && isInsufficientCash);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-indigo-600 dark:bg-gray-900">
                    <div>
                        <h2 className="text-2xl font-black text-white">Checkout</h2>
                        <p className="text-indigo-100 text-sm">Finalize your order details</p>
                    </div>
                    <IconButton
                        icon="ri-close-line"
                        variant="ghost"
                        onClick={onClose}
                        className="text-white hover:bg-white/10"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x dark:divide-gray-700">
                    {/* Left Side: Order & Customer Details */}
                    <div className="flex-1 p-6 space-y-8">
                        {/* Order Type */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="ri-EBike-2-line"></i> Order Type
                            </h3>
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl border dark:border-gray-700">
                                {(['DINE_IN', 'PICKUP', 'DELIVERY'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => dispatch(setOrderType(type))}
                                        className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl capitalize transition-all ${orderType === type
                                            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-lg border dark:border-gray-700'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {type === 'DINE_IN' ? 'Dine In' : type === 'PICKUP' ? 'Pickup' : 'Delivery'}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Customer Information */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="ri-user-heart-line"></i> Customer Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Name</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                                        onChange={(e) => dispatch(updateCustomerDetails({ name: e.target.value }))}
                                        placeholder="Enter customer name"
                                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${(showErrors || touched.name) && errors.name ? 'border-red-500' : 'border-transparent dark:border-gray-700'} rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none text-sm font-medium`}
                                    />
                                    {(showErrors || touched.name) && errors.name && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                                        onChange={(e) => dispatch(updateCustomerDetails({ phone: e.target.value }))}
                                        placeholder="Enter phone number"
                                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${(showErrors || touched.phone) && errors.phone ? 'border-red-500' : 'border-transparent dark:border-gray-700'} rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none text-sm font-medium`}
                                    />
                                    {(showErrors || touched.phone) && errors.phone && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.phone}</p>}
                                </div>
                                {orderType === 'DELIVERY' && (
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Delivery Address</label>
                                        <textarea
                                            value={customerAddress}
                                            onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                                            onChange={(e) => dispatch(updateCustomerDetails({ address: e.target.value }))}
                                            placeholder="Enter full delivery address"
                                            rows={2}
                                            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${(showErrors || touched.address) && errors.address ? 'border-red-500' : 'border-transparent dark:border-gray-700'} rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none text-sm font-medium`}
                                        />
                                        {(showErrors || touched.address) && errors.address && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.address}</p>}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Payment Mode */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="ri-bank-card-line"></i> Payment Mode
                            </h3>
                            <div className="flex gap-4">
                                {(['CASH', 'ONLINE', 'CARD'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => dispatch(setPaymentMode(mode))}
                                        className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${paymentMode === mode
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                            : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <i className={mode === 'CASH' ? 'ri-money-dollar-circle-line text-xl' : 'ri-bank-card-2-line text-xl'}></i>
                                        <span className="font-bold capitalize">{mode.toLowerCase()}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Side: Summary & Payment */}
                    <div className="w-full md:w-[380px] p-6 bg-gray-50 dark:bg-gray-900/30 flex flex-col border-l dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Payment Summary</h3>

                        <div className="flex-1 space-y-6">
                            {/* Summary Rows */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-bold">Rs. {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Tax (5%)</span>
                                    <span className="font-bold">Rs. {tax.toFixed(2)}</span>
                                </div>
                                <div className="pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                                    <span className="text-lg font-black dark:text-white uppercase">Grand Total</span>
                                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">Rs. {total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Promo Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="SAVE50"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none text-sm focus:border-indigo-500"
                                    />
                                    <Button variant="outline" className="py-2 px-4 text-xs font-bold">Apply</Button>
                                </div>
                            </div>

                            {/* Cash Handling */}
                            {paymentMode === 'CASH' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 pt-4 border-t dark:border-gray-700 overflow-hidden"
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">Cash Received</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                autoFocus
                                                value={cashReceived}
                                                onChange={(e) => setCashReceived(e.target.value)}
                                                className="w-full pl-11 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900 rounded-xl outline-none text-xl font-black focus:border-indigo-500 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Change Back</p>
                                            <p className={`text-2xl font-black ${change > 0 ? 'text-green-600' : 'text-gray-300 dark:text-gray-600'}`}>Rs. {change.toFixed(2)}</p>
                                        </div>
                                        <i className={`ri-hand-coin-line text-3xl ${change > 0 ? 'text-green-500' : 'text-gray-200 dark:text-gray-700'}`}></i>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Pay Button */}
                        <div className="mt-8">
                            <Button
                                className="w-full py-5 text-lg font-black rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none translate-y-0 active:translate-y-0px"
                                disabled={isPayDisabled || createOrderMutation.isPending || items.length === 0}
                                onClick={handlePlaceOrder}
                            >
                                {createOrderMutation.isPending ? (
                                    <>
                                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {paymentMode === 'CASH' ? <i className="ri-wallet-3-line mr-2"></i> : <i className="ri-bank-card-line mr-2"></i>}
                                        Pay & Place Order
                                    </>
                                )}
                            </Button>
                            {isInsufficientCash && (
                                <p className="text-center text-[10px] text-red-500 font-bold mt-2 uppercase tracking-tighter">Insufficient cash received</p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CheckoutModal;
