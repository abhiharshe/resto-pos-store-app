import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { 
    clearCart, 
    setOrderType, 
    setPaymentMode, 
    updateCustomerDetails, 
    applyCoupon, 
    removeCoupon,
    toggleWalkIn
} from "../slices/cartSlice";
import { Button } from "../../../components/common/Button";
import IconButton from "../../../components/common/IconButton";
import { PhoneInput } from "../../../components/common/PhoneInput";
import { useCreateOrder, useUpdateOrderStatus } from "../api/posApi";
import { useValidateCoupon } from "../../coupons/api/couponsApi";
import { useCalculateOrderPreview } from "../../settings/api/chargesApi";
import { toast } from "react-hot-toast";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const createOrderMutation = useCreateOrder();
    const updateOrderStatusMutation = useUpdateOrderStatus();
    const calculatePreviewMutation = useCalculateOrderPreview();

    const {
        items,
        deals,
        activeOrderId,
        customerName,
        customerPhone,
        customerAddress,
        isWalkIn,
        orderType,
        paymentMode,
        subtotal,
        tax,
        total,
        discountAmount,
        couponCode: appliedCouponCode,
        selectedStoreId,
        selectedStore
    } = useAppSelector((state) => state.cart);

    const [distanceKm, setDistanceKm] = useState<string>("5");
    const [calculatedFees, setCalculatedFees] = useState<{
        net_food_value: number;
        packaging_charge: number;
        packaging_charge_source: string;
        delivery_charge: number;
        delivery_charge_source: string;
        tax_amount: number;
        service_charge: number;
        total_amount: number;
    } | null>(null);

    const [cashReceived, setCashReceived] = useState<string>("");
    const [change, setChange] = useState<number>(0);
    const [couponInput, setCouponInput] = useState<string>("");
    const [touched, setTouched] = useState({ name: false, phone: false, address: false, distance: false });
    const [showErrors, setShowErrors] = useState(false);

    // Fetch calculation preview whenever cart, orderType, or distanceKm changes
    useEffect(() => {
        if (!isOpen || !selectedStoreId) return;

        const timer = setTimeout(async () => {
            try {
                const res = await calculatePreviewMutation.mutateAsync({
                    store_id: String(selectedStoreId),
                    order_type: orderType,
                    subtotal: subtotal,
                    discount_amount: discountAmount,
                    distance_km: orderType === 'DELIVERY' ? parseFloat(distanceKm) || 0 : undefined,
                    coupon_code: appliedCouponCode || undefined,
                });
                setCalculatedFees(res);
            } catch (e) {
                console.error("Preview calculation failed", e);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [isOpen, selectedStoreId, orderType, subtotal, discountAmount, distanceKm, appliedCouponCode]);

    const effectiveTotal = calculatedFees ? calculatedFees.total_amount : total;

    // Only mandatory for PICKUP and DELIVERY
    const isDetailsRequired = orderType !== 'DINE_IN' && !isWalkIn;

    const errors = {
        name: isDetailsRequired && !customerName.trim() ? "Customer name is required" : null,
        phone: isDetailsRequired && !customerPhone.trim() ? "Phone number is required" : null,
        address: orderType === 'DELIVERY' && !customerAddress?.trim() ? "Delivery address is required" : null,
        distance: orderType === 'DELIVERY' && (parseFloat(distanceKm) < 0 || isNaN(parseFloat(distanceKm))) ? "Valid distance is required" : null,
    };

    const isFormValid = !errors.name && !errors.phone && !errors.address && !errors.distance;
    const validateCouponMutation = useValidateCoupon();

    useEffect(() => {
        const received = parseFloat(cashReceived) || 0;
        setChange(Math.max(0, received - effectiveTotal));
    }, [cashReceived, effectiveTotal]);

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;

        try {
            const result = await validateCouponMutation.mutateAsync({
                code: couponInput,
                store_id: selectedStoreId || 1,
                subtotal: subtotal,
                customer_phone: customerPhone || undefined
            });

            if (result.is_valid) {
                dispatch(applyCoupon({ code: couponInput, discount: result.discount_amount }));
                toast.success(result.message);
                setCouponInput("");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to validate coupon");
        }
    };

    if (!isOpen) return null;

    const handlePlaceOrder = async () => {
        setShowErrors(true);
        setTouched({ name: true, phone: true, address: true, distance: true });

        if (!isFormValid) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (paymentMode === 'CASH' && (parseFloat(cashReceived) || 0) < effectiveTotal) {
            toast.error("Insufficient cash received");
            return;
        }

        try {
            const receivedVal = parseFloat(cashReceived) || 0;
            const changeVal = paymentMode === 'CASH' ? Math.max(0, receivedVal - effectiveTotal) : 0;
            const distNum = orderType === 'DELIVERY' ? parseFloat(distanceKm) || 0 : undefined;

            const orderData = {
                store_id: selectedStoreId || 1,
                order_type: orderType,
                payment_method: paymentMode,
                guest_name: customerName,
                guest_phone: customerPhone,
                guest_address: customerAddress,
                distance_km: distNum,
                delivery_distance_km: distNum,
                coupon_code: appliedCouponCode || undefined,
                subtotal: subtotal,
                sub_total: subtotal,
                tax_amount: calculatedFees ? calculatedFees.tax_amount : tax,
                total_amount: effectiveTotal,
                cash_received: paymentMode === 'CASH' ? receivedVal : undefined,
                change_amount: paymentMode === 'CASH' ? changeVal : undefined,
                change: paymentMode === 'CASH' ? changeVal : undefined,
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

            await createOrderMutation.mutateAsync(orderData);

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

    const isInsufficientCash = paymentMode === 'CASH' && (parseFloat(cashReceived) || 0) < effectiveTotal;
    const isPayDisabled = (showErrors && !isFormValid) || (paymentMode === 'CASH' && isInsufficientCash);

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-400/30 dark:bg-slate-900/30 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-zinc-100 dark:border-zinc-800"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-indigo-600 dark:bg-zinc-900">
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
                <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x border-zinc-100 dark:divide-zinc-800">
                    {/* Left Side: Order & Customer Details */}
                    <div className="flex-1 p-6 space-y-8">
                        {/* Order Type */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <i className="ri-EBike-2-line"></i> Order Type
                                </h3>
                                
                                {/* Walk-in Toggle in Modal */}
                                <button
                                    onClick={() => dispatch(toggleWalkIn())}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                                        isWalkIn 
                                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-gray-500'
                                    }`}
                                >
                                    <i className={`ri-walk-line ${isWalkIn ? 'text-white' : 'text-gray-400'}`}></i>
                                    <span className="text-xs font-bold">Walk-In</span>
                                </button>
                            </div>
                            <div className="flex gap-2 p-1 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                {(['DINE_IN', 'PICKUP', 'DELIVERY'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => dispatch(setOrderType(type))}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${orderType === type
                                            ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-lg border border-zinc-100 dark:border-zinc-800'
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Name</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        disabled={isWalkIn}
                                        onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                                        onChange={(e) => dispatch(updateCustomerDetails({ name: e.target.value }))}
                                        placeholder="Enter customer name"
                                        className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border ${isWalkIn ? 'opacity-50' : ''} ${(showErrors || touched.name) && errors.name ? 'border-red-500' : 'border-zinc-100 dark:border-zinc-800'} rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none text-sm font-medium`}
                                    />
                                    {(showErrors || touched.name) && errors.name && <p className="text-[10px] text-red-500 ml-1 font-bold italic">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5 overflow-visible">
                                    <PhoneInput
                                        label="Phone"
                                        value={customerPhone}
                                        disabled={isWalkIn}
                                        error={(showErrors || touched.phone) && errors.phone ? errors.phone : undefined}
                                        onChange={(val) => dispatch(updateCustomerDetails({ phone: val }))}
                                    />
                                </div>
                                {orderType === 'DELIVERY' && (
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 ml-1">Delivery Address</label>
                                            <textarea
                                                value={customerAddress}
                                                onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                                                onChange={(e) => dispatch(updateCustomerDetails({ address: e.target.value }))}
                                                placeholder="Enter full delivery address"
                                                rows={2}
                                                className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border ${(showErrors || touched.address) && errors.address ? 'border-red-500' : 'border-zinc-100 dark:border-zinc-800'} rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none text-sm font-medium`}
                                            />
                                            {(showErrors || touched.address) && errors.address && <p className="text-[10px] text-red-500 ml-1 font-bold italic">{errors.address}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 ml-1">Distance (KM)</label>
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.1"
                                                value={distanceKm}
                                                onBlur={() => setTouched(prev => ({ ...prev, distance: true }))}
                                                onChange={(e) => setDistanceKm(e.target.value)}
                                                placeholder="e.g. 5.0"
                                                className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border ${(showErrors || touched.distance) && errors.distance ? 'border-red-500' : 'border-zinc-100 dark:border-zinc-800'} rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none text-sm font-medium`}
                                            />
                                            {(showErrors || touched.distance) && errors.distance && <p className="text-[10px] text-red-500 ml-1 font-bold italic">{errors.distance}</p>}
                                        </div>
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
                                            : 'border-zinc-50 dark:border-zinc-800 hover:border-zinc-100 dark:hover:border-zinc-700'
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
                    <div className="w-full md:w-[380px] p-6 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col border-l border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Payment Summary</h3>

                        <div className="flex-1 space-y-6">
                            {/* Summary Rows */}
                            <div className="space-y-2.5">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Items Subtotal</span>
                                    <span className="font-bold">Rs. {subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 font-bold italic">
                                        <span>Discount ({appliedCouponCode || 'Coupon'})</span>
                                        <span>- Rs. {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-xs text-zinc-400 font-medium">
                                        <span>Net Food Value</span>
                                        <span>Rs. {Math.max(0, subtotal - discountAmount).toFixed(2)}</span>
                                    </div>
                                )}
                                {calculatedFees && (orderType === 'DELIVERY' || orderType === 'PICKUP') && (
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 items-center">
                                        <div className="flex items-center gap-1.5">
                                            <span>Packaging Charge</span>
                                            <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded font-bold text-zinc-600 dark:text-zinc-300">
                                                {calculatedFees.packaging_charge_source}
                                            </span>
                                        </div>
                                        <span className="font-bold">Rs. {calculatedFees.packaging_charge.toFixed(2)}</span>
                                    </div>
                                )}
                                {calculatedFees && orderType === 'DELIVERY' && (
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 items-center">
                                        <div className="flex items-center gap-1.5">
                                            <span>Delivery Charge</span>
                                            <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded font-bold text-zinc-600 dark:text-zinc-300">
                                                {calculatedFees.delivery_charge_source}
                                            </span>
                                        </div>
                                        <span className="font-bold">Rs. {calculatedFees.delivery_charge.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Tax</span>
                                    <span className="font-bold">Rs. {(calculatedFees ? calculatedFees.tax_amount : tax).toFixed(2)}</span>
                                </div>
                                {calculatedFees && calculatedFees.service_charge > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Service Charge</span>
                                        <span className="font-bold">Rs. {calculatedFees.service_charge.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                    <span className="text-lg font-black dark:text-white uppercase">Grand Total</span>
                                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">Rs. {effectiveTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Promo Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="SAVE50"
                                        value={appliedCouponCode || couponInput}
                                        disabled={!!appliedCouponCode}
                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        className="flex-1 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl outline-none text-sm focus:border-indigo-500 disabled:opacity-50 disabled:bg-zinc-50 dark:disabled:bg-zinc-950"
                                    />
                                    {appliedCouponCode ? (
                                        <Button
                                            variant="outline"
                                            className="py-2 px-4 text-xs font-bold text-red-500 border-red-200"
                                            onClick={() => dispatch(removeCoupon())}
                                        >
                                            Remove
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="py-2 px-4 text-xs font-bold"
                                            onClick={handleApplyCoupon}
                                            isLoading={validateCouponMutation.isPending}
                                        >
                                            Apply
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Cash Handling */}
                            {paymentMode === 'CASH' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 overflow-hidden"
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
                                                className="w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-800 border-2 border-indigo-50 dark:border-indigo-900/40 rounded-xl outline-none text-xl font-black focus:border-indigo-500 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-white dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
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
                                disabled={isPayDisabled || createOrderMutation.isPending || (items.length === 0 && deals.length === 0)}
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
