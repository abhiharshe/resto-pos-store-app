import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '../api/ordersApi';
import IconButton from '../../../components/common/IconButton';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useStores } from '../../stores/api/storesApi';
import moment from 'moment';

const OrderShow = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: stores } = useStores();
    const primaryStore = stores?.[0];
    const currency = primaryStore?.currency || '$';

    const { data: order, isLoading } = useOrder(Number(id));

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 font-medium">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Order Not Found</h2>
                <p className="text-zinc-500">The order you are looking for does not exist or has been deleted.</p>
                <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 mx-auto">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <IconButton
                        icon="ri-arrow-left-line"
                        variant="outline"
                        onClick={() => navigate('/orders')}
                        title="Back to Orders"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                            <span>Order #{order.id}</span>
                            <span className="px-2 py-1 border border-green-700 text-green-700 bg-gray-200 text-sm rounded-full">{order.order_type}</span>
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Placed {moment(order.created_at).format('MMMM Do YYYY, h:mm a')} ({moment(order.created_at).fromNow()})
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => window.print()}>
                        <i className="ri-printer-line mr-2"></i> Print Receipt
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                            <h3 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs">Order Items</h3>
                        </div>
                        <div className="p-6 divide-y divide-zinc-100 dark:divide-zinc-800">
                            {order.items.map((item) => (
                                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-bold text-zinc-900 dark:text-white">
                                                {item.quantity}
                                            </span>
                                            <span>x</span>
                                            <span className="font-semibold text-zinc-900 dark:text-white">
                                                {item.name}
                                            </span>
                                        </div>
                                        {item.addons && item.addons.length > 0 && (
                                            <div className="pl-11 space-y-1">
                                                {item.addons.map((addon) => (
                                                    <div key={addon.id} className="text-xs text-zinc-500 flex justify-between gap-2 max-w-[200px]">
                                                        <span>+ {addon.name}</span>
                                                        <span><span className='text-xs me-1'>{currency}</span>{addon.price.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-zinc-900 dark:text-white"><span className='text-xs me-1'>{currency}</span>{item.subtotal.toFixed(2)}</p>
                                        <p className="text-[10px] text-zinc-400 font-medium">@<span className='text-xs me-1'>{currency}</span>{item.unit_price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary / Internal Info */}
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-400 mb-4">
                            <i className="ri-information-line"></i>
                            <span className="text-xs font-bold uppercase tracking-widest">Order Notes / Internal Info</span>
                        </div>
                        <p className="text-sm text-zinc-500 italic">No additional notes provided for this order.</p>
                    </div>
                </div>

                {/* Sidebar: Totals & Details */}
                <div className="space-y-6">
                    {/* Status & Customer info */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Order Status</h4>
                            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Current</span>
                                <StatusBadge status={order.status} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Customer Details</h4>
                            <div className="space-y-2">
                                <p className="font-bold text-zinc-900 dark:text-white">
                                    {order.guest_name || order.customer?.full_name || 'Guest Customer'}
                                </p>
                                {order.guest_phone && (
                                    <p className="text-sm text-zinc-500 flex items-center gap-2">
                                        <i className="ri-phone-line"></i> {order.guest_phone}
                                    </p>
                                )}
                                {order.guest_address && (
                                    <p className="text-sm text-zinc-500 flex items-start gap-2 italic">
                                        <i className="ri-map-pin-line mt-1"></i> {order.guest_address}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Payment & Type</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Method</p>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{order.payment_method}</p>
                                </div>
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Status</p>
                                    <p className={`text-sm font-bold ${order.payment_status === 'PAID' ? 'text-green-600' : 'text-amber-500'}`}>
                                        {order.payment_status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-zinc-900 dark:bg-black rounded-2xl p-6 shadow-xl text-white space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Financial Summary</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Subtotal</span>
                                <span className="font-medium"><span className='text-xs me-1'>{currency}</span>{(order.total_amount - order.tax_amount - order.service_charge + order.discount_amount).toFixed(2)}</span>
                            </div>
                            {order.tax_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Taxes</span>
                                    <span className="font-medium">+<span className='text-xs me-1'>{currency}</span>{order.tax_amount.toFixed(2)}</span>
                                </div>
                            )}
                            {order.service_charge > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Service Charge</span>
                                    <span className="font-medium">+<span className='text-xs me-1'>{currency}</span>{order.service_charge.toFixed(2)}</span>
                                </div>
                            )}
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Discount</span>
                                    <span className="text-red-400 font-medium">-<span className='text-xs me-1'>{currency}</span>{order.discount_amount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="pt-4 border-t border-zinc-800 flex justify-between items-end">
                                <span className="text-sm font-bold text-zinc-400 uppercase">Total Amount</span>
                                <span className="text-3xl font-black text-red-500 leading-none"><span className='text-xs me-1'>{currency}</span>{order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pt-8">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic opacity-50">
                    Order ID: AUTH-{order.id}-{moment(order.created_at).valueOf()} • Powered by restopos POS
                </p>
            </div>
        </div>
    );
};

export default OrderShow;
