import React from "react";
import { AnimatePresence, motion } from 'motion/react';
import { Input } from "../../../components/common/Input";
import Card from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateCustomerDetails } from "../slices/cartSlice";

interface CustomerInfoProps {
    onNext: () => void;
    onBack: () => void;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ onNext, onBack }) => {
    const dispatch = useAppDispatch();
    const { customerName, customerPhone } = useAppSelector((state) => state.cart);

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key="customer-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="p-4 sm:p-8 space-y-6 max-w-2xl mx-auto h-full flex flex-col justify-center"
            >
                <Card className="space-y-6 p-8 bg-white dark:bg-zinc-800 shadow-2xl rounded-3xl border dark:border-zinc-700">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center rounded-2xl">
                                <i className="ri-user-smile-line text-2xl"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Customer Profile</h2>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                icon="ri-user-line"
                                placeholder="Enter customer name"
                                value={customerName}
                                onChange={(e) => dispatch(updateCustomerDetails({ name: e.target.value }))}
                            />
                            <Input
                                label="Phone Number"
                                icon="ri-phone-line"
                                placeholder="+91 00000 00000"
                                value={customerPhone}
                                onChange={(e) => dispatch(updateCustomerDetails({ phone: e.target.value }))}
                            />
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
