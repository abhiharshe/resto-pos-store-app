import { useState, useMemo } from 'react';
import Card from '../../../components/common/Card';
import { Dropdown } from '../../../components/common/Dropdown';
import { useStores } from '../../stores/api/storesApi';
import { useAppSelector } from '../../../app/hooks';
import { DateRangePicker } from '../../../components/common/DateRangePicker';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useSuperAdminDashboard } from '../api/dashboardApi';
import { SystemConfigurationPanel } from './SystemConfigurationPanel';
import { formatCurrencySymbol } from '../../../utils/currency';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { globalSettings } = useAppSelector((state) => state.settings);
    const currency = formatCurrencySymbol(globalSettings?.currency);
    const { data: stores } = useStores();

    const [dateValue, setDateValue] = useState<{
        startDate: string | null;
        endDate: string | null;
    }>({
        startDate: null,
        endDate: null
    });
    const [selectedStore, setSelectedStore] = useState<string | number>('all');
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const filterParams = useMemo(() => {
        return {
            startDate: dateValue.startDate ? new Date(dateValue.startDate).toISOString() : null,
            endDate: dateValue.endDate ? new Date(new Date(dateValue.endDate).setHours(23, 59, 59, 999)).toISOString() : null,
            storeId: selectedStore !== 'all' ? String(selectedStore) : null,
        };
    }, [dateValue, selectedStore]);

    const { data: dashboard, isLoading, isFetching, refetch } = useSuperAdminDashboard(filterParams);

    const storeOptions = [
        { label: 'All Stores', value: 'all' },
        ...(stores?.map(s => ({ label: s.name, value: s.id })) || [])
    ];

    const handleRefresh = () => {
        refetch();
    };

    const handleOpenNewOrder = () => {
        navigate('/pos');
    };

    const handleShowFilters = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const summary = dashboard?.summary;
    const maxTrendRevenue = useMemo(() => {
        if (!dashboard?.revenue_trend || dashboard.revenue_trend.length === 0) return 1;
        return Math.max(...dashboard.revenue_trend.map(t => t.revenue), 1);
    }, [dashboard?.revenue_trend]);

    return (
        <div className="space-y-4 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">Dashboard</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Real-time analytics across {summary?.active_stores ?? stores?.length ?? 0} active locations
                        {isFetching && <span className="ml-2 inline-block text-xs text-indigo-500 animate-pulse font-semibold">Updating...</span>}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant={isFilterVisible ? 'secondary' : 'outline'}
                        icon="ri-filter-3-line"
                        onClick={handleShowFilters}
                    >
                        <span>{isFilterVisible ? 'Hide Filters' : 'Filters'}</span>
                    </Button>
                    <Button
                        variant="outline"
                        icon="ri-refresh-line"
                        onClick={handleRefresh}
                        title="Refresh the Dashboard"
                        disabled={isFetching}
                    >
                        <span>Refresh</span>
                    </Button>
                    <Button
                        variant="primary"
                        icon="ri-add-line"
                        onClick={handleOpenNewOrder}
                        title="Open POS Terminal"
                    >
                        <span>New Order</span>
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            {isFilterVisible && (
                <div className="p-4 flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl border border-mauve-200 dark:border-zinc-700 animate-in slide-in-from-top-2 duration-200">
                    <div className="w-80">
                        <Dropdown
                            label="Store Location"
                            options={storeOptions}
                            value={selectedStore}
                            onChange={(val) => setSelectedStore(val)}
                        />
                    </div>
                    <div className="w-80">
                        <DateRangePicker
                            label="Date Range"
                            value={dateValue}
                            onChange={(newValue) => setDateValue(newValue)}
                            showShortcuts={true}
                        />
                    </div>
                    {(selectedStore !== 'all' || dateValue.startDate) && (
                        <div className="w-72">
                            <Button
                                styleType="outline"
                                variant="danger"
                                size="md"
                                onClick={() => {
                                    setSelectedStore('all');
                                    setDateValue({ startDate: null, endDate: null });
                                }}
                                className='md:mt-6'
                            >
                                Clear Filters
                            </Button>
                        </div>

                    )}
                </div>
            )}

            {/* System Configuration & Readiness Panel */}
            <SystemConfigurationPanel
                status={dashboard?.configuration_status}
                isLoading={isLoading}
            />

            {/* Key Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Revenue"
                    value={isLoading ? "..." : `${currency}${summary?.total_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}`}
                    trendPct={summary?.revenue_growth_pct}
                    icon="ri-money-dollar-circle-fill"
                    color="indigo"
                />
                <StatCard
                    label="Total Orders"
                    value={isLoading ? "..." : (summary?.total_orders?.toLocaleString('en-IN') ?? '0')}
                    trendPct={summary?.orders_growth_pct}
                    icon="ri-shopping-basket-fill"
                    color="blue"
                />
                <StatCard
                    label="Average Ticket"
                    value={isLoading ? "..." : `${currency}${summary?.average_ticket?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}`}
                    trendPct={summary?.average_ticket_growth_pct}
                    icon="ri-coupon-3-fill"
                    color="amber"
                />
                <StatCard
                    label="Unique Customers"
                    value={isLoading ? "..." : (summary?.total_customers?.toLocaleString('en-IN') ?? '0')}
                    trendPct={summary?.customers_growth_pct}
                    icon="ri-user-star-fill"
                    color="emerald"
                />
            </div>

            {/* Financial Breakdown Badges */}
            {summary?.revenue_breakdown && (
                <div className="bg-white dark:bg-neutral-800 border border-mauve-200 dark:border-zinc-700/60 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Revenue Stream Breakdown
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">Current Period</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <BreakdownItem label="Items Subtotal" amount={summary.revenue_breakdown.subtotal} currency={currency} />
                        <BreakdownItem label="Taxes" amount={summary.revenue_breakdown.tax_amount} currency={currency} />
                        <BreakdownItem label="Service Charges" amount={summary.revenue_breakdown.service_charge} currency={currency} />
                        <BreakdownItem label="Delivery Charges" amount={summary.revenue_breakdown.delivery_charge} currency={currency} />
                        <BreakdownItem label="Packaging Charges" amount={summary.revenue_breakdown.packaging_charge} currency={currency} />
                        <BreakdownItem label="Discounts Given" amount={summary.revenue_breakdown.discount_amount} currency={currency} isDiscount />
                    </div>
                </div>
            )}

            {/* Charts & Store Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Trend Chart */}
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
                                Daily Revenue Trend
                            </h4>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Aggregated sales volume over time</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center text-zinc-400 text-sm">
                            Loading revenue trend...
                        </div>
                    ) : !dashboard?.revenue_trend || dashboard.revenue_trend.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-zinc-400 text-sm">
                            <i className="ri-bar-chart-2-line text-4xl mb-2 opacity-50" />
                            <span>No sales data found for the selected period</span>
                        </div>
                    ) : (
                        <div className="h-64 flex items-end justify-between gap-2 px-2 pt-6 border-b border-zinc-100 dark:border-mauve-800 pb-2">
                            {dashboard.revenue_trend.map((pt, i) => {
                                const heightPct = Math.max(Math.round((pt.revenue / maxTrendRevenue) * 100), 6);
                                const dateLabel = new Date(pt.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative h-full justify-end">
                                        <div
                                            className="w-full bg-indigo-500/20 group-hover:bg-indigo-600 rounded-t-lg transition-all duration-200 relative min-h-[12px]"
                                            style={{ height: `${heightPct}%` }}
                                        >
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[11px] py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-20 pointer-events-none">
                                                <div className="font-semibold">{currency}{pt.revenue.toLocaleString('en-IN')}</div>
                                                <div className="text-[9px] opacity-75">{pt.order_count} orders</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-semibold text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
                                            {dateLabel}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                {/* Top Performing Stores */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
                            Store Leaderboard
                        </h4>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">By Revenue</span>
                    </div>

                    {isLoading ? (
                        <div className="py-12 text-center text-zinc-400 text-sm">Loading stores...</div>
                    ) : !dashboard?.top_stores || dashboard.top_stores.length === 0 ? (
                        <div className="py-12 text-center text-zinc-400 text-sm">No store sales recorded yet</div>
                    ) : (
                        <div className="space-y-3">
                            {dashboard.top_stores.map((st, i) => (
                                <div
                                    key={st.store_id}
                                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-zinc-100 dark:border-zinc-700/60 transition-all hover:border-zinc-300 dark:hover:border-zinc-600"
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold ${i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                                                i === 1 ? 'bg-neutral-200 text-zinc-700 dark:bg-neutral-700 dark:text-zinc-300' :
                                                    'bg-neutral-100 text-zinc-600 dark:bg-neutral-800 dark:text-zinc-400'
                                                }`}>
                                                #{i + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-snug">
                                                    {st.store_name}
                                                </p>
                                                <p className="text-[11px] text-zinc-400">{st.order_count} orders</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-neutral-900 dark:text-white">
                                                {currency}{st.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                            </span>
                                            <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                                {st.contribution_pct}% share
                                            </p>
                                        </div>
                                    </div>
                                    {/* Share bar */}
                                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-indigo-600 h-1.5 rounded-full"
                                            style={{ width: `${Math.min(st.contribution_pct, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Sales Distribution & Top Selling Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sales by Order Type */}
                <Card>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
                        Order Types
                    </h4>
                    {isLoading ? (
                        <div className="py-8 text-center text-zinc-400 text-sm">Loading...</div>
                    ) : !dashboard?.sales_by_order_type || dashboard.sales_by_order_type.length === 0 ? (
                        <div className="py-8 text-center text-zinc-400 text-sm">No orders yet</div>
                    ) : (
                        <div className="space-y-3">
                            {dashboard.sales_by_order_type.map((ot) => (
                                <div key={ot.order_type} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <i className={`ri-${ot.order_type === 'DINE_IN' ? 'restaurant-2-line' : ot.order_type === 'DELIVERY' ? 'e-bike-2-line' : 'takeaway-line'} text-zinc-400`} />
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">{ot.order_type.replace('_', ' ')}</span>
                                        <span className="text-xs text-zinc-400 font-medium">({ot.count})</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-neutral-900 dark:text-white">{currency}{ot.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                        <span className="ml-2 text-xs font-semibold text-zinc-400">{ot.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Sales by Payment Method */}
                <Card>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
                        Payment Methods
                    </h4>
                    {isLoading ? (
                        <div className="py-8 text-center text-zinc-400 text-sm">Loading...</div>
                    ) : !dashboard?.sales_by_payment_method || dashboard.sales_by_payment_method.length === 0 ? (
                        <div className="py-8 text-center text-zinc-400 text-sm">No payments yet</div>
                    ) : (
                        <div className="space-y-3">
                            {dashboard.sales_by_payment_method.map((pm) => (
                                <div key={pm.payment_method} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <i className={`ri-${pm.payment_method === 'CASH' ? 'money-dollar-box-line' : pm.payment_method === 'CARD' ? 'bank-card-line' : 'qr-code-line'} text-zinc-400`} />
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">{pm.payment_method}</span>
                                        <span className="text-xs text-zinc-400 font-medium">({pm.count})</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-neutral-900 dark:text-white">{currency}{pm.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                        <span className="ml-2 text-xs font-semibold text-zinc-400">{pm.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Top Selling Items */}
                <Card>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
                        Top Selling Menu Items
                    </h4>
                    {isLoading ? (
                        <div className="py-8 text-center text-zinc-400 text-sm">Loading...</div>
                    ) : !dashboard?.top_selling_items || dashboard.top_selling_items.length === 0 ? (
                        <div className="py-8 text-center text-zinc-400 text-sm">No menu items sold yet</div>
                    ) : (
                        <div className="space-y-3">
                            {dashboard.top_selling_items.slice(0, 5).map((item) => (
                                <div key={item.menu_item_id} className="flex items-center justify-between text-sm">
                                    <div className="truncate max-w-[170px]">
                                        <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{item.menu_item_name}</p>
                                        <p className="text-[11px] text-zinc-400">{item.category_name || 'Item'} · {item.quantity_sold} sold</p>
                                    </div>
                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                        {currency}{item.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Recent Orders Section */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
                            Recent Order Activities
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Latest transactions across stores</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
                        View All Orders
                    </Button>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-zinc-400 text-sm">Loading recent orders...</div>
                ) : !dashboard?.recent_orders || dashboard.recent_orders.length === 0 ? (
                    <div className="py-12 text-center text-zinc-400 text-sm">No recent orders found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-mauve-800 text-zinc-400 text-xs uppercase font-semibold">
                                    <th className="py-3 px-3">Order #</th>
                                    <th className="py-3 px-3">Store</th>
                                    <th className="py-3 px-3">Guest / Customer</th>
                                    <th className="py-3 px-3">Type</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-3">Total</th>
                                    <th className="py-3 px-3 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                                {dashboard.recent_orders.map((ord) => (
                                    <tr key={ord.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                                        <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">
                                            {ord.order_number}
                                        </td>
                                        <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300">
                                            {ord.store_name}
                                        </td>
                                        <td className="py-3 px-3 text-neutral-500 dark:text-neutral-400">
                                            {ord.guest_name || 'Walk-in Guest'}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-zinc-700 dark:text-zinc-300">
                                                {ord.order_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <StatusBadge status={ord.status} />
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">
                                            {currency}{ord.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3 px-3 text-right text-xs text-zinc-400">
                                            {new Date(ord.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

interface StatCardProps {
    label: string;
    value: string;
    trendPct?: number;
    icon: string;
    color: 'indigo' | 'blue' | 'amber' | 'emerald';
}

const colorMap = {
    indigo: {
        bg: 'bg-indigo-500/10',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
        iconText: 'text-indigo-600 dark:text-indigo-400',
    },
    blue: {
        bg: 'bg-blue-500/10',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconText: 'text-blue-600 dark:text-blue-400',
    },
    amber: {
        bg: 'bg-amber-500/10',
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        iconText: 'text-amber-600 dark:text-amber-400',
    },
    emerald: {
        bg: 'bg-emerald-500/10',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconText: 'text-emerald-600 dark:text-emerald-400',
    },
};

const StatCard = ({ label, value, trendPct, icon, color }: StatCardProps) => {
    const c = colorMap[color];
    const isPositive = (trendPct ?? 0) >= 0;
    const trendDisplay = trendPct !== undefined && trendPct !== null ? `${isPositive ? '+' : ''}${trendPct}%` : null;

    return (
        <Card className="flex flex-col relative overflow-hidden group shadow-sm hover:-translate-y-1 transition-transform duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 ${c.bg} rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500`} />
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center ${c.iconText}`}>
                    <i className={`${icon} text-xl`} />
                </div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</h4>
            </div>
            <div className="flex items-baseline justify-between mt-auto">
                <p className="text-xl font-semibold text-zinc-800 dark:text-white leading-none">{value}</p>
                {trendDisplay && (
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                        {trendDisplay}
                    </span>
                )}
            </div>
        </Card>
    );
};

const BreakdownItem = ({ label, amount, currency, isDiscount }: { label: string; amount: number; currency: string; isDiscount?: boolean }) => (
    <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-zinc-100 dark:border-zinc-700/50">
        <span className="text-[11px] text-zinc-400 font-medium block truncate">{label}</span>
        <span className={`text-sm font-semibold block mt-0.5 ${isDiscount && amount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
            {isDiscount && amount > 0 ? `-${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
        </span>
    </div>
);

export default AdminDashboard;
