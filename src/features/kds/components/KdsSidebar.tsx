import React from 'react';
import { Order } from '../../orders/api/ordersApi';
import { StatusBadge } from '../../../components/common/StatusBadge';
import IconButton from '../../../components/common/IconButton';
import { Button } from '../../../components/common/Button';
import moment from 'moment';
import { motion, AnimatePresence } from 'motion/react';

interface KdsSidebarProps {
    order: Order;
    onClose: () => void;
}

export const KdsSidebar: React.FC<KdsSidebarProps> = ({ order, onClose }) => {
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-400/30 dark:bg-slate-900/30 backdrop-blur-sm"
                />

                <div className="absolute inset-y-0 right-0 max-w-full flex">
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-screen max-w-md bg-white dark:bg-zinc-900 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    Order {order.order_number || `#${order.id}`}
                                </h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Placed {moment(order.created_at).format('MMM Do, h:mm A')}
                                </p>
                            </div>
                            <IconButton icon="ri-close-line" onClick={onClose} variant="ghost" size="lg" />
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-8">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Type</p>
                                    <StatusBadge status={order.order_type} />
                                </div>
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>

                            {/* Customer Info */}
                            {(order.customer || order.guest_name) && (
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <i className="ri-user-heart-line text-indigo-500"></i>
                                        Customer Details
                                    </h3>
                                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                        <p className="font-bold text-zinc-900 dark:text-white">
                                            {order.customer?.full_name || order.guest_name}
                                        </p>
                                        {order.guest_phone && (
                                            <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                                                <i className="ri-phone-line"></i> {order.guest_phone}
                                            </p>
                                        )}
                                        {order.guest_address && (
                                            <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                                                <i className="ri-map-pin-line"></i> {order.guest_address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <i className="ri-list-check text-emerald-500"></i>
                                    Items Breakdown
                                </h3>
                                <div className="space-y-6">
                                    {/* Deals Grouping */}
                                    {order.deals && order.deals.length > 0 && order.deals.map((deal) => (
                                        <div key={deal.id} className="bg-emerald-50/20 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/20">
                                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-emerald-100/50 dark:border-emerald-900/20">
                                                <div className="w-6 h-6 bg-emerald-500 text-white rounded flex items-center justify-center">
                                                    <i className="ri-magic-line text-xs"></i>
                                                </div>
                                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">{deal.deal_name}</span>
                                            </div>
                                            <div className="space-y-4">
                                                {deal.items.map((item) => (
                                                    <div key={item.id} className="last:border-0 pb-0">
                                                        <div className="flex justify-between items-start">
                                                            <span className="font-bold text-sm text-zinc-900 dark:text-white">
                                                                {item.quantity}x {item.name}
                                                            </span>
                                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter
                                                                ${item.status === 'READY' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}
                                                            `}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            {item.variant_name && item.variant_name !== 'Default' && (
                                                                <span className="text-[10px] text-zinc-400 font-bold uppercase">{item.variant_name}</span>
                                                            )}
                                                            {item.addons && item.addons.length > 0 && (
                                                                <div className="pl-3 border-l-2 border-emerald-100 dark:border-emerald-900/20">
                                                                    {item.addons.map(addon => (
                                                                        <p key={addon.id} className="text-[10px] text-emerald-600/70 italic">
                                                                            + {addon.name}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Standalone Items */}
                                    {order.items.filter(item => !item.order_deal_id).map((item) => (
                                        <div key={item.id} className="border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-zinc-900 dark:text-white">
                                                    {item.quantity}x {item.name}
                                                </span>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter
                                                    ${item.status === 'READY' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}
                                                `}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase">{item.variant_name !== 'Default' ? item.variant_name : ''}</span>
                                                <span className="text-xs font-mono text-zinc-400">
                                                    ₹{item.subtotal.toFixed(2)}
                                                </span>
                                            </div>
                                            {item.addons && item.addons.length > 0 && (
                                                <div className="mt-2 pl-4 border-l-2 border-indigo-50 dark:border-indigo-900/20">
                                                    {item.addons.map(addon => (
                                                        <p key={addon.id} className="text-[10px] text-indigo-400 italic">
                                                            + {addon.name}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-zinc-500 font-medium">Order Total</span>
                                <span className="text-2xl font-black text-zinc-900 dark:text-white">
                                    ₹{order.total_amount.toFixed(2)}
                                </span>
                            </div>
                            <Button variant="primary" className="w-full" size="lg" onClick={onClose}>
                                Close Details
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};
