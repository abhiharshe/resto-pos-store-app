import React from "react";
import { useAppSelector } from "../../../app/hooks";
import { Button } from "../../../components/common/Button";
import Card from "../../../components/common/Card";

interface CheckoutProps {
    onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onBack }) => {
    const { items, subtotal, tax, total } = useAppSelector((state) => state.cart);

    const handlePlaceOrder = () => {
        // Mock order placement
        alert("Order placed successfully!");
        // dispatch(clearCart());
        // onBack(); // Go back to menu
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                    <i className="ri-arrow-left-line text-xl"></i>
                </Button>
                <h2 className="text-2xl font-bold dark:text-white">Order Summary</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Items Summary */}
                <Card className="md:col-span-2 overflow-hidden">
                    <div className="p-4 border-b dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
                        <h3 className="font-bold">Items</h3>
                    </div>
                    <div className="divide-y dark:divide-zinc-700">
                        {items.map((item) => (
                            <div key={item.uniqueId} className="p-4 flex justify-between items-center bg-white dark:bg-zinc-900">
                                <div>
                                    <p className="font-medium">{item.name} <span className="text-sm text-gray-500">x{item.quantity}</span></p>
                                    <p className="text-xs text-gray-400">
                                        {item.selectedAddons.map(a => a.name).join(", ")}
                                    </p>
                                </div>
                                <p className="font-bold">Rs.{item.totalItemPrice.toFixed(2)}</p>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="p-8 text-center text-gray-500">No items in cart</div>
                        )}
                    </div>
                </Card>

                {/* Final Bill */}
                <div className="space-y-4">
                    <Card className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800">
                        <h3 className="text-lg font-bold mb-4">Final Bill</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>Rs.{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Tax (5%)</span>
                                <span>Rs.{tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t dark:border-zinc-700 pt-3 flex justify-between font-bold text-xl text-indigo-600 dark:text-indigo-400">
                                <span>Total</span>
                                <span>Rs.{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>

                    <Button
                        onClick={handlePlaceOrder}
                        variant="primary"
                        size="lg"
                        className="w-full py-6 text-lg shadow-xl shadow-indigo-200 dark:shadow-none"
                        disabled={items.length === 0}
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
