import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer, useCustomerStats, useCustomerOrders } from '../api/customersApi';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Skeleton } from '../../../components/common/Skeleton';
import Card from '../../../components/common/Card';
import moment from 'moment';
import { ColumnDef } from '@tanstack/react-table';
import { Order } from '../../orders/api/ordersApi';

const CustomerDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const customerId = Number(id);

    const [orderSkip] = useState(0);
    const orderLimit = 10;

    const { data: customer, isLoading: isLoadingCustomer } = useCustomer(customerId);
    const { data: stats, isLoading: isLoadingStats } = useCustomerStats(customerId);
    const { data: orders, isLoading: isLoadingOrders } = useCustomerOrders(customerId, orderSkip, orderLimit);

    if (isLoadingCustomer || isLoadingStats) {
        return (
            <div className="p-4 space-y-6 lg:p-8">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!customer) return <div>Customer not found.</div>;

    const orderColumns: ColumnDef<Order>[] = [
        {
            accessorKey: 'id',
            header: 'Order ID',
            cell: (info) => <span className="font-semibold">#{info.getValue() as string}</span>
        },
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: (info) => moment(info.getValue() as string).format('MMM DD, YYYY hh:mm A')
        },
        {
            accessorKey: 'total_amount',
            header: 'Amount',
            cell: (info) => <span className="font-semibold text-indigo-600">₹{(info.getValue() as number).toFixed(2)}</span>
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => <StatusBadge status={info.getValue() as string} />
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${info.row.original.id}`)}>
                    View
                </Button>
            )
        }
    ];

    return (
        <div className="p-4 space-y-4 lg:p-8 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 p-4 rounded-3xl text-white shadow-xl">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-2xl flex items-center justify-center text-3xl text-zinc-600 dark:text-zinc-300 font-semibold">
                        {customer.full_name?.charAt(0) || 'G'}
                    </div>
                    <div>
                        <h1 className="text-2xl text-zinc-600 dark:text-zinc-200 font-semibold uppercase tracking-tight">{customer.full_name || 'Guest Customer'}</h1>
                        <p className="text-zinc-400 font-medium flex items-center gap-2">
                            <i className="ri-phone-line text-indigo-400"></i> {customer.phone}
                            {customer.email && (
                                <span className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                    <i className="ri-mail-line text-indigo-400"></i> {customer.email}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <Button variant="outline" icon="ri-arrow-left-line" onClick={() => navigate('/customers')}>
                    Back to List
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-0">
                    <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-2">Lifetime Orders</p>
                    <h2 className="text-3xl text-zinc-200 dark:text-zinc-200 font-semibold">{stats?.total_orders}</h2>
                    <p className="text-indigo-200 text-[10px] mt-1 italic">Across all branches</p>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <i className="ri-calendar-todo-line text-5xl"></i>
                    </div>
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Orders This Month</p>
                    <h2 className="text-3xl text-zinc-600 dark:text-zinc-200 font-semibold text-zinc-900 dark:text-white">{stats?.current_month_orders}</h2>
                    <div className="flex items-center gap-1 mt-1">
                        <span className={`text-[10px] font-semibold ${(stats?.current_month_orders || 0) >= (stats?.last_month_orders || 0) ? 'text-emerald-500' : 'text-red-500'}`}>
                            vs {stats?.last_month_orders} last month
                        </span>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <i className="ri-medal-2-line text-5xl text-indigo-500"></i>
                    </div>
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Avg Order Value (C.M.)</p>
                    <h2 className="text-3xl text-zinc-600 dark:text-zinc-200 font-semibold text-indigo-600 dark:text-indigo-400">₹{stats?.current_month_aov?.toFixed(2)}</h2>
                    <p className="text-[10px] text-zinc-400 mt-1">Based on current month sales</p>
                </Card>

                <Card className="relative overflow-hidden group bg-zinc-50 dark:bg-zinc-800/50">
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Last Month AOV</p>
                    <h2 className="text-2xl text-zinc-600 dark:text-zinc-200 font-semibold text-zinc-900 dark:text-white">₹{stats?.last_month_aov?.toFixed(2)}</h2>
                    <div className="flex items-center mt-2">
                        {stats && stats.current_month_aov > stats.last_month_aov ? (
                            <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                                <i className="ri-arrow-up-line"></i> Improving
                            </span>
                        ) : (
                            <span className="text-[10px] font-semibold text-red-400 flex items-center gap-1">
                                <i className="ri-arrow-down-line"></i> Declining
                            </span>
                        )}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Top 10 Products */}
                <Card className="lg:col-span-1 p-0 overflow-hidden h-fit">
                    <div className="p-6 border-b dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                        <h4 className="text-sm text-zinc-600 dark:text-zinc-200 font-semibold uppercase tracking-widest text-zinc-900 dark:text-white flex items-center gap-2">
                            <i className="ri-fire-line text-orange-500"></i> Top 10 Favorite Products
                        </h4>
                    </div>
                    <div className="divide-y dark:divide-zinc-800 max-h-[500px] overflow-y-auto">
                        {stats?.top_products.length ? stats.top_products.map((product, idx) => (
                            <div key={product.menu_item_id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${idx < 3 ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                        {idx + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{product.name}</span>
                                        <span className="text-[10px] text-zinc-400">Total Revenue: ₹{product.total_revenue.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-zinc-600 dark:text-zinc-200 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                                        {product.quantity} Qty
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center">
                                <p className="text-zinc-500 text-sm">No products found for this customer.</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Order History */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-0 overflow-hidden">
                        <div className="p-6 border-b dark:border-zinc-800">
                            <h4 className="text-sm text-zinc-600 dark:text-zinc-200 font-semibold uppercase tracking-widest text-zinc-900 dark:text-white">Order History</h4>
                        </div>
                        <DataTable
                            data={orders || []}
                            columns={orderColumns}
                            isLoading={isLoadingOrders}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
