import { ColumnDef } from '@tanstack/react-table';
import { useOrders, useUpdateOrderStatus, useDeleteOrder, Order, OrderFilters } from '../api/ordersApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useStores } from '../../stores/api/storesApi';
import { useAppSelector } from '../../../app/hooks';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import IconButton from '../../../components/common/IconButton';
import { useState, useMemo } from 'react';
import { Select } from '../../../components/common/Select';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { toast } from 'react-hot-toast';
import Datepicker from "react-tailwindcss-datepicker";

const OrderList = () => {
    const { user } = useAppSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const { data: stores } = useStores();
    const navigate = useNavigate();

    // Default: Super admin can see all stores (store_id: undefined), non-super admin defaults to their store
    const [filters, setFilters] = useState<OrderFilters>({
        store_id: isSuperAdmin ? undefined : user?.store_id || undefined,
        status: '',
        order_type: '',
        payment_method: '',
        from_date: '',
        to_date: '',
    });

    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [dateValue, setDateValue] = useState({
        startDate: null,
        endDate: null
    });

    const handleDateChange = (newValue: any) => {
        setDateValue(newValue);
        setFilters((prev: any) => ({
            ...prev,
            from_date: newValue?.startDate ? moment(newValue.startDate).format('YYYY-MM-DD 00:00:00') : '',
            to_date: newValue?.endDate ? moment(newValue.endDate).format('YYYY-MM-DD 23:59:59') : '',
        }));
    };

    const { data: orders, isLoading } = useOrders(filters);
    const deleteOrderMutation = useDeleteOrder();

    const selectedStore = stores?.find(s => s.id === filters.store_id);

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            store_id: isSuperAdmin ? undefined : user?.store_id || undefined,
            status: '',
            order_type: '',
            payment_method: '',
            from_date: '',
            to_date: '',
        });
        setDateValue({ startDate: null, endDate: null });
    };

    const handleViewOrder = (id: number) => {
        navigate(`/orders/${id}`);
    };

    const handleDeleteOrder = async () => {
        if (deleteId) {
            try {
                await deleteOrderMutation.mutateAsync(deleteId);
                toast.success('Order deleted successfully');
                setDeleteId(null);
            } catch (error) {
                toast.error('Failed to delete order');
            }
        }
    };

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: 'order_number',
            header: 'Order #',
            cell: (info) => (
                <div className='flex flex-col items-start'>
                    <span className="font-bold text-zinc-900 dark:text-white">{info.getValue() as string || `#${info.row.original.id}`}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-24">{info.row.original.store?.name}</span>
                </div>
            )
        },
        {
            header: 'Customer',
            cell: (info) => info.row.original.guest_name || info.row.original.customer?.full_name || 'Guest'
        },
        {
            accessorKey: 'subtotal',
            header: 'Subtotal',
            cell: (info) => {
                const val = info.row.original.subtotal ?? info.row.original.sub_total ?? (info.row.original.total_amount - info.row.original.tax_amount - info.row.original.service_charge + info.row.original.discount_amount);
                return <span className="font-medium text-zinc-600 dark:text-zinc-400">{selectedStore?.currency || 'Rs.'}{val.toFixed(2)}</span>;
            }
        },
        {
            accessorKey: 'tax_amount',
            header: 'Tax',
            cell: (info) => <span className="text-zinc-500 dark:text-zinc-400">{selectedStore?.currency || 'Rs.'}{(info.getValue() as number || 0).toFixed(2)}</span>
        },
        {
            accessorKey: 'total_amount',
            header: 'Total',
            cell: (info) => <span className="font-bold text-zinc-900 dark:text-white">{selectedStore?.currency || 'Rs.'}{(info.getValue() as number).toFixed(2)}</span>
        },
        {
            accessorKey: 'payment_method',
            header: 'Payment',
            cell: (info) => {
                const order = info.row.original;
                return (
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">{order.payment_method}</span>
                        {order.payment_method === 'CASH' && order.cash_received != null && (
                            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                                Rec: {selectedStore?.currency || 'Rs.'}{order.cash_received.toFixed(2)} | Change: {selectedStore?.currency || 'Rs.'}{(order.change_amount ?? order.change ?? 0).toFixed(2)}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => <StatusBadge status={info.getValue() as string} />
        },
        {
            accessorKey: 'order_type',
            header: 'Type',
            cell: (info) => <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{info.getValue() as string}</span>
        },
        {
            accessorKey: 'created_at',
            header: 'Time',
            cell: (info) => moment(info.getValue() as string).fromNow()
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (info) => {
                const status = info.row.original.status;
                const canDelete = ['DRAFT', 'PENDING'].includes(status);

                return (
                    <div className="flex items-center gap-2">
                        <IconButton
                            icon="ri-eye-line"
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(info.row.original.id as any)}
                            title="View Details"
                        />
                        {canDelete && (
                            <IconButton
                                icon="ri-delete-bin-line"
                                variant="danger"
                                size="sm"
                                onClick={() => setDeleteId(info.row.original.id as any)}
                                title="Delete Order"
                                disabled={deleteOrderMutation.isPending}
                            />
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-6 transition-all duration-300 ease-in-out">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Order History</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Manage and track all orders across stores.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={isFilterVisible ? 'secondary' : 'outline'}
                        icon="ri-filter-3-line"
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                    >
                        {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    <IconButton
                        icon="ri-refresh-line"
                        variant="ghost"
                        onClick={() => window.location.reload()}
                        title="Refresh List"
                    />
                </div>
            </div>

            {isFilterVisible && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border dark:border-zinc-700 animate-in slide-in-from-top-2 duration-200">
                    {isSuperAdmin && (
                        <Select
                            label="Store"
                            placeholder="All Stores"
                            options={[
                                { label: 'All Stores', value: '' },
                                ...(stores?.map(s => ({ label: s.name, value: s.id })) || []),
                            ]}
                            value={filters.store_id || ''}
                            onChange={(val) => handleFilterChange('store_id', val || undefined)}
                        />
                    )}
                    <Select
                        label="Status"
                        placeholder="All Status"
                        options={[
                            { label: 'Pending', value: 'PENDING' },
                            { label: 'Confirmed', value: 'CONFIRMED' },
                            { label: 'Preparing', value: 'PREPARING' },
                            { label: 'Ready', value: 'READY' },
                            { label: 'Completed', value: 'COMPLETED' },
                            { label: 'Cancelled', value: 'CANCELLED' },
                            { label: 'Draft', value: 'DRAFT' },
                        ]}
                        value={filters.status}
                        onChange={(val) => handleFilterChange('status', val)}
                    />
                    <Select
                        label="Order Type"
                        placeholder="All Types"
                        options={[
                            { label: 'Dine In', value: 'DINE_IN' },
                            { label: 'Pickup', value: 'PICKUP' },
                            { label: 'Delivery', value: 'DELIVERY' },
                        ]}
                        value={filters.order_type}
                        onChange={(val) => handleFilterChange('order_type', val)}
                    />
                    <Select
                        label="Payment"
                        placeholder="All Methods"
                        options={[
                            { label: 'Cash', value: 'CASH' },
                            { label: 'Card', value: 'CARD' },
                            { label: 'Online', value: 'ONLINE' },
                        ]}
                        value={filters.payment_method}
                        onChange={(val) => handleFilterChange('payment_method', val)}
                    />
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date Range</label>
                        <Datepicker
                            value={dateValue}
                            onChange={handleDateChange}
                            showFooter={true}
                            displayFormat={"DD/MM/YYYY"}
                            inputClassName="w-full text-sm font-medium bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                            containerClassName="relative"
                        />
                        <button
                            onClick={clearFilters}
                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 text-right mt-1 pr-1"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            <div className='border border-zinc-200 dark:border-zinc-700 rounded-lg'>
                <DataTable data={orders || []} columns={columns} isLoading={isLoading} />
            </div>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDeleteOrder}
                title="Delete Order"
                description="Are you sure you want to delete this order? This action cannot be undone."
                variant="danger"
                confirmText="Delete"
                isLoading={deleteOrderMutation.isPending}
            />
        </div>
    );
};

export default OrderList;