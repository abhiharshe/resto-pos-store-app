import React from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateCustomerDetails } from "../slices/cartSlice";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { motion, AnimatePresence } from "motion/react";

interface CustomerDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const {
        customerName,
        customerPhone,
        customerAddress,
        orderType
    } = useAppSelector((state) => state.cart);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-400/30 dark:bg-slate-900/30 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-xl">
                                <i className="ri-user-smile-line text-xl"></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold dark:text-white">Customer Details</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Information for the order</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                        >
                            <i className="ri-close-line text-xl dark:text-gray-400"></i>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <Input
                            label="Customer Name"
                            placeholder="e.g. John Doe"
                            icon="ri-user-3-line"
                            value={customerName}
                            onChange={(e) => dispatch(updateCustomerDetails({ name: e.target.value }))}
                        />
                        <Input
                            label="Phone Number"
                            placeholder="e.g. +91 9876543210"
                            icon="ri-phone-line"
                            value={customerPhone}
                            onChange={(e) => dispatch(updateCustomerDetails({ phone: e.target.value }))}
                        />
                        {orderType === 'DELIVERY' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1 font-inter">
                                    Delivery Address
                                </label>
                                <textarea
                                    className="w-full min-h-[100px] px-4 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-sm font-inter"
                                    placeholder="Enter complete delivery address..."
                                    value={customerAddress}
                                    onChange={(e) => dispatch(updateCustomerDetails({ address: e.target.value }))}
                                />
                            </div>
                        )}

                        {!customerName && !customerPhone && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/10 p-3 rounded-2xl flex gap-3">
                                <i className="ri-information-line text-amber-500 text-lg"></i>
                                <p className="text-xs text-amber-700 dark:text-amber-400 leading-normal">
                                    Adding customer details helps in tracking orders and providing a personalized experience.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
                        <Button
                            variant="primary"
                            className="w-full py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none"
                            onClick={onClose}
                        >
                            Save & Close
                        </Button>
                    </div>
                </motion.div>
                <div className="absolute bottom-4">
                    <p className="text-[10px] text-center font-semibold text-zinc-400 uppercase tracking-widest">Powered by restopos POS</p>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default CustomerDetailsModal;
