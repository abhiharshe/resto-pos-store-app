import { useState, useMemo } from 'react';
import Container from '../../../components/shared/Container';
import { DataTable } from '../../../components/common/DataTable';
import Button from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import { ColumnDef } from '@tanstack/react-table';
import {
    ApprovalRequest,
    useApprovals,
    useApprovalStats,
    useApproveRequest,
} from '../api/approvalsApi';
import { useStores } from '../../stores/api/storesApi';
import { useAppSelector } from '../../../app/hooks';
import ApprovalStatusBadge from '../components/ApprovalStatusBadge';
import ApprovalDetailModal from '../components/ApprovalDetailModal';
import toast from 'react-hot-toast';
import moment from 'moment';

const entityIcons: Record<string, string> = {
    MENU_ITEM: 'ri-restaurant-line text-emerald-500',
    CATEGORY: 'ri-folders-line text-blue-500',
    DEAL: 'ri-percent-line text-amber-500',
    COUPON: 'ri-price-tag-3-line text-purple-500',
    PROMOTION: 'ri-megaphone-line text-rose-500',
};

const actionBadgeStyles: Record<string, string> = {
    CREATE: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    UPDATE: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    DELETE: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
};

const ApprovalList = () => {
    const { user } = useAppSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const [selectedStoreId, setSelectedStoreId] = useState<string>('');
    const [selectedEntityType, setSelectedEntityType] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
    const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { data: stores } = useStores();
    const { data: stats, isLoading: isStatsLoading } = useApprovalStats(
        isSuperAdmin ? (selectedStoreId || undefined) : user?.store_id
    );

    const { data: approvals, isLoading } = useApprovals({
        store_id: isSuperAdmin ? (selectedStoreId || undefined) : user?.store_id,
        entity_type: selectedEntityType || undefined,
        status: selectedStatus || undefined,
    });

    const approveMutation = useApproveRequest();

    const handleQuickApprove = async (e: React.MouseEvent, req: ApprovalRequest) => {
        e.stopPropagation();
        try {
            await approveMutation.mutateAsync(req.id);
            toast.success(`Approved ${req.entity_type.toLowerCase().replace('_', ' ')} successfully!`);
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to approve request.');
        }
    };

    const handleOpenDetail = (req: ApprovalRequest) => {
        setSelectedRequest(req);
        setIsDetailOpen(true);
    };

    const columns: ColumnDef<ApprovalRequest>[] = useMemo(() => [
        {
            accessorKey: 'entity_type',
            header: 'Entity',
            cell: (info) => {
                const type = info.getValue() as string;
                const icon = entityIcons[type] || 'ri-file-list-line text-zinc-500';
                return (
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            <i className={`${icon} text-lg`} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-neutral-900 dark:text-white capitalize text-sm">
                                {type.toLowerCase().replace('_', ' ')}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono truncate max-w-[140px]">
                                {info.row.original.entity_name || info.row.original.entity_id || 'New Record'}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Action',
            cell: (info) => {
                const action = info.getValue() as string;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${actionBadgeStyles[action] || ''}`}>
                        {action}
                    </span>
                );
            },
        },
        {
            accessorKey: 'store_name',
            header: 'Store',
            cell: (info) => (
                <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    <i className="ri-store-2-line text-zinc-400 text-xs" />
                    <span>{info.getValue() as string || info.row.original.store_id || 'N/A'}</span>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => (
                <ApprovalStatusBadge
                    status={info.getValue() as string}
                    rejectionReason={info.row.original.rejection_reason}
                />
            ),
        },
        {
            accessorKey: 'submitter_name',
            header: 'Submitted By',
            cell: (info) => (
                <div className="flex flex-col text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {info.getValue() as string || 'Staff'}
                    </span>
                    <span className="text-zinc-400">
                        {info.row.original.created_at ? moment(info.row.original.created_at).fromNow() : '-'}
                    </span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Review',
            cell: (info) => {
                const req = info.row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetail(req)}
                        >
                            <i className="ri-eye-line mr-1 text-sm" />
                            {isSuperAdmin && req.status === 'PENDING' ? 'Review' : 'View'}
                        </Button>
                        {isSuperAdmin && req.status === 'PENDING' && (
                            <Button
                                variant="primary"
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={(e) => handleQuickApprove(e, req)}
                                isLoading={approveMutation.isPending}
                            >
                                <i className="ri-check-line" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ], [isSuperAdmin, approveMutation.isPending]);

    return (
        <Container>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2.5">
                        <i className="ri-shield-check-line text-primary" />
                        Approvals & Change Management
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                        {isSuperAdmin
                            ? 'Review, verify, and approve store-created menu items, deals, coupons, and promotions.'
                            : 'Track the approval status of your store’s submissions and change requests.'}
                    </p>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div
                    onClick={() => { setSelectedEntityType(''); setSelectedStatus('PENDING'); }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${selectedStatus === 'PENDING' && !selectedEntityType
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                        : 'bg-white dark:bg-mauve-900 border-mauve-200 dark:border-mauve-800 hover:border-amber-400/50'
                        }`}
                >
                    <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Pending</span>
                        <i className="ri-hourglass-2-line text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
                        {isStatsLoading ? '-' : stats?.total_pending ?? 0}
                    </div>
                </div>

                <div
                    onClick={() => { setSelectedEntityType('MENU_ITEM'); setSelectedStatus('PENDING'); }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${selectedEntityType === 'MENU_ITEM'
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                        : 'bg-white dark:bg-mauve-900 border-mauve-200 dark:border-mauve-800 hover:border-emerald-400/50'
                        }`}
                >
                    <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Items</span>
                        <i className="ri-restaurant-line text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
                        {isStatsLoading ? '-' : stats?.menu_items_pending ?? 0}
                    </div>
                </div>

                <div
                    onClick={() => { setSelectedEntityType('CATEGORY'); setSelectedStatus('PENDING'); }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${selectedEntityType === 'CATEGORY'
                        ? 'bg-blue-500/10 border-blue-500/40 shadow-sm'
                        : 'bg-white dark:bg-mauve-900 border-mauve-200 dark:border-mauve-800 hover:border-blue-400/50'
                        }`}
                >
                    <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Categories</span>
                        <i className="ri-folders-line text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
                        {isStatsLoading ? '-' : stats?.categories_pending ?? 0}
                    </div>
                </div>

                <div
                    onClick={() => { setSelectedEntityType('DEAL'); setSelectedStatus('PENDING'); }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${selectedEntityType === 'DEAL'
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                        : 'bg-white dark:bg-mauve-900 border-mauve-200 dark:border-mauve-800 hover:border-amber-400/50'
                        }`}
                >
                    <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Deals</span>
                        <i className="ri-percent-line text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
                        {isStatsLoading ? '-' : stats?.deals_pending ?? 0}
                    </div>
                </div>

                <div
                    onClick={() => { setSelectedEntityType('COUPON'); setSelectedStatus('PENDING'); }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${selectedEntityType === 'COUPON'
                        ? 'bg-purple-500/10 border-purple-500/40 shadow-sm'
                        : 'bg-white dark:bg-mauve-900 border-mauve-200 dark:border-mauve-800 hover:border-purple-400/50'
                        }`}
                >
                    <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Coupons</span>
                        <i className="ri-price-tag-3-line text-purple-500" />
                    </div>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
                        {isStatsLoading ? '-' : stats?.coupons_pending ?? 0}
                    </div>
                </div>

                <div
                    onClick={() => { setSelectedEntityType('PROMOTION'); setSelectedStatus('PENDING'); }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${selectedEntityType === 'PROMOTION'
                        ? 'bg-rose-500/10 border-rose-500/40 shadow-sm'
                        : 'bg-white dark:bg-mauve-900 border-mauve-200 dark:border-mauve-800 hover:border-rose-400/50'
                        }`}
                >
                    <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Promotions</span>
                        <i className="ri-megaphone-line text-rose-500" />
                    </div>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
                        {isStatsLoading ? '-' : stats?.promotions_pending ?? 0}
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-mauve-900 rounded-2xl border border-mauve-200 dark:border-mauve-800 shadow-sm">
                {isSuperAdmin && (
                    <div className="w-full sm:w-56">
                        <Select
                            placeholder="All Stores"
                            options={[
                                { label: 'All Stores', value: '' },
                                ...(stores?.map((s) => ({ label: s.name, value: s.id })) || []),
                            ]}
                            value={selectedStoreId}
                            onChange={(val) => setSelectedStoreId(val as string)}
                        />
                    </div>
                )}

                <div className="w-full sm:w-48">
                    <Select
                        placeholder="All Entity Types"
                        options={[
                            { label: 'All Entities', value: '' },
                            { label: 'Menu Items', value: 'MENU_ITEM' },
                            { label: 'Categories', value: 'CATEGORY' },
                            { label: 'Deals', value: 'DEAL' },
                            { label: 'Coupons', value: 'COUPON' },
                            { label: 'Promotions', value: 'PROMOTION' },
                        ]}
                        value={selectedEntityType}
                        onChange={(val) => setSelectedEntityType(val as string)}
                    />
                </div>

                <div className="w-full sm:w-44">
                    <Select
                        placeholder="All Statuses"
                        options={[
                            { label: 'Pending Only', value: 'PENDING' },
                            { label: 'Approved Only', value: 'APPROVED' },
                            { label: 'Rejected Only', value: 'REJECTED' },
                            { label: 'All Statuses', value: '' },
                        ]}
                        value={selectedStatus}
                        onChange={(val) => setSelectedStatus(val as string)}
                    />
                </div>

                {(selectedStoreId || selectedEntityType || selectedStatus !== 'PENDING') && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        onClick={() => {
                            setSelectedStoreId('');
                            setSelectedEntityType('');
                            setSelectedStatus('PENDING');
                        }}
                    >
                        <i className="ri-refresh-line mr-1" /> Reset Filters
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="border border-mauve-200 dark:border-mauve-800 rounded-2xl overflow-hidden bg-white dark:bg-mauve-900 shadow-sm">
                <DataTable
                    data={approvals || []}
                    columns={columns}
                    isLoading={isLoading}
                />
            </div>

            {/* Approval Detail Modal */}
            <ApprovalDetailModal
                request={selectedRequest}
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedRequest(null);
                }}
                canReview={isSuperAdmin}
            />
        </Container>
    );
};

export default ApprovalList;
