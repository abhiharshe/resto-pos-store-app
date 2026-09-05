import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOrder } from '../api/ordersApi';
import IconButton from '../../../components/common/IconButton';
import { StatusBadge } from '../../../components/common/StatusBadge';
import moment from 'moment';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number | null;
    currency?: string;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, orderId, currency = 'Rs.' }) => {
    const { data: order, isLoading } = useOrder(orderId as number);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                                Order Details
                                {order && <span className="text-zinc-400 font-medium text-sm">#{order.id}</span>}
                            </h2>
                            <p className="text-sm text-zinc-500 mt-1">
                                {order ? moment(order.created_at).format('MMMM Do YYYY, h:mm a') : 'Loading...'}
                            </p>
                        </div>
                        <IconButton icon="ri-close-line" variant="ghost" onClick={onClose} />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-medium text-zinc-500">Fetching order details...</p>
                            </div>
                        ) : order ? (
                            <>
                                {/* Customer & Order Info */}
                                <div className="grid grid-cols-2 gap-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Customer Info</h4>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-zinc-900 dark:text-white">
                                                {order.guest_name || order.customer?.full_name || 'Guest Customer'}
                                            </p>
                                            {order.guest_phone && <p className="text-sm text-zinc-500">{order.guest_phone}</p>}
                                            {order.guest_address && <p className="text-sm text-zinc-500 italic">{order.guest_address}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Order Info</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-zinc-500">Status</span>
                                                <StatusBadge status={order.status} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-zinc-500">Type</span>
                                                <span className="text-sm font-bold text-zinc-900 dark:text-white uppercase">{order.order_type}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-zinc-500">Payment</span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white uppercase">{order.payment_method}</span>
                                                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${order.payment_status === 'PAID'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }`}>
                                                        {order.payment_status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Order Items</h4>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-start group">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                                            {item.quantity}x
                                                        </span>
                                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    {item.addons && item.addons.length > 0 && (
                                                        <div className="pl-7 space-y-0.5">
                                                            {item.addons.map((addon) => (
                                                                <p key={addon.id} className="text-xs text-zinc-500">
                                                                    + {addon.name} ({currency}{addon.price.toFixed(2)})
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                    {currency}{item.subtotal.toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Subtotal</span>
                                        <span className="text-zinc-900 dark:text-white font-medium">{currency}{(order.total_amount - order.tax_amount - order.service_charge + order.discount_amount).toFixed(2)}</span>
                                    </div>
                                    {order.tax_amount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Tax</span>
                                            <span className="text-zinc-900 dark:text-white font-medium">{currency}{order.tax_amount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {order.service_charge > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Service Charge</span>
                                            <span className="text-zinc-900 dark:text-white font-medium">{currency}{order.service_charge.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {order.discount_amount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Discount</span>
                                            <span className="text-red-500 font-medium">-{currency}{order.discount_amount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">Total</span>
                                        <span className="text-lg font-black text-red-600 dark:text-red-500">{currency}{order.total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-zinc-500">Order not found.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] text-center font-bold text-zinc-400 uppercase tracking-widest italic">
                            Powered by restopos POS
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OrderDetailsModal;
