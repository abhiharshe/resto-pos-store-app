import { useParams, useNavigate } from 'react-router-dom';
import { useOrder, OrderDeal, OrderItem } from '../api/ordersApi';
import IconButton from '../../../components/common/IconButton';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useGetSettingsQuery } from '../../settings/api/settingsApi';
import moment from 'moment';
import React from 'react';
import { getMediaURL } from '../../../utils/api';
import { formatCurrencySymbol } from '../../../utils/currency';

const OrderShow = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showPrintPreview, setShowPrintPreview] = React.useState(false);

    const { data: globalSettings } = useGetSettingsQuery();

    const currency = formatCurrencySymbol(globalSettings?.currency);

    const { data: order, isLoading } = useOrder(id || '');
    const standaloneItems = order?.items.filter(item => !item.order_deal_id) || [];

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
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Order Not Found</h2>
                <p className="text-zinc-500">The order you are looking for does not exist or has been deleted.</p>
                <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 mx-auto">
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
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white flex items-center gap-3">
                            <span>Order #{order.id}</span>
                            <span className="px-2 py-1 border border-green-700 text-green-700 bg-gray-200 text-sm rounded-full">{order.order_type}</span>
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Placed {moment(order.created_at).format('MMMM Do YYYY, h:mm a')} ({moment(order.created_at).fromNow()})
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setShowPrintPreview(true)}>
                        <i className="ri-printer-line mr-2"></i> Print Receipt
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                            <h3 className="font-semibold text-zinc-900 dark:text-white uppercase tracking-wider text-xs">Order Items</h3>
                        </div>
                        <div className="p-4 divide-y divide-zinc-100 dark:divide-zinc-800">
                            {/* Deals Sections */}
                            {order.deals && order.deals.length > 0 && order.deals.map((deal) => (
                                <div key={deal.id} className="py-6 first:pt-0 border-b border-zinc-100 dark:border-zinc-800 last:border-0 border-dashed">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-xl">
                                                <i className="ri-magic-line text-xl"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">{deal.deal_name}</h4>
                                                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest">Bundle Offer</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-zinc-900 dark:text-white leading-none">
                                                <span className='text-xs me-1'>{currency}</span>{deal.total_price.toFixed(2)}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-tight line-through mt-1">
                                                Regular {currency}{deal.items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pl-12 space-y-4">
                                        {deal.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-start bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-zinc-400">×{item.quantity}</span>
                                                        <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{item.name}</span>
                                                        {item.variant_name && item.variant_name !== 'Default' && (
                                                            <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-600 dark:text-zinc-400 font-semibold">{item.variant_name}</span>
                                                        )}
                                                    </div>
                                                    {item.addons && item.addons.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.addons.map(a => (
                                                                <span key={a.id} className="text-[9px] text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-2 py-0.5 rounded-md">
                                                                    + {a.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <StatusBadge status={item.status} className="scale-75 origin-right" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Standalone Items Sections */}
                            {standaloneItems.map((item) => (
                                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-semibold text-zinc-900 dark:text-white">
                                                {item.quantity}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-zinc-900 dark:text-white">
                                                    {item.name}
                                                </span>
                                                {item.variant_name && item.variant_name !== 'Default' && (
                                                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest">{item.variant_name}</span>
                                                )}
                                            </div>
                                        </div>
                                        {item.addons && item.addons.length > 0 && (
                                            <div className="pl-11 space-y-1">
                                                {item.addons.map((addon) => (
                                                    <div key={addon.id} className="text-xs text-zinc-500 flex justify-between gap-2 max-w-[240px]">
                                                        <span className="flex items-center gap-1">
                                                            <i className="ri-add-circle-line text-[10px] text-indigo-400"></i>
                                                            {addon.name}
                                                        </span>
                                                        <span><span className='text-xs me-0.5'>{currency}</span>{addon.price.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-zinc-900 dark:text-white leading-none">
                                            <span className='text-xs me-1'>{currency}</span>{item.subtotal.toFixed(2)}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-tight mt-1">@<span className='text-xs me-0.5'>{currency}</span>{item.unit_price.toFixed(2)}</p>
                                        <div className="mt-2 text-right">
                                            <StatusBadge status={item.status} className="scale-75 origin-right" />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!order.deals || order.deals.length === 0) && standaloneItems.length === 0 && (
                                <div className="py-20 text-center">
                                    <i className="ri-shopping-basket-line text-4xl text-zinc-200 mb-2"></i>
                                    <p className="text-zinc-400 text-xs font-semibold uppercase">No items found in this order</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary / Internal Info */}
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-400 mb-4">
                            <i className="ri-information-line"></i>
                            <span className="text-xs font-semibold uppercase tracking-widest">Order Notes / Internal Info</span>
                        </div>
                        <p className="text-sm text-zinc-500 italic">No additional notes provided for this order.</p>
                    </div>
                </div>

                {/* Sidebar: Totals & Details */}
                <div className="space-y-4">
                    {/* Status & Customer info */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Order Status</h4>
                            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Current</span>
                                <StatusBadge status={order.status} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Customer Details</h4>
                            <div className="space-y-2">
                                <p className="font-semibold text-zinc-900 dark:text-white">
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
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Payment & Type</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                    <p className="text-[10px] font-semibold text-zinc-400 uppercase">Method</p>
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{order.payment_method}</p>
                                </div>
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                    <p className="text-[10px] font-semibold text-zinc-400 uppercase">Status</p>
                                    <p className={`text-sm font-semibold ${order.payment_status === 'PAID' ? 'text-green-600' : 'text-amber-500'}`}>
                                        {order.payment_status}
                                    </p>
                                </div>
                            </div>
                            {order.payment_method === 'CASH' && (order.cash_received != null || order.change_amount != null || order.change != null) && (
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                        <p className="text-[10px] font-semibold text-zinc-400 uppercase">Cash Received</p>
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{currency}{(order.cash_received ?? 0).toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                        <p className="text-[10px] font-semibold text-zinc-400 uppercase">Change</p>
                                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{currency}{(order.change_amount ?? order.change ?? 0).toFixed(2)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-zinc-800 dark:bg-black rounded-2xl p-6 shadow-xl text-white space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Financial Summary</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Subtotal</span>
                                <span className="font-medium"><span className='text-xs me-1'>{currency}</span>{(order.subtotal ?? order.sub_total ?? (order.total_amount - order.tax_amount - order.service_charge + order.discount_amount)).toFixed(2)}</span>
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
                                    <span className="text-zinc-400">Discount {order.applied_coupon_code ? `(${order.applied_coupon_code})` : ''}</span>
                                    <span className="text-red-400 font-medium">-<span className='text-xs me-1'>{currency}</span>{order.discount_amount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="pt-4 border-t border-zinc-800 flex justify-between items-end">
                                <span className="text-sm font-semibold text-zinc-400 uppercase">Total Amount</span>
                                <span className="text-3xl font-black text-red-500 leading-none"><span className='text-xs me-1'>{currency}</span>{order.total_amount.toFixed(2)}</span>
                            </div>
                            {order.payment_method === 'CASH' && order.cash_received != null && (
                                <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs text-zinc-400">
                                    <div className="flex justify-between">
                                        <span>Cash Received:</span>
                                        <span className="font-semibold text-white"><span className='text-[10px] me-0.5'>{currency}</span>{order.cash_received.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Change Returned:</span>
                                        <span className="font-semibold text-emerald-400"><span className='text-[10px] me-0.5'>{currency}</span>{(order.change_amount ?? order.change ?? 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pt-8 print:hidden">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest italic opacity-50">
                    Order ID: AUTH-{order.id}-{moment(order.created_at).valueOf()} • Powered by restopos POS
                </p>
            </div>

            {/* Print Preview Overlay */}
            {showPrintPreview && (
                <div className="fixed inset-0 z-100 bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
                    <div className="bg-white dark:bg-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[90vh]">
                        <div className="p-4 border-b dark:border-zinc-700 flex justify-between items-center">
                            <h3 className="font-semibold flex items-center gap-2">
                                <i className="ri-printer-line text-indigo-500"></i>
                                Print Preview
                            </h3>
                            <button onClick={() => setShowPrintPreview(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>

                        <div className="p-4 grow overflow-y-auto">
                            <PosReceiptContent order={order} settings={globalSettings} currency={currency} standaloneItems={standaloneItems} />
                        </div>

                        <div className="p-4 border-t border-zinc-400 dark:border-zinc-700 flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setShowPrintPreview(false)}>
                                <i className="ri-arrow-left-line mr-2"></i> Back
                            </Button>
                            <Button variant="primary" className="flex-1" onClick={() => window.print()}>
                                <i className="ri-printer-line mr-2"></i> Confirm Print
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Real POS Receipt - Hidden in UI, visible when printing */}
            <div id="pos-receipt" className="hidden print:block font-mono text-black bg-white">
                <PosReceiptContent order={order} settings={globalSettings} currency={currency} standaloneItems={standaloneItems} />
                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #pos-receipt, #pos-receipt * {
                            visibility: visible;
                        }
                        #pos-receipt {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 80mm !important;
                            padding: 10mm;
                            margin: 0;
                            display: block !important;
                        }
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

// Helper sub-component for Receipt Content
const PosReceiptContent = ({ order, settings, currency, standaloneItems }: { order: any, settings: any, currency: string, standaloneItems: any[] }) => (
    <div className="w-full font-mono text-black bg-white p-4">
        {/* Header */}
        <div className="text-center space-y-2">
            {settings?.receipt_logo_url && (
                <img src={getMediaURL(settings.receipt_logo_url)} alt="Logo" className="w-12 h-12 mx-auto object-contain mb-2" />
            )}
            <h2 className="text-lg font-semibold uppercase tracking-tight">{settings?.receipt_header || 'RESTAURANT'}</h2>
            <div className="text-[10px]">
                <p>{order.store?.name}</p>
                <p>{order.store?.address}</p>
                <p>Tel: {order.store?.phone || 'N/A'}</p>
            </div>
        </div>

        <div className="border-t border-b border-black border-dashed py-2  space-y-1 text-[10px]">
            <div className="flex justify-between">
                <span>Order #:</span>
                <span className="font-semibold">{order.order_number || `#${order.id}`}</span>
            </div>
            <div className="flex justify-between">
                <span>Date:</span>
                <span>{moment(order.created_at).format('DD MMM YY HH:mm')}</span>
            </div>
            <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-semibold">{order.order_type}</span>
            </div>
            <div className="flex justify-between">
                <span>Payment:</span>
                <span>{order.payment_method} ({order.payment_status})</span>
            </div>
        </div>

        {/* Customer Details */}
        {(order.guest_name || order.guest_phone) && (
            <div className=" text-[10px] space-y-0.5 border-b border-black border-dotted pb-2">
                <p className="font-semibold uppercase mb-1 underline">Customer Info</p>
                {order.guest_name && <p>{order.guest_name}</p>}
                {order.guest_phone && <p>{order.guest_phone}</p>}
                {order.guest_address && <p className="italic text-[9px]">{order.guest_address}</p>}
            </div>
        )}

        {/* Items */}
        <div className="">
            <div className="flex justify-between font-semibold border-b border-black border-dashed pb-1 mb-2 text-[10px]">
                <span className="w-8">QTY</span>
                <span className="flex-1 text-left px-2">ITEM</span>
                <span className="w-16 text-right">TOTAL</span>
            </div>
            <div className="space-y-3">
                {/* Deals */}
                {order.deals?.map((deal: OrderDeal) => (
                    <div key={deal.id} className="space-y-1">
                        <div className="flex justify-between font-semibold text-[10px]">
                            <span className="w-8">1</span>
                            <span className="flex-1 px-2 uppercase">{deal.deal_name}</span>
                            <span className="w-16 text-right">{currency}{deal.total_price.toFixed(2)}</span>
                        </div>
                        <div className="pl-6 space-y-0.5 opacity-80 italic text-[9px]">
                            {deal.items.map((item: OrderItem, idx: number) => (
                                <div key={idx} className="flex justify-between">
                                    <span>- {item.quantity}x {item.name} {item.variant_name !== 'Default' ? `(${item.variant_name})` : ''}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {/* Standalone Items */}
                {standaloneItems.map(item => (
                    <div key={item.id} className="space-y-0.5">
                        <div className="flex justify-between text-[11px]">
                            <span className="w-8">{item.quantity}</span>
                            <span className="flex-1 px-2">
                                {item.name}
                                {item.variant_name !== 'Default' && <span className="text-[9px] block">({item.variant_name})</span>}
                            </span>
                            <span className="w-16 text-right">{currency}{item.subtotal.toFixed(2)}</span>
                        </div>
                        {item.addons?.map((a: any) => (
                            <div key={a.id} className="pl-8 text-[9px] flex justify-between opacity-70">
                                <span>+ {a.name}</span>
                                <span>{currency}{a.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>

        {/* Billing Summary */}
        <div className="border-t border-black border-dashed pt-2 space-y-1 text-right">
            <div className="flex justify-between text-[10px]">
                <span>Subtotal</span>
                <span>{currency}{(order.subtotal ?? order.sub_total ?? (order.total_amount - order.tax_amount - order.service_charge + order.discount_amount)).toFixed(2)}</span>
            </div>
            {order.tax_amount > 0 && (
                <div className="flex justify-between text-[10px]">
                    <span>Tax</span>
                    <span>{currency}{order.tax_amount.toFixed(2)}</span>
                </div>
            )}
            {order.service_charge > 0 && (
                <div className="flex justify-between text-[10px]">
                    <span>Service Charge</span>
                    <span>{currency}{order.service_charge.toFixed(2)}</span>
                </div>
            )}
            {order.discount_amount > 0 && (
                <div className="flex justify-between text-[10px]">
                    <span>Discount {order.applied_coupon_code ? `(${order.applied_coupon_code})` : ''}</span>
                    <span>-{currency}{order.discount_amount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between font-semibold text-[14px] border-t border-black border-double pt-2 mt-2">
                <span>TOTAL</span>
                <span>{currency}{order.total_amount.toFixed(2)}</span>
            </div>
            {order.payment_method === 'CASH' && order.cash_received != null && (
                <div className="border-t border-black border-dotted pt-1 mt-1 space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                        <span>Cash Received</span>
                        <span>{currency}{order.cash_received.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span>Change</span>
                        <span>{currency}{(order.change_amount ?? order.change ?? 0).toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
            {settings?.receipt_footer && (
                <p className="text-[10px] whitespace-pre-line">{settings.receipt_footer}</p>
            )}
            <div className="border-t border-black border-dashed pt-4 opacity-50 text-[8px] uppercase tracking-widest italic">
                Scan to Rate & Review (Coming Soon)
            </div>
            <p className="text-[9px] font-semibold">Thank You! Visit Again</p>
        </div>
    </div>
);

export default OrderShow;
