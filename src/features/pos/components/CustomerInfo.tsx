import React from "react";
import { AnimatePresence, motion } from 'motion/react';
import { Input } from "../../../components/common/Input";
import { PhoneInput } from "../../../components/common/PhoneInput";
import Card from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateCustomerDetails, toggleWalkIn } from "../slices/cartSlice";

interface CustomerInfoProps {
    onNext: () => void;
    onBack: () => void;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ onNext, onBack }) => {
    const dispatch = useAppDispatch();
    const { customerName, customerPhone, isWalkIn, orderType } = useAppSelector((state) => state.cart);

    const isNextDisabled = !isWalkIn && (orderType !== 'DINE_IN') && (!customerName.trim() || !customerPhone.trim());

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key="customer-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="p-4 sm:p-8 space-y-6 max-w-2xl mx-auto h-full flex flex-col justify-center overflow-y-auto"
            >
                <Card className="space-y-6 p-8 bg-white dark:bg-zinc-800 shadow-2xl rounded-3xl border dark:border-zinc-700 overflow-visible">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center rounded-2xl">
                                    <i className="ri-user-smile-line text-2xl"></i>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Customer Profile</h2>
                            </div>

                            {/* Walk-in Toggle */}
                            <button
                                onClick={() => dispatch(toggleWalkIn())}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all group ${
                                    isWalkIn 
                                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                                    : 'border-zinc-100 dark:border-zinc-700 text-gray-500 hover:border-indigo-200'
                                }`}
                            >
                                <i className={`ri-walk-line text-lg ${isWalkIn ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'}`}></i>
                                <span className="text-sm font-bold">Walk-In Guest</span>
                                {isWalkIn && <i className="ri-checkbox-circle-fill ml-1"></i>}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                icon="ri-user-line"
                                placeholder="Enter customer name"
                                disabled={isWalkIn}
                                value={customerName}
                                onChange={(e) => dispatch(updateCustomerDetails({ name: e.target.value }))}
                                className={isWalkIn ? 'opacity-60' : ''}
                            />
                            
                            <PhoneInput
                                label="Phone Number"
                                placeholder="Phone number"
                                disabled={isWalkIn}
                                value={customerPhone}
                                onChange={(value) => dispatch(updateCustomerDetails({ phone: value }))}
                                className={isWalkIn ? 'opacity-60' : ''}
                            />

                            {isWalkIn && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-100 dark:border-zinc-800 flex items-start gap-3 mt-2"
                                >
                                    <i className="ri-information-line text-indigo-500 mt-0.5"></i>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                        Guest details are optional for walk-in orders. We'll mark this order as a general guest checkout.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                        <Button
                            onClick={onBack}
                            variant="ghost"
                            className="w-full sm:w-auto"
                        >
                            <i className="ri-arrow-left-line me-2"></i>
                            Back to Menu
                        </Button>
                        <Button
                            onClick={onNext}
                            variant="primary"
                            disabled={isNextDisabled}
                            className="w-full sm:flex-1 py-4 shadow-xl shadow-indigo-100 dark:shadow-none"
                        >
                            Review Order
                            <i className="ri-arrow-right-line ms-2"></i>
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
};

export default CustomerInfo;
