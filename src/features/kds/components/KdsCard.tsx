import React, { useState, useEffect } from 'react';
import { Order } from '../../orders/api/ordersApi';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/common/Button';
import IconButton from '../../../components/common/IconButton';
import moment from 'moment';
import { useUpdateOrderItemStatus, OrderItemStatus } from '../api/kdsApi';
import { useUpdateOrderStatus } from '../../orders/api/ordersApi';
import toast from 'react-hot-toast';

interface KdsCardProps {
    order: Order;
    onViewDetails: (order: Order) => void;
}

export const KdsCard: React.FC<KdsCardProps> = ({ order, onViewDetails }) => {
    const updateItemStatus = useUpdateOrderItemStatus();
    const updateOrderStatus = useUpdateOrderStatus();
    const [elapsedTime, setElapsedTime] = useState<string>('');

    useEffect(() => {
        const calculateElapsed = () => {
            const now = moment();
            const created = moment(order.created_at);
            const diff = moment.duration(now.diff(created));
            const hours = Math.floor(diff.asHours());
            const minutes = diff.minutes();
            const seconds = diff.seconds();
            return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;
        };

        setElapsedTime(calculateElapsed());
        const timer = setInterval(() => {
            setElapsedTime(calculateElapsed());
        }, 1000);

        return () => clearInterval(timer);
    }, [order.created_at]);

    const handleItemStatusChange = async (itemId: number, currentStatus: OrderItemStatus) => {
        let nextStatus: OrderItemStatus;
        if (currentStatus === 'PENDING') nextStatus = 'PREPARING';
        else if (currentStatus === 'PREPARING') nextStatus = 'READY';
        else if (currentStatus === 'READY') nextStatus = 'SERVED';
        else return;

        try {
            await updateItemStatus.mutateAsync({ orderItemId: itemId, status: nextStatus });
        } catch (error) {
            toast.error('Failed to update item status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'PREPARING': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'READY': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'SERVED': return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
            default: return 'bg-zinc-100 text-zinc-600';
        }
    };

    const getOrderAction = () => {
        const allItemsReady = order.items.every(item => item.status === 'READY' || item.status === 'SERVED');
        
        if (!allItemsReady) return null;

        switch (order.order_type) {
            case 'DINE_IN':
                return {
                    label: 'Mark All Served',
                    icon: 'ri-check-double-line',
                    status: 'COMPLETED', // Or something else if preferred
                    variant: 'primary' as const
                };
            case 'PICKUP':
                return {
                    label: 'Complete Pickup',
                    icon: 'ri-hand-heart-line',
                    status: 'COMPLETED',
                    variant: 'success' as const
                };
            case 'DELIVERY':
                return {
                    label: 'Dispatch Order',
                    icon: 'ri-truck-line',
                    status: 'OUT_FOR_DELIVERY',
                    variant: 'primary' as const
                };
            default:
                return {
                    label: 'Complete Order',
                    icon: 'ri-check-line',
                    status: 'COMPLETED',
                    variant: 'primary' as const
                };
        }
    };

    const action = getOrderAction();

    const handleOrderAction = async () => {
        if (!action) return;
        try {
            await updateOrderStatus.mutateAsync({ id: order.id, status: action.status });
            toast.success(`Order ${action.status.replace(/_/g, ' ')}`);
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full ring-1 ring-zinc-950/5">
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                            {order.order_number || `#${order.id}`}
                        </span>
                        <StatusBadge status={order.order_type} />
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <i className="ri-time-line"></i>
                        {elapsedTime}
                    </div>
                </div>
                <IconButton
                    icon="ri-external-link-line"
                    size="sm"
                    variant="info"
                    onClick={() => onViewDetails(order)}
                    title="View Full Order"
                    aria-label="View Full Order"
                />
            </div>

            {/* Items List */}
            <div className="p-4 flex-grow overflow-y-auto space-y-4">
                {/* Deals Sections */}
                {order.deals && order.deals.length > 0 && order.deals.map((deal) => (
                    <div key={deal.id} className="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/20">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-100/50 dark:border-emerald-900/20">
                            <i className="ri-magic-line text-emerald-500"></i>
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">{deal.deal_name}</span>
                        </div>
                        <div className="space-y-3">
                            {deal.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center gap-2">
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                                                {item.quantity}x {item.name}
                                            </span>
                                        </div>
                                        {item.variant_name && item.variant_name !== 'Default' && (
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate font-bold">
                                                {item.variant_name}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleItemStatusChange(item.id, item.status as OrderItemStatus)}
                                        disabled={updateItemStatus.isPending || item.status === 'SERVED'}
                                        className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all flex-shrink-0
                                            ${getStatusColor(item.status)}
                                            ${item.status !== 'SERVED' ? 'hover:scale-105 active:scale-95 cursor-pointer shadow-sm hover:shadow' : 'opacity-70'}
                                        `}
                                    >
                                        {item.status}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Standalone Items */}
                {order.items.filter(item => !item.order_deal_id).map((item) => (
                    <div key={item.id} className="flex justify-between items-center gap-2 group">
                        <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                                    {item.quantity}x {item.name}
                                </span>
                            </div>
                            {item.variant_name && item.variant_name !== 'Default' && (
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-bold truncate">
                                    {item.variant_name}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => handleItemStatusChange(item.id, item.status as OrderItemStatus)}
                                disabled={updateItemStatus.isPending || item.status === 'SERVED'}
                                className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all
                                    ${getStatusColor(item.status)}
                                    ${item.status !== 'SERVED' ? 'hover:scale-105 active:scale-95 cursor-pointer shadow-sm hover:shadow' : 'opacity-70'}
                                `}
                            >
                                {item.status}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Actions */}
            {action && (
                <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                    <Button 
                        variant={action.variant as any}
                        size="sm" 
                        className="w-full text-xs font-bold uppercase tracking-wider h-9 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        onClick={handleOrderAction}
                        isLoading={updateOrderStatus.isPending}
                    >
                        <i className={`${action.icon} mr-2 text-sm`}></i>
                        {action.label}
                    </Button>
                </div>
            )}
        </div>
    );
};
